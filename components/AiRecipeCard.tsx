// components/AiRecipeCard.tsx
// Bu dosya, "Akıllı Şef" modülünden dönen yapılandırılmış tarif verilerini (JSON)
// son kullanıcıya estetik bir kart formatında sunan görselleştirme bileşenidir.

import React from 'react';
import { type AiRecipeSuggestion } from '../types';

// ==========================================
// TİP TANIMLAMALARI (TYPE DEFINITIONS)
// ==========================================

/**
 * Bileşenin beklediği Props (Özellikler) arayüzü.
 * TypeScript kullanılarak veri bütünlüğü garanti altına alınır.
 * Bu sayede, ebeveyn bileşenden eksik veya hatalı veri gelmesi engellenir.
 */
interface AiRecipeCardProps {
  suggestion: AiRecipeSuggestion; // Yapay zekanın ürettiği tarif nesnesi
}

// ==========================================
// BİLEŞEN TANIMI (COMPONENT DEFINITION)
// ==========================================

const AiRecipeCard: React.FC<AiRecipeCardProps> = ({ suggestion }) => {
  return (
    // Kart Taşıyıcısı (Card Container)
    // Hover efektleri ve gölgelendirme ile etkileşim hissi artırılmıştır.
    <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700 transform hover:border-red-600/50 transition-colors duration-300">
      
      {/* Tarif Başlığı ve Kısa Açıklama */}
      <h4 className="text-2xl font-bold text-red-500 mb-2">{suggestion.recipeName}</h4>
      <p className="text-slate-400 mb-4 italic">{suggestion.description}</p>
      
      {/* İçerik Izgarası (Grid Layout) */}
      {/* Mobilde tek sütun, masaüstünde iki sütunlu (Malzemeler | Hazırlanış) yapı */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Sol Sütun: Malzeme Listesi */}
        <div>
          <h5 className="text-lg font-semibold text-white mb-2 border-b border-slate-600 pb-1">Malzemeler</h5>
          {/* Liste elemanları dinamik olduğu için .map() fonksiyonu ile render edilir */}
          <ul className="list-disc list-inside space-y-1 text-slate-300 mt-2">
            {suggestion.ingredients.map((item, index) => (
                <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Sağ Sütun: Hazırlanış Adımları */}
        <div>
          <h5 className="text-lg font-semibold text-white mb-2 border-b border-slate-600 pb-1">Hazırlanışı</h5>
          {/* Adım sırasını belirtmek için sıralı liste (ol) kullanılır */}
          <ol className="list-decimal list-inside space-y-2 text-slate-300 mt-2">
            {suggestion.instructions.map((item, index) => (
                <li key={index}>{item}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AiRecipeCard;