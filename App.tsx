// App.tsx
// Bu dosya, uygulamanın ana bileşenidir (Root Component).
// Sayfa yönlendirmeleri (Client-side Routing), global düzen (Layout) ve ana durum yönetimi burada yapılır.

import React, { useState } from 'react';
import Header from './components/Header';
import RecipeGrid from './components/RecipeGrid';
import AiChef from './components/AiChef';
import Chatbot from './components/Chatbot';
import AuthModal from './components/AuthModal';
import FavoritesPage from './components/FavoritesPage';
import UserInfoPage from './components/UserInfoPage';
import UserRatingsPage from './components/UserRatingsPage';
import { AuthProvider } from './contexts/AuthContext';
import { type Recipe } from './types';
import RecipeModal from './components/RecipeModal';
import Footer from './components/Footer';

/**
 * Tip Tanımlamaları
 * -----------------------------------------------------------------------
 * Page: Uygulama içindeki gezilebilir sayfaların benzersiz anahtarlarını tanımlar.
 * AuthModalMode: Kimlik doğrulama penceresinin hangi modda (Giriş/Kayıt) açılacağını belirler.
 */
export type Page = 'main' | 'dessert' | 'ai' | 'favorites' | 'userRatings' | 'userInfo';
type AuthModalMode = 'login' | 'signup';

/**
 * AppContent Bileşeni
 * -----------------------------------------------------------------------
 * Uygulamanın görsel iskeletini ve sayfa geçiş mantığını barındırır.
 * Header, Footer ve dinamik içerik alanını (Main) bir araya getirir.
 */
const AppContent: React.FC = () => {
  // --- Durum Yönetimi (State Management) ---
  
  // Aktif olarak görüntülenen sayfayı takip eder (Basit SPA Yönlendirme Mantığı)
  const [activePage, setActivePage] = useState<Page>('main');
  
  // Kimlik doğrulama modalının görünürlüğünü ve modunu kontrol eder
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: AuthModalMode }>({ isOpen: false, mode: 'login' });
  
  // Detay görüntüleme için seçilen tarifin verisini tutar (Modal için)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // --- Olay İşleyicileri (Event Handlers) ---

  // Kimlik doğrulama modalını belirli bir modda (Giriş/Kayıt) açar
  const openAuthModal = (mode: AuthModalMode) => {
    setAuthModal({ isOpen: true, mode });
  };

  // Kimlik doğrulama modalını kapatır
  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: 'login' });
  };

  // Bir tarif kartına tıklandığında detay modalını tetikler
  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  // Tarif detay modalını kapatır
  const handleCloseModal = () => {
    setSelectedRecipe(null);
  };

  /**
   * renderPage - Koşullu Render Fonksiyonu
   * 'activePage' durumuna göre ekrana hangi bileşenin çizileceğini belirler.
   * Switch-Case yapısı ile sanal bir yönlendirme (Routing) sağlar.
   */
  const renderPage = () => {
    switch (activePage) {
      case 'main':
        return <RecipeGrid type="main" onSelectRecipe={handleSelectRecipe} />;
      case 'dessert':
        return <RecipeGrid type="dessert" onSelectRecipe={handleSelectRecipe} />;
      case 'ai':
        return <AiChef />;
      case 'favorites':
        return <FavoritesPage onSelectRecipe={handleSelectRecipe} />;
      case 'userRatings':
        return <UserRatingsPage onSelectRecipe={handleSelectRecipe} />;
      case 'userInfo':
        return <UserInfoPage />;
      default:
        return <RecipeGrid type="main" onSelectRecipe={handleSelectRecipe} />;
    }
  };

  return (
    // Ana Düzen (Layout): Flexbox kullanılarak sayfa yapısı dikey olarak hizalanmıştır.
    // 'min-h-screen' ile sayfanın en az ekran boyutu kadar olması sağlanır.
    <div className="bg-slate-900 text-white min-h-screen flex flex-col">
      
      {/* Üst Navigasyon Çubuğu */}
      <Header activePage={activePage} setActivePage={setActivePage} openAuthModal={openAuthModal} />
      
      {/* Dinamik İçerik Alanı: Seçilen sayfa burada render edilir */}
      <main className="flex-grow">
        {renderPage()}
      </main>
      
      {/* Alt Bilgi Çubuğu */}
      <Footer />
      
      {/* Global Bileşenler: Sayfa yapısından bağımsız her zaman erişilebilir olanlar */}
      <Chatbot />
      
      {/* Koşullu Modallar (Pop-up Pencereler) */}
      {authModal.isOpen && <AuthModal mode={authModal.mode} onClose={closeAuthModal} />}
      <RecipeModal recipe={selectedRecipe} onClose={handleCloseModal} />
    </div>
  );
};

/**
 * App Bileşeni (Entry Point Wrapper)
 * -----------------------------------------------------------------------
 * Tüm uygulamayı sarmalar ve gerekli Context Sağlayıcılarını (Providers) başlatır.
 * Burada AuthProvider kullanılarak, kimlik doğrulama durumu tüm alt bileşenlere dağıtılır.
 */
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;