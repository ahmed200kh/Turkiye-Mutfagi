// components/AiChef.tsx
// Bu bileşen, "Akıllı Şef" modülünün arayüzünü ve mantığını yönetir.
// Kullanıcıdan malzeme girdilerini alır, Gemini AI servisi ile iletişim kurar ve sonuçları listeler.

import React, { useState, useEffect } from 'react';
import { getRecipeSuggestions } from '../services/geminiService';
import { searchRecipesByIngredients } from '../services/apiService';
import Spinner from './Spinner';
import { SmartChefIcon } from './icons';
import { type AiRecipeSuggestion, type Recipe } from '../types';
import AiRecipeCard from './AiRecipeCard';
import RecipeCard from './RecipeCard';
import RecipeModal from './RecipeModal';
import {
  AI_LOADING_MESSAGE_INTERVAL,
  AI_DEFAULT_SUGGESTION_COUNT,
  MAX_INGREDIENTS_TEXT_LENGTH,
} from '../constants';

// Yapay zeka yanıt verirken kullanıcıya gösterilecek dinamik durum mesajları.
// Bu, bekleme süresini (Latency) kullanıcı deneyimi açısından iyileştirir.
const LOADING_MESSAGES = [
  "Malzemeleriniz analiz ediliyor...",           // Aşama 1: Analiz
  "Türk mutfağı veritabanı taranıyor...",        // Aşama 2: Veri tarama
  "En lezzetli kombinasyonlar hesaplanıyor...",  // Aşama 3: Sentez
  "Şefin özel önerileri hazırlanıyor..."         // Aşama 4: Sonuç
];

const AiChef: React.FC = () => {
  // --- Durum Yönetimi ---
  const [ingredients, setIngredients] = useState('');
  const [recipeType, setRecipeType] = useState<'Ana Yemek' | 'Tatlı'>('Ana Yemek');
  const [suggestionCount, setSuggestionCount] = useState<number>(AI_DEFAULT_SUGGESTION_COUNT);
  const [ingredientStrictness, setIngredientStrictness] = useState<'flexible' | 'strict'>('flexible');
  
  const [results, setResults] = useState<AiRecipeSuggestion[] | null>(null);
  const [dbResults, setDbResults] = useState<Recipe[] | null>(null);
  const [searchSource, setSearchSource] = useState<'database' | 'ai' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // --- Yan Etkiler ---
  
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setCurrentMessageIndex(0);
      interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, AI_LOADING_MESSAGE_INTERVAL);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // --- Olay İşleyicileri ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedIngredients = ingredients.trim();
    
    if (!trimmedIngredients) {
      setError("Lütfen en az bir malzeme girin.");
      return;
    }
    
    if (trimmedIngredients.length > MAX_INGREDIENTS_TEXT_LENGTH) {
      setError(`Malzeme metni ${MAX_INGREDIENTS_TEXT_LENGTH} karakterden uzun olamaz.`);
      return;
    }

    setIsLoading(true);
    setResults(null);
    setDbResults(null);
    setSearchSource(null);
    setError(null);

    try {
      const ingredientsList = trimmedIngredients.split(',').map(ing => ing.trim()).filter(ing => ing.length > 0);
      const recipeTypeParam = recipeType === 'Ana Yemek' ? 'main' : 'dessert';
      
      const dbMatches = await searchRecipesByIngredients(
        ingredientsList,
        recipeTypeParam,
        ingredientStrictness === 'strict'
      );
      
      if (dbMatches && dbMatches.length > 0) {
        setDbResults(dbMatches.slice(0, suggestionCount));
        setSearchSource('database');
      } else {
        const suggestions = await getRecipeSuggestions(ingredients, recipeType, suggestionCount, ingredientStrictness);
        setResults(suggestions);
        setSearchSource('ai');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Beklenmedik bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRecipe(null);
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8">
      <div className="max-w-2xl mx-auto bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-slate-700">
         {/* Başlık ve Açıklama Alanı */}
         <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center justify-center gap-3">
              <SmartChefIcon className="w-6 sm:w-8 h-6 sm:h-8 text-red-500" />
              <span>Akıllı Şef</span>
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Evinizdeki malzemeleri yazın, yapay zeka sizin için harika tarifler önerileri sunsun!
            </p>
         </div>

        <form onSubmit={handleSubmit}>
          {/* Filtreleme Seçenekleri (Grid Yapısı) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
            {/* Tarif Tipi Seçimi */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Ne yapmak istersin?</label>
              <div className="flex gap-2 bg-slate-700 p-1 rounded-lg">
                  {(['Ana Yemek', 'Tatlı'] as const).map(type => (
                      <button
                          key={type}
                          type="button"
                          onClick={() => setRecipeType(type)}
                          className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors duration-200 ${
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
              <label htmlFor="suggestionCount" className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Kaç tarif istersin?</label>
              <div className="flex items-center gap-2 sm:gap-4 bg-slate-700 p-2 rounded-lg">
                <input
                  id="suggestionCount"
                  type="range"
                  min="1"
                  max="10"
                  value={suggestionCount}
                  onChange={(e) => setSuggestionCount(Number(e.target.value))}
                  className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer range-thumb"
                  disabled={isLoading}
                />
                <span className="bg-slate-900 text-red-500 font-bold text-sm sm:text-lg w-10 h-8 flex items-center justify-center rounded-md tabular-nums flex-shrink-0">
                  {suggestionCount}
                </span>
              </div>
            </div>
          </div>

           {/* Malzeme Katılığı Seçimi */}
           <div className="mb-4">
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Malzeme Tercihi</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-700 p-1 rounded-lg">
                  <button
                      key="flexible"
                      type="button"
                      onClick={() => setIngredientStrictness('flexible')}
                      className={`py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors duration-200 ${
                          ingredientStrictness === 'flexible' ? 'bg-red-600 text-white' : 'bg-transparent text-slate-300 hover:bg-slate-600'
                      }`}
                  >
                      Ek Malzeme Eklenebilir
                  </button>
                   <button
                      key="strict"
                      type="button"
                      onClick={() => setIngredientStrictness('strict')}
                      className={`py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors duration-200 ${
                          ingredientStrictness === 'strict' ? 'bg-red-600 text-white' : 'bg-transparent text-slate-300 hover:bg-slate-600'
                      }`}
                  >
                      Sadece Verdiğim Malzemeler
                  </button>
              </div>
            </div>

          {/* Malzeme Giriş Alanı (TextArea) */}
          <textarea
            className="w-full p-3 sm:p-4 border border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow duration-200 resize-none bg-slate-700 text-white placeholder-slate-400 text-sm sm:text-base"
            rows={4}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="Malzemelerinizi virgülle ayırarak yazın (örn: domates, soğan, kıyma, patlıcan)"
            disabled={isLoading}
          />

          {/* Gönder Butonu ve Yükleme Animasyonu */}
          <button
            type="submit"
            className="mt-4 w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-transform duration-200 transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center min-h-[50px] text-sm sm:text-base"
            disabled={isLoading || !ingredients.trim()}
          >
            {isLoading ? (
              <>
                <Spinner />
                {/* Dinamik mesaj gösterimi */}
                <span className="ml-3 animate-pulse transition-all duration-300 text-xs sm:text-sm">
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
        <div className="mt-6 sm:mt-8 max-w-2xl mx-auto bg-red-900/50 text-red-200 p-3 sm:p-4 rounded-lg text-center">
            <h3 className="font-bold text-sm sm:text-base">Bir Hata Oluştu</h3>
            <p className="text-xs sm:text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Sonuçların Listelenmesi */}
      {(results || dbResults) && !isLoading && (
        <div className="mt-6 sm:mt-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-100">
                {searchSource === 'database' ? 'Veritabanından Bulunan Tarifler' : 'Yapay Zeka Şefin Önerileri'}
              </h3>
              {searchSource === 'database' && (
                <span className="text-xs sm:text-sm bg-green-600/30 text-green-200 px-3 py-1 rounded-full">
                  Hızlı
                </span>
              )}
              {searchSource === 'ai' && (
                <span className="text-xs sm:text-sm bg-blue-600/30 text-blue-200 px-3 py-1 rounded-full">
                  AI Üretildi
                </span>
              )}
            </div>
            {dbResults && dbResults.length > 0 ? (
                 <div className="space-y-4 sm:space-y-6">
                    {dbResults.map((recipe) => (
                      <RecipeCard key={recipe.id} recipe={recipe} onSelect={handleRecipeSelect} />
                    ))}
                 </div>
            ) : results && results.length > 0 ? (
                 <div className="space-y-4 sm:space-y-6">
                    {results.map((suggestion, index) => <AiRecipeCard key={index} suggestion={suggestion} />)}
                 </div>
            ) : (
                <div className="text-center text-slate-500 bg-slate-800 p-4 sm:p-6 rounded-lg text-sm sm:text-base">
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

      {/* Tarif Detay Modalı */}
      {showModal && selectedRecipe && (
        <RecipeModal recipe={selectedRecipe} onClose={closeModal} />
      )}
    </div>
  );
};

export default AiChef;