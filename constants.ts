// constants.ts
// Uygulamada kullanılan sabit değerler ve konfigürasyonlar merkezi olarak tanımlanır.
// Bu, kod içinde "magic numbers" ve "magic strings" kullanımını ortadan kaldırır.

// --- PAGINATION VE LİSTELEME SABİTLERİ ---
export const RECIPES_INITIAL_VISIBLE_COUNT = 10; // İlk yüklemede gösterilecek tarif sayısı
export const RECIPES_LOAD_MORE_COUNT = 5; // Daha Fazla Yükle'ye tıklandığında eklenecek tarif sayısı
export const MAX_TIME_FILTER_MINUTES = 240; // Maksimum süre filtresi (dakika)

// --- FORM VE VALIDASYON SABİTLERİ ---
export const MIN_PASSWORD_LENGTH = 6; // Minimum şifre uzunluğu
export const MAX_USERNAME_LENGTH = 50; // Maksimum kullanıcı adı uzunluğu
export const MAX_COMMENT_LENGTH = 1000; // Maksimum yorum uzunluğu
export const MAX_INGREDIENTS_TEXT_LENGTH = 500; // Malzeme giriş alanı maksimum uzunluğu
export const MAX_CHATBOT_MESSAGE_LENGTH = 2000; // Chatbot mesajı maksimum uzunluğu

// --- RATING VE PUANLAMA ---
export const MIN_RATING = 1; // Minimum puan
export const MAX_RATING = 5; // Maksimum puan
export const DEFAULT_RATING = 3; // Varsayılan puan

// --- AI CHEF SABİTLERİ ---
export const AI_SUGGESTION_COUNT_OPTIONS = [1, 2, 3, 4, 5];
export const AI_DEFAULT_SUGGESTION_COUNT = 3; // Varsayılan öneri sayısı
export const AI_LOADING_MESSAGE_INTERVAL = 3000; // Mesaj değiştirme aralığı (ms)
export const AI_RECIPE_TYPES = ['Ana Yemek', 'Tatlı'] as const;
export const AI_INGREDIENT_STRICTNESS_OPTIONS = ['strict', 'flexible'] as const;

// --- CHATBOT SABİTLERİ ---
export const CHATBOT_INITIAL_MESSAGE = "Merhaba! Ben Akıllı Yardımcı. Türk mutfağıyla ilgili ne merak ediyorsun? Örneğin, 'bana bir tavuk tarifi öner' diyebilirsin.";
export const CHATBOT_ERROR_MESSAGE = "Üzgünüm, şu anda bir sorunla karşılaştım. Lütfen daha sonra tekrar deneyin.";
export const CHATBOT_RATE_LIMIT_MESSAGE = "Çok fazla istek gönderildi. Lütfen biraz sonra tekrar deneyin.";
export const CHATBOT_SERVICE_ERROR_MESSAGE = "Sohbet servisi şu anda kullanılamıyor. Lütfen daha sonra deneyin.";

// --- TIMEOUT VE GECIKME SABİTLERİ ---
export const API_REQUEST_TIMEOUT = 30000; // API isteği timeout (ms)
export const DEBOUNCE_SEARCH_DELAY = 300; // Arama debounce süresi (ms)

// --- ERROR MESSAGES ---
export const ERROR_MESSAGES = {
    INVALID_EMAIL: "Geçersiz e-posta adresi.",
    INVALID_PASSWORD: "Şifre çok zayıf (en az 6 karakter olmalı).",
    EMAIL_ALREADY_IN_USE: "Bu e-posta adresi zaten kullanımda.",
    USER_NOT_FOUND: "Kullanıcı bulunamadı.",
    WRONG_PASSWORD: "E-posta adresi veya şifre hatalı.",
    NETWORK_ERROR: "Bağlantı hatası. İnternet bağlantınızı kontrol edin.",
    UNKNOWN_ERROR: "Bilinmeyen bir hata oluştu.",
    INVALID_RATING: "Puan 1 ile 5 arasında bir tam sayı olmalıdır.",
    COMMENT_TOO_LONG: `Yorum ${MAX_COMMENT_LENGTH} karakterden uzun olamaz.`,
    NO_AUTHORIZATION: "Bu işlemi gerçekleştirmeye yetkiniz yok.",
    RATING_NOT_FOUND: "Yorum bulunamadı.",
    RECIPE_NOT_FOUND: "Tarif bulunamadı.",
    INVALID_USER_ID: "Geçersiz kullanıcı kimliği.",
} as const;

// --- SUCCESS MESSAGES ---
export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: "Başarıyla giriş yaptınız.",
    SIGNUP_SUCCESS: "Hesabınız başarıyla oluşturuldu.",
    LOGOUT_SUCCESS: "Başarıyla çıkış yaptınız.",
    PASSWORD_RESET_EMAIL_SENT: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.",
    FAVORITE_ADDED: "Tarif favorilerinize eklendi.",
    FAVORITE_REMOVED: "Tarif favorilerinizden çıkarıldı.",
    RATING_ADDED: "Yorumunuz başarıyla eklendi.",
    RATING_DELETED: "Yorumunuz silindi.",
} as const;

// --- FIREBASE COLLECTION NAMES ---
export const FIRESTORE_COLLECTIONS = {
    USERS: 'users',
    RECIPES: 'recipes',
    RATINGS: 'ratings',
} as const;

// --- API ENDPOINTS ---
export const API_ENDPOINTS = {
    GEMINI_MODEL: 'gemini-2.5-flash',
} as const;

// --- DIFFICULTY VE COST LEVELS ---
export const DIFFICULTY_LEVELS = ['Tümü', 'Kolay', 'Orta', 'Zor'] as const;
export const COST_LEVELS = ['Tümü', 'Ucuz', 'Orta', 'Pahalı'] as const;

// --- HEADER VE NAVIGATION ---
export const NAV_ITEMS = [
    { id: 'main' as const, label: 'Ana Yemekler' },
    { id: 'dessert' as const, label: 'Tatlılar' },
    { id: 'ai' as const, label: 'Akıllı Şef' },
] as const;

export const USER_MENU_ITEMS = [
    { id: 'favorites' as const, label: 'Favorilerim' },
    { id: 'userRatings' as const, label: 'Değerlendirmelerim' },
    { id: 'userInfo' as const, label: 'Kullanıcı Bilgilerim' },
] as const;
