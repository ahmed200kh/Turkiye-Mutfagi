// components/Footer.tsx
// Uygulamanın tüm sayfalarında en altta görüntülenen alt bilgi bileşeni.

import React from 'react';
import { InstagramIcon, XSocialIcon, FacebookIcon } from './icons';

/**
 * Footer Bileşeni
 * -----------------------------------------------------------------------
 * Bu bileşen, kullanıcıya proje hakkında kısa bilgi, sosyal medya erişimi
 * ve iletişim detaylarını sunan statik bir yapıya sahiptir.
 * Responsive tasarım (Grid) kullanılarak mobil ve masaüstü uyumluluğu sağlanmıştır.
 */
const Footer: React.FC = () => {
  return (
    // 'mt-auto': İçerik az olsa bile footer'ın sayfanın en altına itilmesini sağlar.
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Responsive Grid Yapısı: Mobilde tek sütun, orta ve üstü ekranlarda 3 sütun */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* 1. Sütun: Proje Tanıtım Metni (Biz Kimiz?) */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-white mb-4">Biz Kimiz?</h3>
            <p className="text-sm leading-relaxed">
              Türkiye Mutfağı - Akıllı Tarif Keşif Sistemi olarak, zengin Türk mutfağını modern teknolojiyle buluşturarak herkesin kolayca erişebileceği bir platform sunmayı amaçlıyoruz.
            </p>
          </div>

          {/* 2. Sütun: Sosyal Medya İkonları ve Linkleri */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-white mb-4">Hızlı Bağlantılar</h3>
            <div className="flex items-center space-x-6">
              {/* Instagram Linki */}
              <a href="#" className="hover:text-white transition-colors" aria-label="Instagram">
                <InstagramIcon className="w-6 h-6" />
              </a>
              {/* X (Twitter) Linki */}
              <a href="#" className="hover:text-white transition-colors" aria-label="X">
                <XSocialIcon className="w-6 h-6" />
              </a>
              {/* Facebook Linki */}
              <a href="#" className="hover:text-white transition-colors" aria-label="Facebook">
                <FacebookIcon className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* 3. Sütun: İletişim Bilgileri (Mailto Linki) */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-white mb-4">Bizimle İletişime Geçin</h3>
            <p className="text-sm">
              Öneri ve görüşleriniz için: <a href="mailto:info@turkiyemutfagi.com" className="text-red-500 hover:underline">info@turkiyemutfagi.com</a>
            </p>
          </div>
        </div>
      </div>

      {/* Alt Telif Hakkı (Copyright) Çubuğu */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-xs">
            © 2025 Türkiye Mutfağı. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;