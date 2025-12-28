// components/Header.tsx
// Uygulamanın üst kısmında yer alan navigasyon ve kullanıcı menüsü bileşeni.

import React, { useContext, useState, useRef, useEffect } from 'react';
import { type Page } from '../App';
import { SmartChefIcon, UserCircleIcon } from './icons';
import { AuthContext } from '../contexts/AuthContext';
import { NAV_ITEMS, USER_MENU_ITEMS } from '../constants';

// Mobile menu icon components
const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

/**
 * HeaderProps Arayüzü
 * Bileşene dışarıdan aktarılan özellikleri tanımlar.
 * * - activePage: Şu anda görüntülenen sayfanın ID'si.
 * - setActivePage: Sayfa geçişlerini yöneten fonksiyon.
 * - openAuthModal: Giriş/Kayıt modallarını açan fonksiyon.
 */
interface HeaderProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  openAuthModal: (mode: 'login' | 'signup') => void;
}

/**
 * Header Bileşeni
 * Responsive navigasyon çubuğunu, logo alanını ve kullanıcı işlemlerini (Giriş/Profil) içerir.
 */
const Header: React.FC<HeaderProps> = ({ activePage, setActivePage, openAuthModal }) => {
  // AuthContext üzerinden global kullanıcı oturum bilgisini alıyoruz.
  const auth = useContext(AuthContext);
  if (!auth) {
    console.error("Header: AuthContext kullanılamıyor. Header bileşeninin AuthProvider ile sarmalı olduğundan emin olun.");
    return <div></div>;
  }
  
  // Profil menüsü dropdown'unun açık/kapalı durumunu yöneten state.
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Mobil menü açık/kapalı durumu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Dropdown elementine referans vererek dış tıklamaları (click outside) tespit etmek için kullanılır.
  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * useEffect - Dış Tıklama Kontrolü
   * Kullanıcı dropdown menüsünün dışına tıkladığında menüyü otomatik kapatmak için event listener ekler.
   * Component unmount olduğunda (sayfadan kalktığında) bu listener temizlenir.
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Eğer tıklanan element dropdown'ın içinde değilse, menüyü kapat.
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Navigasyon menüsünde gösterilecek temel sayfaların listesi.
  const baseNavItems = NAV_ITEMS;
  
  /**
   * NavButton Bileşeni (Helper Component)
   * Navigasyon butonlarını oluşturur ve aktif sayfa durumuna göre stil uygular.
   */
  const NavButton: React.FC<{ id: Page, label: string}> = ({ id, label }) => {
     const isActive = activePage === id;
     return (
        <button
            onClick={() => setActivePage(id)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                isActive
                ? 'bg-red-600 text-white shadow-md' // Aktif buton stili
                : 'text-slate-300 hover:bg-slate-700 hover:text-white' // Pasif buton stili
            }`}
        >
          {/* Sadece 'ai' sayfasında özel ikon gösterimi */}
          {id === 'ai' && <SmartChefIcon className="w-5 h-5" />}
          {label}
        </button>
     )
  }

  // Kullanıcı profil menüsünden bir seçeneğe tıkladığında çalışır.
  const handleDropdownLinkClick = (page: Page) => {
    setActivePage(page);
    setIsDropdownOpen(false); // Seçim yapıldığında menüyü kapat.
  };

  // Mobil menüde sayfa seçildiğinde çalışır
  const handleMobileNavClick = (page: Page) => {
    setActivePage(page);
    setIsMobileMenuOpen(false); // Seçim yapıldığında menüyü kapat
  };

  return (
    // Sticky pozisyonlandırma ile sayfa kaydırılsa bile üstte sabit kalan header.
    <header className="bg-slate-900/70 backdrop-blur-md shadow-lg sticky top-0 z-20 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        
        {/* Sol Taraf: Logo ve Navigasyon Linkleri */}
        <div className="flex items-center gap-4 sm:gap-8 flex-1">
            <div>
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight">
                Türkiye <span className="text-red-500">Mutfağı</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">Akıllı Tarif Keşif Sistemi</p>
            </div>
            
            {/* Desktop Görünümü için Navigasyon */}
            <nav className="hidden md:flex items-center space-x-1">
              {baseNavItems.map((item) => (
                <NavButton key={item.id} id={item.id} label={item.label} />
              ))}
            </nav>
        </div>

        {/* Sağ Taraf: Kullanıcı İşlemleri (Giriş/Kayıt veya Profil Menüsü) */}
        <div className="flex items-center gap-2">
            {/* Mobil Menu Butonu (MD'nin altında görünür) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              {isMobileMenuOpen ? (
                <CloseIcon className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>

            {auth?.user ? (
                 // --- Oturum Açmış Kullanıcı Görünümü ---
                 <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 text-slate-300 hover:bg-slate-700 hover:text-white"
                    >
                        <UserCircleIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Hesabım</span>
                        {/* Dropdown ok ikonu, açık/kapalı durumuna göre döner */}
                        <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    
                    {/* Profil Dropdown Menüsü */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-md shadow-lg py-1 border border-slate-700 z-30">
                           {USER_MENU_ITEMS.map((item) => (
                             <button 
                               key={item.id}
                               onClick={() => handleDropdownLinkClick(item.id)} 
                               className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                             >
                               {item.label}
                             </button>
                           ))}
                           <div className="my-1 border-t border-slate-700"></div>
                           <button onClick={() => { auth?.logout(); setIsDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700">Çıkış Yap</button>
                        </div>
                    )}
                 </div>
            ) : (
                // --- Misafir Kullanıcı Görünümü ---
                <>
                    <button
                        onClick={() => openAuthModal('login')}
                        className="hidden sm:block px-3 sm:px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 text-slate-300 hover:bg-slate-700 hover:text-white"
                    >
                        Giriş Yap
                    </button>
                    <button
                        onClick={() => openAuthModal('signup')}
                        className="px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all duration-300 bg-red-600 text-white hover:bg-red-700"
                    >
                        Kayıt
                    </button>
                </>
            )}
        </div>
      </div>

      {/* Mobil Navigasyon Menüsü */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700 p-4 space-y-2">
          {baseNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMobileNavClick(item.id)}
              className={`w-full text-left px-4 py-2.5 rounded-md text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                activePage === item.id
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {item.id === 'ai' && <SmartChefIcon className="w-5 h-5" />}
              {item.label}
            </button>
          ))}
          
          {!auth?.user && (
            <>
              <div className="my-2 border-t border-slate-700"></div>
              <button
                onClick={() => { openAuthModal('login'); setIsMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-2.5 rounded-md text-sm font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300"
              >
                Giriş Yap
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;