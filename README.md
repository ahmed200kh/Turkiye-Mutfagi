# Türkiye Mutfağı – Akıllı Tarif Keşif Sistemi

Projenini 1 dakika tanıtım videosu: https://www.youtube.com/watch?v=HnTNP6hN_xg

## 1\. Proje Özeti

**"Türkiye Mutfağı – Akıllı Tarif Keşif Sistemi"**, Tek Sayfalı Uygulama (SPA) mimarisiyle geliştirilmiş, modern ve etkileşimli bir web platformudur. Bu proje, geleneksel Türk mutfağını dijital çağa taşıyarak, kullanıcılara zengin tarif arşivini keşfetme, kişiselleştirme ve yapay zeka desteğiyle mutfak deneyimlerini iyileştirme imkanı sunar.

Proje, **Google Gemini** yapay zeka teknolojilerini entegre ederek, eldeki malzemelere göre anlık tarif üreten **"Akıllı Şef"** ve kullanıcı sorularını yanıtlayan **"Akıllı Yardımcı" (Chatbot)** gibi benzersiz özellikler sunmaktadır. Tüm sistem, veritabanı (Firestore) ve kimlik doğrulama (Authentication) hizmetleri sağlayan **Google Firebase** altyapısı üzerine kurulmuştur.

## 2\. Proje Hedefleri

- **Kapsamlı Veritabanı:** 1000'den fazla özgün tarifi statik dosyalardan kurtarıp, hızlı ve aranabilir bir bulut veritabanına (Firestore) taşımak.
- **Etkileşimli Kullanıcı Deneyimi:** Kullanıcıların hesap oluşturmasına, giriş yapmasına, favori tariflerini kaydetmesine ve tariflere puan verip yorum yapmasına olanak tanımak.
- **"Ne Pişirsem?" Sorununa Çözüm:** Kullanıcının elindeki malzemeleri analiz ederek Gemini Yapay Zeka desteğiyle en uygun tarifleri önermek.
- **Akıllı Destek:** Türk mutfağı teknikleri konusunda eğitilmiş bir sohbet botu ile kullanıcılara 7/24 asistanlık hizmeti vermek.
- **Güvenlik ve Ölçeklenebilirlik:** API anahtarlarının korunması ve katı veritabanı güvenlik kuralları (Firebase Rules) ile tam güvenli bir sistem inşa etmek.

## 3\. Fonksiyonel Özellikler

Uygulama birkaç ana modülden oluşmaktadır:

### A. Kimlik Doğrulama ve Kullanıcı Yönetimi

- **Kayıt ve Giriş:** Kullanıcı adı, e-posta ve şifre ile güvenli hesap oluşturma ve giriş yapma (Firebase Auth).
- **Profil Yönetimi:** Kullanıcı bilgilerini görüntüleme sayfası.

### B. Tarif Keşfi

- **Dinamik Listeleme:** Tüm tarifler (Ana Yemekler ve Tatlılar) doğrudan Firestore veritabanından çekilir.
- **Gelişmiş Filtreleme:**
  - İsim ile arama.
  - Zorluk Seviyesi (Kolay, Orta, Zor).
  - Maliyet (Ucuz, Orta, Pahalı).
  - Maksimum Hazırlama Süresi.
- **Detaylı Tarif Görüntüleme:** İnteraktif bir pencere (Modal) içinde tarif görseli, malzemeler (işaretlenebilir liste) ve adım adım talimatlar sunulur.

### C. Etkileşim ve Topluluk

- **Favoriler Sistemi:** Kullanıcılar beğendikleri tarifleri tek tıkla favorilerine ekleyebilir veya çıkarabilir.
- **Değerlendirme ve Yorumlar:** Sadece kayıtlı kullanıcılar tariflere 1-5 yıldız arası puan verebilir ve yorum yazabilir.
- **Kullanıcı Etkinlikleri:** Kullanıcılar kendi yaptıkları tüm yorumları ve puanlamaları özel bir sayfada görüntüleyebilir.

### D. Yapay Zeka Modülleri

- **Akıllı Şef (AiChef):** `gemini-2.5-pro` modelini kullanır. Kullanıcının girdiği malzemeleri analiz eder ve JSON formatında yapılandırılmış tarif önerileri sunar.
- **Akıllı Yardımcı (Chatbot):** Türk mutfağı konusunda uzmanlaşmış, bağlamı anlayabilen bir sohbet botudur. Kullanıcılara anlık yardım sağlar.

### Frontend

- **Framework:** React (v19)
- **Dil:** TypeScript (Tip güvenliği için).
- **Build Tool:** Vite (Yüksek performanslı geliştirme ortamı).
- **Stil:** Tailwind CSS (Modern ve responsive tasarım).
- **State Management:** React Context API.

### Backend as a Service (BaaS)

- **Platform:** Google Firebase.
- **Veritabanı:** Cloud Firestore (NoSQL).
- **Kimlik Doğrulama:** Firebase Authentication.

### Yapay Zeka (AI Service)

- **Model:** Google Gemini (`gemini-2.5-pro`).
- **Entegrasyon:** `@google/genai` SDK.

## 5\. Veritabanı Şeması (Database Schema)

Firestore üzerinde verimli okuma/yazma işlemleri için tasarlanmış NoSQL yapısı:

- **`users` Koleksiyonu:** Kullanıcı profilleri ve favori tarif ID'leri listesi.
- **`recipes` Koleksiyonu:** 1020 adet tarifin detaylı verisi (isim, resim, süre, malzemeler, vb.).
- **`ratings` Koleksiyonu:** Kullanıcı yorumları ve puanlamaları (Tarif ID ve Kullanıcı ID ile ilişkili).

## 6\. Kurulum ve Yapılandırma (Installation & Configuration)

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları takip edin.

### Adım 1: Proje Klasörüne Girin

Terminal veya komut satırını açın ve proje klasörünün bulunduğu dizine gidin:

````bash
cd proje-klasoru

### Adım 2: Bağımlılıkları Yükleyin

```bash
npm install
````

### Adım 3: Çevresel Değişkenleri Ayarlayın (ÖNEMLİ)

Projenin kök dizininde `.env.local` adında bir dosya oluşturun. Projenin veritabanına ve yapay zeka servisine erişebilmesi için aşağıdaki API anahtarlarını bu dosyaya eklemeniz gerekmektedir:

```env
# Google Gemini API Anahtarı (Yapay Zeka Özellikleri İçin)
GEMINI_API_KEY=Sizin_Gemini_API_Anahtariniz

# Google Firebase Yapılandırması (Veritabanı ve Kimlik Doğrulama İçin)
VITE_FIREBASE_API_KEY=Sizin_Firebase_API_Key
VITE_FIREBASE_AUTH_DOMAIN=sizin-proje-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=sizin-proje-id
VITE_FIREBASE_STORAGE_BUCKET=sizin-proje-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=Sizin_Sender_ID
VITE_FIREBASE_APP_ID=Sizin_App_ID
```

> **Not:** Bu anahtarları Google AI Studio ve Firebase Console üzerinden alabilirsiniz.

### Adım 4: Uygulamayı Başlatın

```bash
npm run dev
```

Uygulama tarayıcınızda `http://localhost:3000` (veya benzeri bir portta) çalışmaya başlayacaktır.

iyi günler :)
