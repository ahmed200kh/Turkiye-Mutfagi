// services/firebase.ts
// Bu modül, uygulamanın Firebase bulut altyapısı ile olan bağlantısını başlatır ve yapılandırır.
// Authentication (Kimlik Doğrulama) ve Firestore (Veritabanı) servislerinin global örneklerini oluşturur.

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase Yapılandırma Nesnesi (Configuration Object)
 * -----------------------------------------------------------------------
 * Uygulamanın Firebase projesine bağlanabilmesi için gerekli olan kimlik bilgilerini içerir.
 * Güvenlik ve esneklik amacıyla, bu değerler doğrudan kod içine yazılmamış (hardcoded),
 * bunun yerine Vite ortam değişkenlerinden (Environment Variables) dinamik olarak çekilmiştir.
 */
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    // ...
};

// Firebase uygulamasının belirtilen yapılandırma ile başlatılması (Initialization)
const app = initializeApp(firebaseConfig);

// Authentication Servisi: Kullanıcı giriş/çıkış ve kayıt işlemlerini yönetmek için dışa aktarılır.
export const auth = getAuth(app);

// Firestore Servisi: NoSQL veritabanı okuma/yazma işlemleri için dışa aktarılır.
export const db = getFirestore(app);