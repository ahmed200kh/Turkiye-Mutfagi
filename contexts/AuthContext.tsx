// contexts/AuthContext.tsx
// Bu dosya, uygulama genelinde kullanıcı oturum durumunu (Authentication State) yöneten Context yapısını içerir.
// Firebase Authentication servisleri ile entegre çalışır ve kullanıcı verilerini tüm bileşenlere sağlar.

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// API servis katmanından gerekli kimlik doğrulama ve kullanıcı işlemi fonksiyonlarını içe aktar
import { apiLogin, apiSignup, apiLogout, getUserProfile, apiToggleFavorite } from '../services/apiService';
// Firebase Authentication ana servisini ve durum dinleyicisini içe aktar
import { auth } from '../services/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

/**
 * AppUser Arayüzü
 * Uygulama içinde kullanılan zenginleştirilmiş kullanıcı veri modelini tanımlar.
 * Firebase User nesnesine ek olarak Firestore'dan gelen ek bilgileri (favoriler vb.) içerir.
 */
interface AppUser {
    uid: string; // Benzersiz Kullanıcı Kimliği
    email: string; // E-posta Adresi
    username: string; // Kullanıcı Adı (Display Name)
    favorites: number[]; // Favori tariflerin ID listesi
}

/**
 * AuthContextType Arayüzü
 * Context üzerinden dışarıya sunulan değerlerin ve fonksiyonların tip tanımlamaları.
 */
interface AuthContextType {
    user: AppUser | null; // Oturum açmış kullanıcı nesnesi (veya null)
    loading: boolean; // İlk yükleme ve oturum kontrolü durumu
    login: (email: string, password: string) => Promise<void>; // Giriş yapma fonksiyonu
    signup: (username: string, email: string, password: string) => Promise<void>; // Kayıt olma fonksiyonu
    logout: () => Promise<void>; // Çıkış yapma fonksiyonu
    toggleFavorite: (recipeId: number) => Promise<void>; // Favori ekleme/çıkarma fonksiyonu
}

// Context oluşturma (Başlangıç değeri null)
export const AuthContext = createContext<AuthContextType | null>(null);

// Custom Hook: Bileşenlerde AuthContext'e kolay erişim sağlar
export const useAuth = () => {
    return useContext(AuthContext) as AuthContextType;
};

interface AuthProviderProps {
    children: ReactNode;
}

/**
 * AuthProvider Bileşeni
 * Uygulamanın en üst katmanında yer alarak tüm alt bileşenlere kimlik doğrulama durumunu sağlar.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true); // Yüklenme durumu varsayılan olarak true başlar

    /**
     * useEffect - Oturum Durumu Dinleyicisi
     * Firebase'in onAuthStateChanged olayını dinleyerek oturum açma/kapama durumlarını anlık takip eder.
     */
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                // Kullanıcı oturum açmışsa, Firestore'dan ek profil bilgilerini (username, favorites) getir
                const userProfile = await getUserProfile(firebaseUser.uid);
                
                if (userProfile) {
                    // Firebase Auth ve Firestore verilerini birleştirerek AppUser nesnesini oluştur
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email || userProfile.email,
                        username: userProfile.username,
                        favorites: userProfile.favorites || [] // Favori listesi yoksa boş dizi ata
                    });
                } else {
                    console.error("Kullanıcı Auth servisinde mevcut, ancak Firestore kaydı bulunamadı.");
                    setUser(null);
                }
            } else {
                // Kullanıcı oturum açmamışsa state'i temizle
                setUser(null);
            }
            setLoading(false); // İlk kontrol tamamlandı, yükleme durumunu kapat
        });
        
        // Component unmount olduğunda dinleyiciyi temizle (Cleanup Function)
        return () => unsubscribe();
    }, []);

    // --- Servis Fonksiyonlarını Sarmalayan Yöntemler (Wrapper Methods) ---

    const login = async (email: string, password: string) => {
        await apiLogin(email, password);
    };

    const signup = async (username: string, email: string, password: string) => {
        await apiSignup(username, email, password);
    };

    const logout = async () => {
        await apiLogout();
    };

    /**
     * toggleFavorite - Favori Durumu Yönetimi
     * Bir tarifi favorilere ekler veya favorilerden çıkarır.
     * @param recipeId - İşlem yapılacak tarifin ID'si.
     */
    const toggleFavorite = async (recipeId: number) => {
        if (!user) {
            alert("Favori işlemi yapmak için önce giriş yapmalısınız.");
            return;
        }

        try {
            // 1. Veritabanı güncellemesi için API isteği gönder
            const updatedFavorites = await apiToggleFavorite(user.uid, recipeId);
            
            // 2. "Optimistic Update" (İyimser Güncelleme) Yaklaşımı:
            // Sunucudan güncel liste döner dönmez yerel state'i güncelle.
            // Bu sayede kullanıcı arayüzü anında tepki verir.
            setUser(currentUser => {
                if (!currentUser) return null;
                return {
                    ...currentUser,
                    favorites: updatedFavorites
                };
            });

        } catch (error) {
            console.error("Favori durumu güncellenemedi:", error);
            alert("İşlem sırasında bir hata oluştu.");
        }
    };

    // Context üzerinden sağlanacak değerler paketi
    const value = {
        user,
        loading,
        login,
        signup,
        logout,
        toggleFavorite
    };

    return (
        <AuthContext.Provider value={value}>
            {/* Yükleme devam ediyorsa çocuk bileşenleri render etme */}
            {!loading && children}
        </AuthContext.Provider>
    );
};