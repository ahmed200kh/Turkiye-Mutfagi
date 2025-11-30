// components/RecipeModal.tsx
// Bu bileşen, seçilen tarifin tüm detaylarını (görsel, malzemeler, yapılış adımları) 
// ve kullanıcı yorumlarını içeren modal penceresini oluşturur.

import React, { useContext, useState, useEffect, useCallback } from 'react';
import { type Recipe, type Rating } from '../types';
import { 
    ClockIcon, ChartBarIcon, CurrencyDollarIcon, CloseIcon, StarIcon, UserCircleIcon, 
    ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon, RefreshIcon, CheckIcon
} from './icons';
import { AuthContext } from '../contexts/AuthContext';
import * as api from '../services/apiService';
import Spinner from './Spinner';

/**
 * RecipeModalProps Arayüzü
 * Bileşenin dışarıdan aldığı parametreleri tanımlar.
 * - recipe: Görüntülenecek tarif nesnesi (null ise modal açılmaz).
 * - onClose: Modalı kapatmak için tetiklenen fonksiyon.
 */
interface RecipeModalProps {
  recipe: Recipe | null;
  onClose: () => void;
}

/**
 * StarRating Yardımcı Bileşeni
 * Verilen sayısal puana göre (1-5) yıldız ikonlarını oluşturur.
 */
const StarRating: React.FC<{ rating: number; className?: string }> = ({ rating, className = 'w-5 h-5' }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <StarIcon key={i} className={`${className} ${i < rating ? 'text-yellow-400' : 'text-slate-600'}`} />
    ))}
  </div>
);

const RecipeModal: React.FC<RecipeModalProps> = ({ recipe, onClose }) => {
  const auth = useContext(AuthContext);
  
  // --- State Yönetimi (Yorum ve Puanlama) ---
  const [ratings, setRatings] = useState<Rating[]>([]); // Tarifin mevcut yorumları
  const [isLoadingRatings, setIsLoadingRatings] = useState(true); // Yorumların yüklenme durumu
  const [newRating, setNewRating] = useState(0); // Kullanıcının yeni vereceği puan
  const [hoverRating, setHoverRating] = useState(0); // Yıldızlar üzerinde gezinirken geçici puan
  const [newComment, setNewComment] = useState(''); // Kullanıcının yeni yorum metni
  const [isSubmitting, setIsSubmitting] = useState(false); // Yorum gönderme işlemi durumu
  const [ratingError, setRatingError] = useState<string | null>(null); // Hata mesajları

  // --- State Yönetimi (Tarif Adımları ve Malzemeler) ---
  const [currentStep, setCurrentStep] = useState(0); // Mevcut adım indeksi
  const [isCompleted, setIsCompleted] = useState(false); // Tarifin tamamlanma durumu
  const [instructionKey, setInstructionKey] = useState(0); // Adım animasyonunu tetiklemek için key
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set()); // İşaretlenen malzemeler

  // Ortalama puan hesaplaması
  const averageRating = ratings.length > 0 ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length : 0;

  // --- Favori İşlemleri Mantığı ---
  // Mevcut tarifin kullanıcının favorilerinde olup olmadığını kontrol et
  const isFavorite = auth?.user?.favorites.includes(recipe?.id || -1);

  // Favoriye ekleme/çıkarma işlemi
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Tıklamanın üst elementlere yayılmasını engelle
    if (!auth?.user || !recipe) {
        alert('Favorilere eklemek için giriş yapmalısınız.');
        return;
    }
    auth.toggleFavorite(recipe.id);
  };
  // -------------------------

  /**
   * fetchRatings - Yorumları Getirme
   * Seçilen tarifin ID'sine göre veritabanından yorumları çeker.
   * useCallback ile performans optimizasyonu sağlanmıştır.
   */
  const fetchRatings = useCallback(async () => {
    if (recipe) {
      try {
        setIsLoadingRatings(true);
        const fetchedRatings = await api.getRatingsForRecipe(recipe.id);
        setRatings(fetchedRatings);
      } catch (error) {
        console.error("Yorumlar çekilirken hata oluştu:", error);
      } finally {
        setIsLoadingRatings(false);
      }
    }
  }, [recipe]);

  /**
   * useEffect - Modal Açılış Ayarları
   * Tarif değiştiğinde veya modal ilk açıldığında çalışır.
   * Yorumları getirir ve adım/malzeme durumlarını sıfırlar.
   */
  useEffect(() => {
    if (recipe) {
      fetchRatings();
      setCurrentStep(0);
      setIsCompleted(false);
      setInstructionKey(Date.now());
      setCheckedIngredients(new Set());
    } else {
        // Modal kapandığında state'leri temizle
        setRatings([]);
        setNewRating(0);
        setNewComment('');
        setRatingError(null);
    }
  }, [recipe, fetchRatings]);

  /**
   * handleRatingSubmit - Yorum Gönderme
   * Kullanıcının girdiği yorum ve puanı veritabanına kaydeder.
   */
  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.user || !recipe) return;
    
    // Puan kontrolü
    if (newRating === 0) {
        setRatingError('Puan vermek için en az bir yıldız seçmelisiniz.');
        return;
    }
    
    setIsSubmitting(true);
    setRatingError(null);
    try {
        await api.addRating(recipe.id, auth.user.uid, auth.user.username, newRating, newComment);
        await fetchRatings(); // Listeyi güncelle
        setNewComment('');
        setNewRating(0);
    } catch (error) {
        console.error("Yorum gönderilemedi:", error);
        setRatingError('Yorum gönderilirken bir hata oluştu.');
    } finally {
        setIsSubmitting(false);
    }
  };
  
  // --- Tarif Adım Kontrolleri ---
  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
    setInstructionKey(Date.now()); // Animasyonu yeniden tetikle
  };
  const handleNextStep = () => {
    if (recipe) {
        setCurrentStep(prev => Math.min(recipe.instructions.length - 1, prev + 1));
        setInstructionKey(Date.now());
    }
  };
  const handleComplete = () => { setIsCompleted(true); };
  
  // Tarifi baştan başlat
  const handleRestart = () => {
    setIsCompleted(false);
    setCurrentStep(0);
    setInstructionKey(Date.now());
  };
  
  // --- Malzeme Listesi Kontrolleri ---
  const handleToggleIngredient = (index: number) => {
    setCheckedIngredients(prev => {
        const newSet = new Set(prev);
        if (newSet.has(index)) { newSet.delete(index); } else { newSet.add(index); }
        return newSet;
    });
  };
  const handleClearIngredients = () => { setCheckedIngredients(new Set()); };


  if (!recipe) return null;

  return (
    // Modal Arka Planı (Overlay)
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 p-4" onClick={onClose}>
      
      {/* Modal İçerik Kutusu */}
      <div
        className="bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-lg flex flex-col border border-slate-700 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()} // Modal içine tıklanınca kapanmasını engelle
      >
        {/* --- Modal Başlık Alanı --- */}
        <div className="flex-shrink-0 p-4 flex items-center justify-between border-b border-slate-800">
          <h2 className="text-2xl font-bold text-red-500">{recipe.name}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        {/* --------------------------- */}

        {/* Kaydırılabilir İçerik Alanı */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                
                {/* Sol Kolon: Görsel ve Bilgiler */}
                <div>
                  <div className="relative">
                    <img src={recipe.image} alt={recipe.name} className="w-full h-64 object-cover rounded-lg mb-4" />
                    
                    {/* Görsel Üzerindeki Favori Butonu */}
                    {auth?.user && (
                      <div className="absolute top-2 right-2">
                          <button 
                              onClick={handleFavoriteClick} 
                              className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-red-600/80 transition-colors"
                              aria-label="Favorilere Ekle"
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                              </svg>
                          </button>
                      </div>
                    )}
                  </div>

                  {/* Özet Bilgi Çubuğu */}
                  <div className="flex justify-around items-center text-sm text-slate-300 bg-slate-800 p-3 rounded-lg">
                    <div className="flex items-center gap-2"><ClockIcon className="w-5 h-5 text-red-500" /> {recipe.time} dk</div>
                    <div className="flex items-center gap-2"><ChartBarIcon className="w-5 h-5 text-red-500" /> {recipe.difficulty}</div>
                    <div className="flex items-center gap-2"><CurrencyDollarIcon className="w-5 h-5 text-red-500" /> {recipe.cost}</div>
                  </div>
                </div>

                {/* Sağ Kolon: Malzemeler Listesi */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                         <h3 className="text-lg font-semibold text-white">Malzemeler</h3>
                         {checkedIngredients.size > 0 && (
                            <button onClick={handleClearIngredients} className="text-xs text-red-400 hover:text-red-300 hover:underline">
                                Hepsini Temizle
                            </button>
                         )}
                    </div>
                    {/* Malzeme listesi (checkbox mantığı ile çalışır) */}
                    <ul className="space-y-2 text-slate-300 text-sm max-h-56 overflow-y-auto pr-2">
                        {recipe.ingredients.map((item, i) => {
                            const isChecked = checkedIngredients.has(i);
                            return (
                                <li 
                                    key={i} 
                                    onClick={() => handleToggleIngredient(i)}
                                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all duration-300 ${isChecked ? 'bg-slate-800/60' : 'hover:bg-slate-800/50'}`}
                                >
                                    <div className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${isChecked ? 'bg-red-500 border-red-500' : 'border-slate-600'}`}>
                                        {isChecked && <CheckIcon className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className={`flex-grow transition-colors duration-300 ${isChecked ? 'line-through text-slate-500' : ''}`}>
                                        {item}
                                    </span>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>

            {/* Hazırlanış Adımları Bölümü */}
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-2 text-center">Hazırlanışı</h3>
                {isCompleted ? (
                    // Tarif tamamlandığında gösterilecek başarı ekranı
                    <div className="text-center py-8 flex flex-col items-center justify-center animate-fade-in">
                        <CheckCircleIcon className="w-20 h-20 text-green-400 mb-4" />
                        <h4 className="text-2xl font-bold text-white">Afiyet Olsun!</h4>
                        <p className="text-slate-400 mt-2">Tarifi başarıyla tamamladınız.</p>
                        <button 
                            onClick={handleRestart}
                            className="mt-6 flex items-center gap-2 px-4 py-2 bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-600 transition-colors"
                        >
                            <RefreshIcon className="w-5 h-5" />
                            <span>Adımları Tekrar Göster</span>
                        </button>
                    </div>
                ) : (
                    // Adım adım talimatlar
                    <>
                        <div className="text-center mb-4">
                            <span className="text-sm font-semibold bg-red-600/50 text-red-200 py-1 px-3 rounded-full">
                                Adım {currentStep + 1} / {recipe.instructions.length}
                            </span>
                        </div>
                        <div className="min-h-[120px] flex items-center justify-center text-center">
                           <p key={instructionKey} className="text-slate-200 text-base leading-relaxed animate-fade-in-up-sm">
                                {recipe.instructions[currentStep]}
                            </p>
                        </div>
                        <div className="flex justify-between items-center mt-6">
                            <button
                                onClick={handlePrevStep}
                                disabled={currentStep === 0}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-600 transition-colors disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
                            >
                                <ArrowLeftIcon className="w-5 h-5"/>
                                <span>Önceki Adım</span>
                            </button>
                            {currentStep === recipe.instructions.length - 1 ? (
                                <button
                                    onClick={handleComplete}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors"
                                >
                                    <span>Tarifi Tamamla</span>
                                    <CheckCircleIcon className="w-5 h-5"/>
                                </button>
                            ) : (
                                <button
                                    onClick={handleNextStep}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors"
                                >
                                    <span>Sonraki Adım</span>
                                    <ArrowRightIcon className="w-5 h-5"/>
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
          </div>

          {/* Yorumlar ve Değerlendirme Bölümü */}
          <div className="p-6 border-t border-slate-800">
            <h3 className="text-xl font-bold text-white mb-4">Değerlendirmeler ({ratings.length})</h3>
            <div className="flex items-center gap-2 mb-6">
              <StarRating rating={averageRating} />
              <span className="text-slate-400 text-sm">{averageRating > 0 ? `${averageRating.toFixed(1)} / 5.0` : 'Henüz Puanlanmadı'}</span>
            </div>

            {/* Yorum Listesi */}
            <div className="space-y-4 mb-6 max-h-48 overflow-y-auto pr-2">
                {isLoadingRatings ? <Spinner /> : ratings.length > 0 ? (
                    ratings.map(r => (
                        <div key={r.id} className="bg-slate-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <UserCircleIcon className="w-5 h-5 text-slate-400" />
                                    <span className="font-semibold text-sm text-white">{r.username}</span>
                                </div>
                                <StarRating rating={r.rating} className="w-4 h-4" />
                            </div>
                            <p className="text-sm text-slate-300">{r.comment}</p>
                            <p className="text-xs text-slate-500 text-right mt-1">{new Date(r.createdAt).toLocaleDateString('tr-TR')}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-slate-400">Bu tarif için henüz yorum yapılmamış. İlk yorumu sen yap!</p>
                )}
            </div>

            {/* Yorum Yapma Formu */}
            {auth?.user ? (
                <form onSubmit={handleRatingSubmit}>
                    <h4 className="font-semibold text-white mb-2">Yorum Yap</h4>
                    <div className="flex items-center gap-2 mb-2">
                       {[...Array(5)].map((_, i) => {
                           const ratingValue = i + 1;
                           return (
                               <button 
                                type="button" 
                                key={ratingValue} 
                                onClick={() => setNewRating(ratingValue)}
                                onMouseEnter={() => setHoverRating(ratingValue)}
                                onMouseLeave={() => setHoverRating(0)}
                               >
                                  <StarIcon className={`w-7 h-7 cursor-pointer transition-colors ${ratingValue <= (hoverRating || newRating) ? 'text-yellow-400' : 'text-slate-600 hover:text-yellow-300'}`} />
                               </button>
                           )
                       })}
                    </div>
                    <textarea 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full p-2 border border-slate-700 rounded-md bg-slate-800 text-white focus:ring-red-500 focus:border-red-500"
                        placeholder="Yorumunuzu buraya yazın..."
                        rows={2}
                    />
                    {ratingError && <p className="text-sm text-red-400 mt-1">{ratingError}</p>}
                    <button type="submit" disabled={isSubmitting} className="mt-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 disabled:bg-slate-600">
                        {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
                    </button>
                </form>
            ) : (
                <div className="text-center bg-slate-800 p-4 rounded-lg">
                    <p className="text-sm text-slate-400">Yorum yapmak ve puan vermek için giriş yapmalısınız.</p>
                </div>
            )}
          </div>
        </div>
      </div>
       <style>{`
            @keyframes fade-in-up {
                0% { opacity: 0; transform: translateY(20px) scale(0.95); }
                100% { opacity: 1; transform: translateY(0) scale(1); }
            }
            .animate-fade-in-up {
                animation: fade-in-up 0.3s ease-out forwards;
            }
            @keyframes fade-in-up-sm {
                0% { opacity: 0; transform: translateY(10px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-up-sm {
                animation: fade-in-up-sm 0.4s ease-out forwards;
            }
            @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-fade-in {
                animation: fade-in 0.5s ease-out forwards;
            }
      `}</style>
    </div>
  );
};

export default RecipeModal;