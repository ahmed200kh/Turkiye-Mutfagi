// components/RecipeCard.tsx
// Bu bileşen, tariflerin liste görünümlerinde (Grid) kullanılan özet kart yapısını oluşturur.

import React, { useContext } from 'react';
import { type Recipe } from '../types';
import { ClockIcon, ChartBarIcon, CurrencyDollarIcon } from './icons';
import { AuthContext } from '../contexts/AuthContext';

/**
 * RecipeCardProps Arayüzü
 * Bileşenin dışarıdan alması gereken verileri tanımlar.
 * - recipe: Görüntülenecek tarif nesnesi.
 * - onSelect: Karta tıklandığında çalışacak, detay modalını açan fonksiyon.
 */
interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
}

/**
 * RecipeCard Bileşeni
 * Her bir tarifi görsel, başlık ve temel bilgilerle (süre, zorluk, maliyet) sunar.
 * Ayrıca, kullanıcıların tarifi favorilerine ekleyip çıkarmasına olanak tanır.
 */
const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSelect }) => {
  // Kullanıcının oturum durumuna ve favori listesine erişmek için Context kullanılır.
  const auth = useContext(AuthContext);
  
  // Mevcut tarifin kullanıcının favori listesinde olup olmadığını kontrol eder.
  // Bu bilgiye göre kalp ikonunun içi dolu veya boş görüntülenir.
  const isFavorite = auth?.user?.favorites.includes(recipe.id);

  /**
   * Favori Butonu Tıklama Olayı
   * Kullanıcı kalp ikonuna tıkladığında çalışır.
   * @param e - Tıklama olayı nesnesi.
   */
  const handleFavoriteClick = (e: React.MouseEvent) => {
    // stopPropagation: Kartın kendisine tıklanmasını engeller. 
    // Böylece favoriye tıklayınca tarif detay modalı açılmaz, sadece favori işlemi yapılır.
    e.stopPropagation();
    
    if (auth?.user) {
        // Kullanıcı giriş yapmışsa favori durumunu değiştir (Ekle/Çıkar).
        auth.toggleFavorite(recipe.id);
    } else {
        // Giriş yapmamışsa kullanıcıyı uyar.
        alert('Favorilere eklemek için giriş yapmalısınız.');
    }
  }

  return (
    <div
      // Kartın ana kapsayıcısı: Hover efektleri, gölgelendirme ve geçiş animasyonları içerir.
      className="bg-slate-800 rounded-xl overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 cursor-pointer group border border-slate-700 hover:border-red-600/50 shadow-lg hover:shadow-red-600/10 flex flex-col"
      onClick={() => onSelect(recipe)} // Karta tıklandığında detayları aç.
    >
      {/* Görsel ve Üst Katman Alanı */}
      <div className="relative w-full h-40 sm:h-48">
        <img className="w-full h-full object-cover" src={recipe.image} alt={recipe.name} />
        
        {/* Gradyan Katmanı: Yazıların okunabilirliğini artırmak için görsel üzerine eklenen karartma efekti. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent group-hover:from-black/80 transition-all duration-300"></div>
        
        {/* Favori Butonu (Sağ Üst Köşe) */}
        <div className="absolute top-2 right-2">
            <button 
                onClick={handleFavoriteClick} 
                className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-red-600/80 transition-colors"
                aria-label="Favorilere Ekle"
            >
                {/* SVG Kalp İkonu: Duruma göre içi dolu veya boş render edilir */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 sm:h-6 w-5 sm:w-6" fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                </svg>
            </button>
        </div>
        
        {/* Tarif Başlığı (Sol Alt Köşe) */}
        <div className="absolute bottom-0 left-0 p-3 sm:p-4 right-0">
             <h3 className="text-white text-lg sm:text-xl font-bold tracking-wide line-clamp-2">{recipe.name}</h3>
        </div>
      </div>

      {/* Alt Bilgi Alanı: Süre, Zorluk ve Maliyet */}
      <div className="p-3 sm:p-4 bg-slate-800 mt-auto">
        <div className="flex justify-between items-center text-xs sm:text-sm text-slate-400 gap-2">
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="truncate">{recipe.time} dk</span>
          </div>
          <div className="flex items-center gap-1">
            <ChartBarIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="truncate">{recipe.difficulty}</span>
          </div>
          <div className="flex items-center gap-1">
            <CurrencyDollarIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="truncate">{recipe.cost}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;