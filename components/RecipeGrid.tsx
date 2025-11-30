// components/RecipeGrid.tsx
// Bu bileşen, tarifleri listelemek, filtrelemek ve arama yapmak için kullanılan ana grid yapısını oluşturur.
// Hem Firebase'den dinamik olarak çekilen verileri hem de favoriler sayfası için statik verileri yönetir.

import React, { useState, useMemo, useEffect } from 'react';
import { type Recipe, type Difficulty, type Cost } from '../types';
import RecipeCard from './RecipeCard';
import { SearchIcon } from './icons';
import * as api from '../services/apiService';
import Spinner from './Spinner';

/**
 * RecipeGridProps Arayüzü
 * Bileşenin dışarıdan alması gereken parametreleri tanımlar.
 * - type: Sayfa türü (Ana Yemek, Tatlı veya Favoriler).
 * - recipeList: (Opsiyonel) Favoriler sayfasında dışarıdan gelen veri listesi.
 * - onSelectRecipe: Kullanıcı bir tarife tıkladığında çalışacak fonksiyon.
 */
interface RecipeGridProps {
  type: 'main' | 'dessert' | 'favorites';
  recipeList?: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
}

const RecipeGrid: React.FC<RecipeGridProps> = ({ type, recipeList, onSelectRecipe }) => {
  // --- State Yönetimi (Durum Tanımlamaları) ---
  
  // Kullanıcının arama kutusuna girdiği metni tutar.
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtreleme kriterleri (Zorluk, Maliyet ve Maksimum Süre)
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'Tümü'>('Tümü');
  const [costFilter, setCostFilter] = useState<Cost | 'Tümü'>('Tümü');
  const [maxTime, setMaxTime] = useState(240); // Varsayılan maksimum süre: 240 dakika
  
  // Sayfalama (Pagination) yerine "Daha Fazla Yükle" mantığı için görünür eleman sayısı.
  const [visibleCount, setVisibleCount] = useState(10);
  
  // Firebase veritabanından çekilen dinamik tarif verilerini tutar.
  const [fetchedRecipes, setFetchedRecipes] = useState<Recipe[]>([]);
  
  // Veri çekme işlemi sırasında kullanıcıya geri bildirim vermek için yüklenme durumu.
  const [isLoading, setIsLoading] = useState(false);

  // Filtre butonları için sabit seçenekler listesi.
  const difficultyLevels: (Difficulty | 'Tümü')[] = ['Tümü', 'Kolay', 'Orta', 'Zor'];
  const costLevels: (Cost | 'Tümü')[] = ['Tümü', 'Ucuz', 'Orta', 'Pahalı'];

  /**
   * useEffect - Veri Çekme İşlemi
   * Bileşen yüklendiğinde veya sayfa türü (type) değiştiğinde çalışır.
   * Eğer sayfa 'favorites' değilse, ilgili kategorideki tarifleri Firebase'den çeker.
   */
  useEffect(() => {
    // Favoriler sayfası veriyi prop olarak aldığı için sunucu isteği yapmaya gerek yoktur.
    if (type === 'favorites') return;

    const loadRecipes = async () => {
      setIsLoading(true); // Yüklenme animasyonunu başlat
      try {
        // Servis katmanı üzerinden veritabanı sorgusu yapılır
        const data = await api.getRecipesByType(type as 'main' | 'dessert');
        setFetchedRecipes(data);
      } catch (error) {
        console.error("Veri çekme hatası (Data Fetch Error):", error);
      } finally {
        setIsLoading(false); // İşlem tamamlanınca yüklemeyi durdur
      }
    };

    loadRecipes();
  }, [type]);

  /**
   * useMemo - Veri Kaynağını Belirleme
   * Performans optimizasyonu sağlar. Sadece bağımlılıklar değiştiğinde hesaplanır.
   * Favoriler sayfasındaysak prop'tan gelen veriyi, değilse Firebase verisini temel alır.
   */
  const initialRecipes = useMemo(() => {
    if (type === 'favorites') return recipeList || [];
    return fetchedRecipes;
  }, [type, recipeList, fetchedRecipes]);

  /**
   * useMemo - Filtreleme Mantığı (Core Logic)
   * Kullanıcının seçtiği kriterlere (Arama, Zorluk, Maliyet, Süre) göre listeyi filtreler.
   */
  const filteredRecipes = useMemo(() => {
    // Veri henüz yüklenmediyse boş dizi döndürerek hatayı önle.
    if (!initialRecipes) return [];

    return initialRecipes.filter(recipe => {
      // Veri bütünlüğü kontrolü
      if (!recipe) return false;
      
      // Filtreleme Koşulları
      const difficultyMatch = difficultyFilter === 'Tümü' || recipe.difficulty === difficultyFilter;
      const costMatch = costFilter === 'Tümü' || recipe.cost === costFilter;
      // Büyük/küçük harf duyarlılığını ortadan kaldırarak arama yap
      const searchMatch = searchTerm === '' || recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
      const timeMatch = recipe.time <= maxTime;
      
      // Ana yemekler listesinden çorba, salata vb. yan ürünleri hariç tutma mantığı
      let isExcluded = false;
      if (type === 'main') {
         const lowerName = recipe.name.toLowerCase();
         isExcluded = lowerName.includes('çorba') || lowerName.includes('salata') || lowerName.includes('cacık');
      }

      // Tüm koşullar sağlanıyorsa tarifi listeye dahil et
      return difficultyMatch && costMatch && searchMatch && timeMatch && !isExcluded;
    });
  }, [initialRecipes, difficultyFilter, costFilter, searchTerm, maxTime, type]);

  // Filtreler değiştiğinde görünür eleman sayısını sıfırla (başa dön).
  useEffect(() => setVisibleCount(10), [type, difficultyFilter, costFilter, searchTerm, maxTime]);
  
  // Filtrelenmiş listeden sadece görünür sayısı kadarını al (Lazy Loading benzeri yapı).
  const recipesToDisplay = filteredRecipes.slice(0, visibleCount);
  
  // "Daha Fazla Yükle" butonuna tıklandığında görünür sayıyı artır.
  const handleLoadMore = () => setVisibleCount(prev => prev + 10);

  // Yüklenme durumunda Spinner göster.
  if (isLoading && type !== 'favorites') {
    return <div className="pt-20 flex justify-center"><Spinner /></div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Filtreleme ve Arama Paneli (Sadece Ana Yemek ve Tatlı sayfalarında görünür) */}
      {type !== 'favorites' && (
        <div className="bg-slate-800 p-6 rounded-xl mb-8 border border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                {/* Arama Alanı */}
                <div className="md:col-span-1">
                    <h3 className="text-sm font-semibold text-slate-300 mb-2">Tarif Ara</h3>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Örn: Karnıyarık"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-600 rounded-md bg-slate-700 text-white focus:ring-red-500"
                        />
                        <SearchIcon className="absolute left-3 top-2.5 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {/* Zorluk Seviyesi Filtresi */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">Zorluk Seviyesi</h3>
                  <div className="flex bg-slate-700/50 rounded-md p-1 gap-1">
                    {difficultyLevels.map(level => (
                      <button
                        key={level}
                        onClick={() => setDifficultyFilter(level)}
                        className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-md ${
                          difficultyFilter === level ? 'bg-red-600 text-white' : 'text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Maliyet Filtresi */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">Maliyet</h3>
                  <div className="flex bg-slate-700/50 rounded-md p-1 gap-1">
                    {costLevels.map(level => (
                      <button
                        key={level}
                        onClick={() => setCostFilter(level)}
                        className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-md ${
                          costFilter === level ? 'bg-red-600 text-white' : 'text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hazırlama Süresi Filtresi (Range Slider) */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-300 mb-2">Maks. Süre: <span className="text-red-500">{maxTime} dk</span></h3>
                    <input
                      type="range"
                      min="10" max="240" step="5"
                      value={maxTime}
                      onChange={(e) => setMaxTime(Number(e.target.value))}
                      className="w-full h-2 bg-slate-600 rounded-lg accent-red-600 cursor-pointer"
                    />
                </div>
            </div>
        </div>
      )}
        
      {/* Tarif Listesi Görünümü */}
      {filteredRecipes.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {recipesToDisplay.map((recipe, index) => (
              // Animasyonlu giriş efekti (Staggered Animation)
              <div key={recipe.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms`}}>
                  <RecipeCard recipe={recipe} onSelect={onSelectRecipe} />
              </div>
            ))}
          </div>
          
          {/* Daha Fazla Yükle Butonu */}
          {filteredRecipes.length > visibleCount && (
            <div className="text-center mt-12">
              <button onClick={handleLoadMore} className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700">
                Daha Fazla Yükle
              </button>
            </div>
          )}
        </>
      ) : (
        // Sonuç Bulunamadı Durumu
        <div className="text-center py-16 bg-slate-800 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-2">{type === 'favorites' ? 'Henüz Favori Tarifiniz Yok' : 'Sonuç Bulunamadı'}</h2>
            <p className="text-slate-400">Aradığınız kriterlere uygun tarif bulunamadı.</p>
        </div>
      )}
      
       {/* Yerel Stil Tanımlamaları (Animasyonlar) */}
       <style>{`
            @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fade-in { animation: fade-in 0.5s ease-out forwards; opacity: 0; }
        `}</style>
    </div>
  );
};

export default RecipeGrid;