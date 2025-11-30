// components/AiChef.tsx
// Bu bileşen, "Akıllı Şef" modülünün arayüzünü ve mantığını yönetir.
// Kullanıcıdan malzeme girdilerini alır, Gemini AI servisi ile iletişim kurar ve sonuçları listeler.

import React, { useState, useEffect } from 'react';
import { getRecipeSuggestions } from '../services/geminiService';
import Spinner from './Spinner';
import { SmartChefIcon } from './icons';
import { type AiRecipeSuggestion } from '../types';
import AiRecipeCard from './AiRecipeCard';

// Yapay zeka yanıt verirken kullanıcıya gösterilecek dinamik durum mesajları.
// Bu, bekleme süresini (Latency) kullanıcı deneyimi açısından iyileştirir.
const LOADING_MESSAGES = [
  "Malzemeleriniz analiz ediliyor...",           // Aşama 1: Analiz
  "Türk mutfağı veritabanı taranıyor...",        // Aşama 2: Veri tarama
  "En lezzetli kombinasyonlar hesaplanıyor...",  // Aşama 3: Sentez
  "Şefin özel önerileri hazırlanıyor..."         // Aşama 4: Sonuç
];

const AiChef: React.FC = () => {
  // --- Durum Yönetimi (State Management) ---
  const [ingredients, setIngredients] = useState(''); // Kullanıcı malzeme girdisi
  const [recipeType, setRecipeType] = useState<'Ana Yemek' | 'Tatlı'>('Ana Yemek'); // Tarif tipi tercihi
  const [suggestionCount, setSuggestionCount] = useState<number>(3); // İstenen öneri sayısı
  const [ingredientStrictness, setIngredientStrictness] = useState<'flexible' | 'strict'>('flexible'); // Malzeme katılığı
  
  const [results, setResults] = useState<AiRecipeSuggestion[] | null>(null); // API'den gelen sonuçlar
  const [error, setError] = useState<string | null>(null); // Hata durumu
  const [isLoading, setIsLoading] = useState(false); // Yükleniyor durumu

  // Yükleme mesajı animasyonu için indeks takibi
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // --- Yan Etkiler (Side Effects) ---
  
  // Yükleme sırasında mesajları belirli aralıklarla (3000ms) değiştiren döngü.
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setCurrentMessageIndex(0); // Yükleme başladığında sayacı sıfırla
      interval = setInterval(() => {
        // Modulo operatörü (%) ile dizi uzunluğu içinde döngüsel artış sağlar
        setCurrentMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);
    }
    // Bileşen unmount olduğunda veya yükleme bittiğinde interval'i temizle (Cleanup)
    return () => clearInterval(interval);
  }, [isLoading]);

  // --- Olay İşleyicileri (Event Handlers) ---

  /**
   * Form gönderildiğinde tetiklenir.
   * Gemini servisine istek atar ve gelen yanıtı işler.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredients.trim()) return; // Boş gönderimi engelle

    setIsLoading(true);
    setResults(null);
    setError(null);

    try {
      // Servis katmanından veri iste
      const suggestions = await getRecipeSuggestions(ingredients, recipeType, suggestionCount, ingredientStrictness);
      setResults(suggestions);
    } catch (err) {
      // Hata yakalama ve kullanıcıya gösterme
      setError(err instanceof Error ? err.message : 'Beklenmedik bir hata oluştu.');
    } finally {
      setIsLoading(false); // İşlem sonu
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-2xl mx-auto bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
         {/* Başlık ve Açıklama Alanı */}
         <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-slate-100 flex items-center justify-center gap-3">
              <SmartChefIcon className="w-8 h-8 text-red-500" />
              <span>Akıllı Şef</span>
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Evinizdeki malzemeleri yazın, yapay zeka sizin için harika tarifler önerileri sunsun!
            </p>
         </div>

        <form onSubmit={handleSubmit}>
          {/* Filtreleme Seçenekleri (Grid Yapısı) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Tarif Tipi Seçimi */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Ne yapmak istersin?</label>
              <div className="flex gap-2 bg-slate-700 p-1 rounded-lg">
                  {(['Ana Yemek', 'Tatlı'] as const).map(type => (
                      <button
                          key={type}
                          type="button"
                          onClick={() => setRecipeType(type)}
                          className={`w-full py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${
                              recipeType === type ? 'bg-red-600 text-white' : 'bg-transparent text-slate-300 hover:bg-slate-600'
                          }`}
                      >
                          {type}
                      </button>
                  ))}
              </div>
            </div>

            {/* Öneri Sayısı Seçimi (Slider) */}
            <div>
              <label htmlFor="suggestionCount" className="block text-sm font-medium text-slate-300 mb-2">Kaç tarif istersin?</label>
              <div className="flex items-center gap-4 bg-slate-700 p-2 rounded-lg">
                <input
                  id="suggestionCount"
                  type="range"
                  min="1"
                  max="10"
                  value={suggestionCount}
                  onChange={(e) => setSuggestionCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer range-thumb"
                  disabled={isLoading}
                />
                <span className="bg-slate-900 text-red-500 font-bold text-lg w-12 h-8 flex items-center justify-center rounded-md tabular-nums">
                  {suggestionCount}
                </span>
              </div>
            </div>
          </div>

           {/* Malzeme Katılığı Seçimi */}
           <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Malzeme Tercihi</label>
              <div className="flex gap-2 bg-slate-700 p-1 rounded-lg">
                  <button
                      key="flexible"
                      type="button"
                      onClick={() => setIngredientStrictness('flexible')}
                      className={`w-full py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${
                          ingredientStrictness === 'flexible' ? 'bg-red-600 text-white' : 'bg-transparent text-slate-300 hover:bg-slate-600'
                      }`}
                  >
                      Ek Malzeme Eklenebilir
                  </button>
                   <button
                      key="strict"
                      type="button"
                      onClick={() => setIngredientStrictness('strict')}
                      className={`w-full py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${
                          ingredientStrictness === 'strict' ? 'bg-red-600 text-white' : 'bg-transparent text-slate-300 hover:bg-slate-600'
                      }`}
                  >
                      Sadece Verdiğim Malzemeler
                  </button>
              </div>
            </div>

          {/* Malzeme Giriş Alanı (TextArea) */}
          <textarea
            className="w-full p-4 border border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow duration-200 resize-none bg-slate-700 text-white placeholder-slate-400"
            rows={4}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="Malzemelerinizi virgülle ayırarak yazın (örn: domates, soğan, kıyma, patlıcan)"
            disabled={isLoading}
          />

          {/* Gönder Butonu ve Yükleme Animasyonu */}
          <button
            type="submit"
            className="mt-4 w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-transform duration-200 transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center min-h-[50px]"
            disabled={isLoading || !ingredients.trim()}
          >
            {isLoading ? (
              <>
                <Spinner />
                {/* Dinamik mesaj gösterimi */}
                <span className="ml-3 animate-pulse transition-all duration-300">
                    {LOADING_MESSAGES[currentMessageIndex]}
                </span>
              </>
            ) : (
                'Tarif Öner'
            )}
          </button>
        </form>
      </div>
      
      {/* Hata Mesajı Gösterimi */}
      {error && !isLoading && (
        <div className="mt-8 max-w-4xl mx-auto bg-red-900/50 text-red-200 p-4 rounded-lg text-center">
            <h3 className="font-bold">Bir Hata Oluştu</h3>
            <p>{error}</p>
        </div>
      )}

      {/* Sonuçların Listelenmesi */}
      {results && !isLoading && (
        <div className="mt-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-100 mb-6 text-center">Yapay Zeka Şefin Önerileri</h3>
            {results.length > 0 ? (
                 <div className="space-y-6">
                    {results.map((suggestion, index) => <AiRecipeCard key={index} suggestion={suggestion} />)}
                 </div>
            ) : (
                <div className="text-center text-slate-500 bg-slate-800 p-6 rounded-lg">
                    <p>Bu malzemelerle uygun bir tarif bulunamadı. Lütfen farklı malzemeler deneyin.</p>
                </div>
            )}
        </div>
      )}
       
       {/* Range Slider için özel CSS stilleri */}
       <style>{`
        .range-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #dc2626;
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid #f8fafc;
          margin-top: -8px;
        }
        .range-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #dc2626;
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid #f8fafc;
        }
      `}</style>
    </div>
  );
};

export default AiChef;