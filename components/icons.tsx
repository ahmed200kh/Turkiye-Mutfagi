// components/icons.tsx
// Uygulamanın genelinde kullanılan SVG ikon bileşenlerini içeren dosya.
// Her ikon, esnek stil yönetimi için 'className' prop'u alabilen bir React fonksiyonel bileşenidir.

import React from 'react';

/**
 * ClockIcon (Saat İkonu)
 * Tariflerin hazırlama süresini (örn: 30 dk) göstermek için kullanılır.
 */
export const ClockIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

/**
 * ChartBarIcon (Grafik Çubuğu İkonu)
 * Tariflerin zorluk seviyesini (Kolay, Orta, Zor) görselleştirmek için kullanılır.
 */
export const ChartBarIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

/**
 * CurrencyDollarIcon (Para Birimi İkonu)
 * Tariflerin tahmini maliyetini (Ucuz, Orta, Pahalı) belirtmek için kullanılır.
 */
export const CurrencyDollarIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

/**
 * CloseIcon (Kapatma İkonu)
 * Modalları (Pencere) veya açılır menüleri kapatmak için kullanılan 'X' işareti.
 */
export const CloseIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

/**
 * SparklesIcon (Parıltı İkonu)
 * Yapay zeka özelliklerini veya önerileri vurgulamak için kullanılan dekoratif ikon.
 */
export const SparklesIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m11-4.08V21M17 19h4m-6-16v4m2-2h4M5 11l4 4 4-4M12 3v18" />
  </svg>
);

/**
 * SmartChefIcon (Akıllı Şef İkonu)
 * Uygulamanın AI Şef özelliğini temsil eden özel tasarlanmış logo/ikon.
 * Arama ve şef şapkası metaforlarını birleştirir.
 */
export const SmartChefIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor">
        <path d="M21 3C11.6 3 4 10.6 4 20C4 29.4 11.6 37 21 37C24.3 37 27.3 36.1 29.9 34.5L41.3 45.9C42.1 46.7 43.3 46.7 44.1 45.9C44.9 45.1 44.9 43.9 44.1 43.1L32.7 31.7C34.9 28.9 36.2 25.2 36.2 21.3C36.2 11.3 29.5 3 21 3ZM21 33C13.8 33 8 27.2 8 20C8 12.8 13.8 7 21 7C28.2 7 34 12.8 34 20C34 27.2 28.2 33 21 33Z" />
        <path d="M20.5 5.5L19 8L17.5 5.5L19 3L20.5 5.5Z" />
    </svg>
);

/**
 * InstagramIcon
 * Sosyal medya bağlantıları için Instagram logosu.
 */
export const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

/**
 * XSocialIcon (Eski Twitter)
 * Sosyal medya bağlantıları için X platformu logosu.
 */
export const XSocialIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 16 16">
    <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"/>
  </svg>
);

/**
 * FacebookIcon
 * Sosyal medya bağlantıları için Facebook logosu.
 */
export const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 16 16">
    <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
  </svg>
);

/**
 * SearchIcon (Büyüteç İkonu)
 * Arama çubuğunda kullanılan ikon.
 */
export const SearchIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

/**
 * ChatBubbleIcon (Konuşma Balonu)
 * Chatbot (Sanal Asistan) butonunu temsil eden ikon.
 */
export const ChatBubbleIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

/**
 * PaperAirplaneIcon (Kağıt Uçak)
 * Chatbot penceresinde mesajı göndermek için kullanılan buton ikonu.
 */
export const PaperAirplaneIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
     <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
  </svg>
);

/**
 * StarIcon (Yıldız)
 * Tarifleri puanlamak (Rating) için kullanılan yıldız ikonu.
 */
export const StarIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clipRule="evenodd" />
    </svg>
);

/**
 * UserCircleIcon (Kullanıcı Profil İkonu)
 * Header'da kullanıcı menüsünü açmak ve yorumlarda kullanıcı avatarı olarak kullanılır.
 */
export const UserCircleIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

/**
 * TrashIcon (Çöp Kutusu)
 * Kullanıcının kendi yaptığı yorumları silmesi için kullanılan ikon.
 */
export const TrashIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

/**
 * ArrowLeftIcon (Sol Ok)
 * Tarif adımlarında bir önceki adıma dönmek için kullanılır.
 */
export const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

/**
 * ArrowRightIcon (Sağ Ok)
 * Tarif adımlarında bir sonraki adıma geçmek için kullanılır.
 */
export const ArrowRightIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

/**
 * CheckCircleIcon (Daire İçinde Onay İşareti)
 * Tarifin tamamlandığını gösteren başarı ikonu.
 */
export const CheckCircleIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

/**
 * RefreshIcon (Yenileme İkonu)
 * Tarif adımlarını baştan başlatmak için kullanılır.
 */
export const RefreshIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.18-3.185m-7.536-12.24l3.18 3.184a8.25 8.25 0 010 11.665l-3.18 3.184m-7.536-12.24l-3.18 3.184a8.25 8.25 0 000 11.665l3.18 3.184" />
    </svg>
);

/**
 * CheckIcon (Basit Onay İşareti)
 * Malzeme listesinde alınan malzemeleri işaretlemek (checkbox) için kullanılır.
 */
export const CheckIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);