# Türkiye Mutfağı – Akıllı Tarif Keşif Sistemi

### 1\. Proje Özeti

"Türkiye Mutfağı – Akıllı Tarif Keşif Sistemi", Tek Sayfalı Uygulama (SPA) olarak geliştirilmiş etkileşimli bir web uygulamasıdır. Proje, kullanıcılara Türk mutfağının zengin tariflerini keşfetmeleri, kaydetmeleri ve değerlendirmeleri için modern ve hızlı bir platform sunmayı amaçlamaktadır.

Proje, Google Gemini yapay zeka teknolojilerini entegre ederek, eldeki malzemelere göre tarif öneren "Akıllı Şef" ve kullanıcı sorularını yanıtlayan "Akıllı Yardımcı" (Chatbot) gibi benzersiz özellikler sunmaktadır. Tüm sistem, veritabanı (Firestore) ve kimlik doğrulama (Authentication) hizmetleri sağlayan Google Firebase altyapısı üzerine kurulmuştur.

### 2\. Proje Hedefleri (Project Objectives)

- **Kapsamlı Veritabanı:** 1000'den fazla tarifHızlı ve aranabilir bulut veritabanında (Firestore)
- **Etkileşimli Kullanıcı Deneyimi:** Kullanıcıların hesap oluşturmasına, giriş yapmasına, favori tariflerini kaydetmesine ve tariflere puan verip yorum yapmasına olanak tanımak.
- **"Ne Pişirsem?" Sorununa Çözüm:** Kullanıcının elindeki malzemeleri analiz ederek Gemini Yapay Zeka desteğiyle en uygun tarifleri önermek.
- **Akıllı Destek:** Kullanıcıların yemek pişirme teknikleri hakkındaki sorularını yanıtlayabilen bir sanal asistan (Chatbot) sağlamak.
- **Güvenlik ve Ölçeklenebilirlik:** API anahtarlarının korunması ve katı veritabanı güvenlik kuralları (Firebase Rules) ile tam güvenli bir sistem inşa etmek.

### 3\. Fonksiyonel Özellikler (Functional Features)

Uygulama birkaç ana modülden oluşmaktadır:

#### A. Kimlik Doğrulama ve Kullanıcı Yönetimi (Authentication)

- **Kayıt ve Giriş:** Kullanıcı adı, e-posta ve şifre ile güvenli hesap oluşturma ve giriş yapma (Firebase Auth).
- **Şifre Sıfırlama:** "Şifremi Unuttum" özelliği ile e-posta yoluyla şifre yenileme bağlantısı gönderme.
- **Profil Yönetimi:** Kullanıcı bilgilerini görüntüleme sayfası.

#### B. Tarif Keşfi (Recipe Discovery)

- **Dinamik Listeleme:** Tüm tarifler (Ana Yemekler ve Tatlılar) doğrudan Firestore veritabanından çekilir.
- **Gelişmiş Filtreleme:** Kullanıcılar tarifleri şunlara göre filtreleyebilir:
  - İsim ile arama.
  - Zorluk Seviyesi (Kolay, Orta, Zor).
  - Maliyet (Ucuz, Orta, Pahalı).
  - Maksimum Hazırlama Süresi.
- **Detaylı Tarif Görüntüleme:** İnteraktif bir pencere (Modal) içinde tarif görseli, malzemeler (işaretlenebilir liste) ve adım adım talimatlar sunulur.

#### C. Etkileşim ve Topluluk (User Interaction)

- **Favoriler Sistemi:** Kullanıcılar beğendikleri tarifleri tek tıkla favorilerine ekleyebilir veya çıkarabilir.
- **Değerlendirme ve Yorumlar:** Sadece kayıtlı kullanıcılar tariflere 1-5 yıldız arası puan verebilir ve yorum yazabilir.
- **Kullanıcı Etkinlikleri:** Kullanıcılar kendi yaptıkları tüm yorumları ve puanlamaları özel bir sayfada görüntüleyebilir.

#### D. Yapay Zeka Modülleri (Artificial Intelligence)

- **Akıllı Şef (AiChef):** `gemini` modelini kullanır. Kullanıcının girdiği malzemeleri analiz eder ve JSON formatında yapılandırılmış tarif önerileri sunar.
- **Akıllı Yardımcı (Chatbot):** Türk mutfağı konusunda uzmanlaşmış, bağlamı anlayabilen bir sohbet botudur. Kullanıcılara anlık yardım sağlar.

### 4\. Teknik Mimari (Technical Architecture)

Proje, **Client-Server** mimarisine dayanmaktadır ancak sunucu tarafı (Server-side) için **Serverless** (Sunucusuz) teknolojiler kullanılmıştır.

- **Frontend (Ön Yüz):**

  - **Framework:** React (v19)
  - **Dil:** TypeScript (Tip güvenliği için).
  - **Build Tool:** Vite (Yüksek performanslı geliştirme ortamı).
  - **Stil (Styling):** Tailwind CSS (Modern ve responsive tasarım).
  - **State Management:** React Context API.

- **Backend as a Service (BaaS):**

  - **Platform:** Google Firebase.
  - **Veritabanı:** Cloud Firestore (NoSQL).
  - **Kimlik Doğrulama:** Firebase Authentication.

- **Yapay Zeka (AI Service):**

  - **Model:** Google Gemini (`gemini-flash`).
  - **Entegrasyon:** `@google/genai` SDK.

### 5\. Veritabanı Şeması (Database Schema)

Firestore üzerinde verimli okuma/yazma işlemleri için tasarlanmış NoSQL yapısı:

- **`users` Koleksiyonu:** Kullanıcı profilleri ve favori tarif ID'leri listesi.
- **`recipes` Koleksiyonu:** 1020 adet tarifin detaylı verisi (isim, resim, süre, malzemeler, vb.).
- **`ratings` Koleksiyonu:** Kullanıcı yorumları ve puanlamaları (Tarif ID ve Kullanıcı ID ile ilişkili).

### 6\. Sonuç (Conclusion)

Bu proje, modern web teknolojileri (React, TypeScript), bulut bilişim (Firebase) ve yapay zekanın (Gemini) başarılı bir entegrasyonudur. Günlük bir sorun olan "yemek seçimi" problemine hem geleneksel veritabanı yöntemleriyle hem de yenilikçi yapay zeka çözümleriyle yaklaşarak, kullanıcı dostu ve profesyonel bir ürün ortaya koymaktadır.

---

### Kurulum (Installation)

1.  Repoyu klonlayın:
    ```bash
    git clone https://github.com/username/project-name.git
    ```
2.  Bağımlılıkları yükleyin:
    ```bash
    npm install
    ```
3.  `.env.local` dosyasını oluşturun ve API anahtarlarınızı ekleyin.
4.  Projeyi başlatın:
    ```bash
    npm run dev
    ```
