// index.tsx
// Bu dosya, Modern React mimarisinde uygulamanın giriş noktasıdır (Entry Point).
// React Sanal DOM (Virtual DOM) yapısını, tarayıcının gerçek DOM'una (Real DOM) monte etme (hydrating/mounting) görevini üstlenir.

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * DOM Kök Elementi Seçimi
 * HTML şablonundaki (index.html) 'root' kimliğine sahip ana kapsayıcı elemente erişim sağlanır.
 * Bu element, tüm React uygulamasının içine yerleşeceği konteynerdir.
 */
const rootElement = document.getElementById('root');

// --- Kritik Başlatma Kontrolü (Fail-Safe Check) ---
// Eğer uygulamanın bağlanacağı DOM düğümü bulunamazsa, sessizce başarısız olmak yerine
// geliştiriciyi uyaran açık bir çalışma zamanı hatası (Runtime Error) fırlatılır.
if (!rootElement) {
  throw new Error("Kritik Hata: Uygulamanın monte edileceği 'root' DOM elementi bulunamadı. Lütfen index.html dosyasını kontrol edin.");
}

/**
 * React Root Oluşturma (React 18+ API)
 * 'createRoot' API'si, React 18 ile gelen Eşzamanlı Özellikleri (Concurrent Features) 
 * ve otomatik toplu işlemeyi (Automatic Batching) etkinleştiren yeni başlatma yöntemidir.
 */
const root = ReactDOM.createRoot(rootElement);

/**
 * Uygulamanın Render Edilmesi
 * Ana 'App' bileşeni, oluşturulan React köküne çizilir.
 * * React.StrictMode:
 * Sadece geliştirme ortamında (Development Mode) aktif olan bir sarmalayıcıdır.
 * Uygulamayı olası yan etkilere, eski API kullanımlarına ve yaşam döngüsü hatalarına karşı denetler.
 * (Not: Geliştirme modunda useEffect'lerin iki kez çalışmasına neden olabilir, bu beklenen bir davranıştır.)
 */
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);