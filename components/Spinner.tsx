// components/Spinner.tsx
// Bu bileşen, uygulama genelinde veri yükleme veya işlem bekleme sürelerinde
// kullanıcıya görsel geri bildirim (feedback) sağlayan yükleme animasyonunu içerir.

import React from 'react';

/**
 * Spinner Bileşeni
 * -----------------------------------------------------------------------
 * Asenkron işlemler (API istekleri, veritabanı sorguları vb.) tamamlanana kadar
 * ekranda dönen bir yükleme halkası gösterir.
 * Tailwind CSS 'animate-spin' sınıfı kullanılarak performanslı bir animasyon sağlar.
 */
const Spinner: React.FC = () => {
  return (
    // Dış Kapsayıcı: Spinner'ı sayfanın veya bulunduğu alanın ortasına hizalar.
    <div className="flex justify-center items-center">
      {/* Animasyonlu Halka:
          - animate-spin: Sürekli dönme efekti.
          - rounded-full: Tam daire şekli.
          - h-12 w-12: Boyutlandırma.
          - border-b-4 border-red-500: Halkanın sadece alt kenarını boyayarak dönme efektini belirginleştirir.
      */}
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-500"></div>
    </div>
  );
};

export default Spinner;