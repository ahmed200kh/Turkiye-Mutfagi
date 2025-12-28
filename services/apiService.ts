// services/apiService.ts
// Bu modül, uygulamanın arka uç (backend) servisleri ile olan iletişimini yönetir.
// Firebase Authentication ve Firestore veritabanı işlemleri burada merkezileştirilmiştir.

import { auth, db } from './firebase';
import { type Recipe, type Rating } from '../types';

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail // ! [YENİ] Şifre sıfırlama fonksiyonu
} from 'firebase/auth';
import {
    doc,
    setDoc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    deleteDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    serverTimestamp,
    Timestamp,
    QuerySnapshot,
    DocumentData,
    documentId
} from 'firebase/firestore';

/**
 * UserProfile Arayüzü
 * Firestore 'users' koleksiyonunda saklanan kullanıcı verilerinin şemasını tanımlar.
 */
interface UserProfile {
    uid: string;
    username: string;
    email: string;
    favorites: number[];
}

// --- Kimlik Doğrulama Servisleri (Authentication Services) ---

/**
 * apiSignup - Yeni Kullanıcı Kaydı
 * Firebase Auth üzerinde yeni bir kullanıcı oluşturur ve eş zamanlı olarak
 * Firestore veritabanında bir kullanıcı profili belgesi yaratır.
 * * @param username - Kullanıcı adı
 * @param email - E-posta adresi
 * @param password - Şifre
 * @returns Oluşturulan kullanıcı profili nesnesi
 */
export const apiSignup = async (username: string, email: string, password: string): Promise<UserProfile> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Firestore için varsayılan profil yapısını oluştur
        const userProfile: UserProfile = {
            uid: user.uid,
            username: username,
            email: user.email || email,
            favorites: [], // Başlangıçta favori listesi boştur
        };
        
        // Kullanıcı ID'si ile dökümanı kaydet
        await setDoc(doc(db, 'users', user.uid), userProfile);
        return userProfile;
    } catch (error: any) {
        // Firebase hata kodlarını kullanıcı dostu mesajlara çevir
        if (error.code === 'auth/email-already-in-use') {
            throw new Error('Bu e-posta adresi zaten kullanımda.');
        } else if (error.code === 'auth/weak-password') {
            throw new Error('Şifre çok zayıf (en az 6 karakter olmalı).');
        }
        console.error("Kayıt işlemi sırasında hata:", error);
        throw new Error('Hesap oluşturulurken bir hata meydana geldi.');
    }
};

/**
 * apiLogin - Kullanıcı Girişi
 * Mevcut bir kullanıcının sisteme giriş yapmasını sağlar ve profil verilerini getirir.
 */
export const apiLogin = async (email: string, password: string): Promise<UserProfile> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Giriş başarılıysa profil verilerini çek
        const userProfile = await getUserProfile(user.uid);
        if (!userProfile) {
            throw new Error('Kullanıcı profili bulunamadı.');
        }
        return userProfile;
    } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            throw new Error('E-posta adresi veya şifre hatalı.');
        }
        console.error("Giriş işlemi sırasında hata:", error);
        throw new Error('Giriş yapılırken bir hata meydana geldi.');
    }
};

/**
 * apiLogout - Oturumu Kapat
 * Aktif kullanıcı oturumunu sonlandırır.
 */
export const apiLogout = async (): Promise<void> => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Çıkış işlemi sırasında hata:", error);
        throw new Error('Oturum kapatılırken bir hata meydana geldi.');
    }
};

/**
 * getUserProfile - Profil Getirme
 * Verilen UID (User ID) değerine göre Firestore'dan kullanıcı detaylarını okur.
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
        const userDocRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const data = userDoc.data();
            return {
                uid: data.uid,
                username: data.username,
                email: data.email,
                favorites: data.favorites || [] 
            } as UserProfile;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Profil verisi alınırken hata:", error);
        return null;
    }
};

/**
 * apiToggleFavorite - Favori Durumu Değiştirme
 * Bir tarifi kullanıcının favori listesine ekler veya listeden çıkarır.
 * Atomik 'arrayUnion' ve 'arrayRemove' işlemleri kullanılarak veri bütünlüğü korunur.
 */
export const apiToggleFavorite = async (uid: string, recipeId: number): Promise<number[]> => {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
        throw new Error("Kullanıcı bulunamadı.");
    }
    const userData = userDoc.data();
    const currentFavorites: number[] = userData.favorites || [];
    let updatedFavorites: number[];
    
    // Tarif listede varsa çıkar, yoksa ekle
    if (currentFavorites.includes(recipeId)) {
        updatedFavorites = currentFavorites.filter(id => id !== recipeId);
        await updateDoc(userDocRef, {
            favorites: arrayRemove(recipeId)
        });
    } else {
        updatedFavorites = [...currentFavorites, recipeId];
        await updateDoc(userDocRef, {
            favorites: arrayUnion(recipeId)
        });
    }
    return updatedFavorites;
};

// --- Değerlendirme ve Yorum İşlemleri (Ratings Logic) ---

/**
 * processRatings - Yardımcı Fonksiyon
 * Firestore'dan dönen ham veriyi (Snapshot) uygulama içinde kullanılan 'Rating' tipine dönüştürür.
 */
const processRatings = (snapshot: QuerySnapshot<DocumentData, DocumentData>): Rating[] => {
    return snapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(); 
        return {
            id: doc.id,
            ...data,
            createdAt: createdAt
        } as Rating;
    });
};

/**
 * getRatingsForRecipe - Tarife Göre Yorum Getirme
 * Belirli bir tarif ID'sine yapılan tüm yorumları getirir.
 */
export const getRatingsForRecipe = async (recipeId: number): Promise<Rating[]> => {
    const ratingsCol = collection(db, 'ratings');
    const q = query(ratingsCol, where('recipeId', '==', recipeId));
    const querySnapshot = await getDocs(q);
    return processRatings(querySnapshot);
};

/**
 * getRatingsForUser - Kullanıcıya Göre Yorum Getirme
 * Belirli bir kullanıcının yaptığı tüm yorumları getirir.
 */
export const getRatingsForUser = async (userId: string): Promise<Rating[]> => {
    const ratingsCol = collection(db, 'ratings');
    const q = query(ratingsCol, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return processRatings(querySnapshot);
};

/**
 * addRating - Yorum Ekleme
 * Veritabanına yeni bir yorum ve puan kaydı ekler.
 * @param recipeId - Tarifin ID'si
 * @param userId - Kullanıcının ID'si (UID)
 * @param username - Kullanıcının adı
 * @param rating - Verilen puan (1-5)
 * @param comment - Kullanıcının yorumu
 */
export const addRating = async (recipeId: number, userId: string, username: string, rating: number, comment: string): Promise<void> => {
    // Girdi validasyonu
    if (!userId || typeof userId !== 'string' || userId.length === 0) {
        throw new Error("Geçersiz kullanıcı kimliği.");
    }
    
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        throw new Error("Puan 1 ile 5 arasında bir tam sayı olmalıdır.");
    }
    
    if (comment && typeof comment === 'string' && comment.length > 1000) {
        throw new Error("Yorum 1000 karakterden uzun olamaz.");
    }
    
    if (typeof recipeId !== 'number' || recipeId < 0) {
        throw new Error("Geçersiz tarif ID'si.");
    }

    await addDoc(collection(db, 'ratings'), {
        recipeId,
        userId,
        username,
        rating,
        comment,
        createdAt: serverTimestamp() // Sunucu zaman damgası
    });
};

/**
 * deleteRating - Yorum Silme (Yetkilendirme ile)
 * Belirtilen ID'ye sahip yorumu veritabanından siler.
 * Yalnızca yorum sahibi yorumu silebilir.
 * @param ratingId - Silinecek yorumun ID'si
 * @param userId - İsteği yapan kullanıcının ID'si (doğrulama için)
 */
export const deleteRating = async (ratingId: string, userId: string): Promise<void> => {
    // Girdi validasyonu
    if (!ratingId || typeof ratingId !== 'string' || ratingId.length === 0) {
        throw new Error("Geçersiz yorum ID'si.");
    }
    
    if (!userId || typeof userId !== 'string' || userId.length === 0) {
        throw new Error("Geçersiz kullanıcı kimliği.");
    }

    // Yorum kaydını getir ve sahiplik kontrolü yap
    const ratingDocRef = doc(db, 'ratings', ratingId);
    const ratingDoc = await getDoc(ratingDocRef);
    
    if (!ratingDoc.exists()) {
        throw new Error("Yorum bulunamadı.");
    }
    
    const ratingData = ratingDoc.data();
    
    // Yalnızca yorum sahibi silebilir
    if (ratingData.userId !== userId) {
        throw new Error("Bu yorumu silmeye yetkiniz yok. Yalnızca kendi yorumlarınızı silebilirsiniz.");
    }
    
    await deleteDoc(ratingDocRef);
};

// --- Tarif Veri İşlemleri (Recipe Data Operations) ---

/**
 * getRecipesByType - Kategoriye Göre Tarif Getirme
 * 'main' (Ana Yemek) veya 'dessert' (Tatlı) kategorisindeki tarifleri listeler.
 */
export const getRecipesByType = async (type: 'main' | 'dessert'): Promise<Recipe[]> => {
    const recipesCol = collection(db, 'recipes');
    const q = query(recipesCol, where('type', '==', type));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Recipe);
};

/**
 * getRecipesByIds - ID Listesine Göre Toplu Getirme
 * Bir ID dizisi (örn: favoriler) alır ve bu ID'lere sahip tarifleri getirir.
 * Firestore 'in' sorgusu limitasyonları nedeniyle (maksimum 30), sorgular parçalı (batch) olarak yapılır.
 */
export const getRecipesByIds = async (ids: number[]): Promise<Recipe[]> => {
    if (ids.length === 0) {
        return [];
    }
    const recipes: Recipe[] = [];
    const recipesCol = collection(db, 'recipes');
    for (let i = 0; i < ids.length; i += 30) {
        const batchIds = ids.slice(i, i + 30);
        const batchStringIds = batchIds.map(id => String(id));
        // Belge ID'sine (Document ID) göre sorgulama yapılır
        const q = query(recipesCol, where(documentId(), 'in', batchStringIds));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(doc => {
            recipes.push(doc.data() as Recipe);
        });
    }
    return recipes;
};

/**
 * getRecipeDocById - Tekil Tarif Getirme
 * Belirli bir ID'ye sahip tek bir tarifi getirir.
 */
export const getRecipeDocById = async (id: number): Promise<Recipe | null> => {
    const docRef = doc(db, 'recipes', String(id));
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as Recipe;
    } else {
        console.warn(`Recipe with id ${id} not found in Firestore.`);
        return null;
    }
};

// ----------------------------------------------------
// ! [YENİ] Şifre Sıfırlama Fonksiyonu
// ----------------------------------------------------
/**
 * apiSendPasswordResetEmail - Şifre Sıfırlama E-postası
 * Kullanıcının e-posta adresine şifre yenileme bağlantısı gönderir.
 * @param email - Şifre sıfırlanacak e-posta adresi
 */
export const apiSendPasswordResetEmail = async (email: string): Promise<void> => {
    // E-posta validasyonu
    if (!email || typeof email !== 'string') {
        throw new Error('Geçerli bir e-posta adresi girin.');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Geçersiz e-posta formatı.');
    }

    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
        console.error("Şifre sıfırlama e-postası gönderilemedi:", error);
        if (error.code === 'auth/user-not-found') {
            throw new Error('Bu e-posta adresine sahip bir kullanıcı bulunamadı.');
        } else if (error.code === 'auth/invalid-email') {
            throw new Error('Geçersiz e-posta adresi.');
        } else if (error.code === 'auth/too-many-requests') {
            throw new Error('Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.');
        }
        throw new Error('Şifre sıfırlama e-postası gönderilirken bir hata oluştu.');
    }
};