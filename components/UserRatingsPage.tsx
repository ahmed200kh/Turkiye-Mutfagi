// components/UserRatingsPage.tsx
// Bu bileşen, oturum açmış kullanıcının geçmişte yaptığı tüm değerlendirmeleri ve yorumları listeler.
// Kullanıcılar buradan kendi yorumlarını görüntüleyebilir ve silebilirler.

import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { type Rating, type Recipe } from '../types';
import * as api from '../services/apiService';
import Spinner from './Spinner';
import { StarIcon, TrashIcon } from './icons';

/**
 * UserRatingsPageProps Arayüzü
 * Bileşenin dışarıdan aldığı parametreleri tanımlar.
 * - onSelectRecipe: Kullanıcı yorum yaptığı bir tarife tıkladığında detayları açmak için kullanılır.
 */
interface UserRatingsPageProps {
  onSelectRecipe: (recipe: Recipe) => void;
}

/**
 * RatingWithStatus Tipi
 * Temel Rating tipini genişleterek, silme işlemi sırasındaki UI animasyonunu
 * yönetmek için 'isDeleting' bayrağını (flag) ekler.
 */
type RatingWithStatus = Rating & { isDeleting?: boolean };

const UserRatingsPage: React.FC<UserRatingsPageProps> = ({ onSelectRecipe }) => {
    const auth = useContext(AuthContext);
    
    // --- State Yönetimi (Durum Tanımlamaları) ---
    const [ratings, setRatings] = useState<RatingWithStatus[]>([]); // Kullanıcı yorumları listesi
    const [loading, setLoading] = useState(true); // Veri yüklenme durumu
    
    // Tarif Detayları Sözlüğü (Lookup Map)
    // Yorum listesinde tarifin adını ve resmini göstermek için, tarif ID'si ile tarif detaylarını eşleştirir.
    // Dizi üzerinde tekrar tekrar arama yapmamak (O(n) yerine O(1)) için Map yapısı kullanılmıştır.
    const [recipeDetailsMap, setRecipeDetailsMap] = useState<Map<number, Recipe>>(new Map());

    /**
     * useEffect - Veri Çekme İşlemi
     * Kullanıcı oturumu doğrulandığında çalışır.
     * 1. Kullanıcının yorumlarını çeker.
     * 2. Bu yorumların ait olduğu tariflerin ID'lerini toplar.
     * 3. İlgili tariflerin detaylarını topluca (Batch) çeker.
     */
    useEffect(() => {
        const fetchRatingsAndRecipes = async () => {
            if (auth?.user) {
                try {
                    setLoading(true);
                    // 1. Adım: Kullanıcının tüm yorumlarını veritabanından getir
                    const userRatings = await api.getRatingsForUser(auth.user.uid);
                    setRatings(userRatings);

                    if (userRatings.length > 0) {
                        // 2. Adım: Yorum yapılan tariflerin ID'lerini benzersiz (Unique) olarak listele
                        const recipeIds = [...new Set(userRatings.map(r => r.recipeId))];
                        
                        // 3. Adım: Sadece bu ID'lere sahip tariflerin detaylarını sunucudan iste
                        const recipes = await api.getRecipesByIds(recipeIds);
                        
                        // 4. Adım: Hızlı erişim için tarifleri bir Map yapısına dönüştür
                        const detailsMap = new Map<number, Recipe>();
                        recipes.forEach(recipe => {
                            detailsMap.set(recipe.id, recipe);
                        });
                        setRecipeDetailsMap(detailsMap);
                    }
                } catch (error) {
                    console.error("Kullanıcı değerlendirmeleri veya tarif detayları alınamadı (Fetch Error):", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchRatingsAndRecipes();
    }, [auth?.user]);
    
    /**
     * handleDeleteRating - Yorum Silme İşlemi
     * Kullanıcı çöp kutusu ikonuna tıkladığında çalışır.
     * "Optimistic UI" yaklaşımı ile önce arayüzden silinir gibi gösterilir (animasyonla),
     * ardından sunucu tarafında silme işlemi gerçekleştirilir.
     * @param ratingId - Silinecek yorumun benzersiz kimliği.
     */
    const handleDeleteRating = (ratingId: string) => {
        // UI'da silinme animasyonunu tetiklemek için 'isDeleting' durumunu true yap
        setRatings(currentRatings =>
            currentRatings.map(r =>
                r.id === ratingId ? { ...r, isDeleting: true } : r
            )
        );

        // Animasyonun tamamlanması için kısa bir süre bekle ve sonra API isteğini gönder
        setTimeout(async () => {
            try {
                if (!auth?.user?.uid) {
                    throw new Error("Kullanıcı kimliği bulunamadı.");
                }
                await api.deleteRating(ratingId, auth.user.uid);
                // Başarılı olursa state'den tamamen kaldır
                setRatings(currentRatings => currentRatings.filter(r => r.id !== ratingId));
            } catch (error) {
                console.error("Yorum silinemedi:", error);
                alert(error instanceof Error ? error.message : "Yorum silinirken bir hata oluştu.");
                // Hata durumunda işlemi geri al (Rollback)
                setRatings(currentRatings =>
                    currentRatings.map(r => {
                        const newRating = { ...r };
                        if (newRating.id === ratingId) {
                            delete newRating.isDeleting;
                        }
                        return newRating;
                    })
                );
            }
        }, 300);
    };

    // --- Yüklenme Durumu ---
    if (loading) {
        return <div className="pt-20"><Spinner /></div>;
    }

    // --- Yetkilendirme Kontrolü ---
    if (!auth?.user) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Değerlendirmelerinizi Görüntülemek İçin Giriş Yapın</h2>
                <p className="text-slate-400">Yaptığınız yorum ve puanlamaları buradan takip edebilirsiniz.</p>
            </div>
        );
    }
    
    // --- Ana Render ---
    return (
        <div>
            {/* Sayfa Başlığı */}
            <div className="bg-slate-800 py-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Değerlendirmelerim</h1>
                    <p className="mt-2 text-lg text-slate-300">Yaptığınız yorumlar ve verdiğiniz puanlar.</p>
                </div>
            </div>

            {/* Yorum Listesi */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
                {ratings.length > 0 ? (
                    <div className="space-y-6">
                        {ratings.map(rating => {
                            // İlgili tarif detayını Map'ten çek
                            const recipe = recipeDetailsMap.get(rating.recipeId);
                            // Eğer tarif silinmişse veya bulunamazsa bu yorumu gösterme
                            if (!recipe) return null; 
                            
                            return (
                                <div 
                                    key={rating.id} 
                                    className={`bg-slate-800 p-4 rounded-lg border border-slate-700 flex items-center gap-4 transition-all duration-300 ease-in-out ${rating.isDeleting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                                >
                                    {/* Silme Butonu */}
                                    <button
                                        onClick={() => handleDeleteRating(rating.id)}
                                        className="p-2 rounded-full text-slate-400 hover:bg-red-900/50 hover:text-red-400 transition-colors flex-shrink-0"
                                        aria-label="Yorumu Sil"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                    
                                    {/* Tarif Görseli */}
                                    <img src={recipe.image} alt={recipe.name} className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-md flex-shrink-0" />
                                    
                                    {/* Yorum İçeriği */}
                                    <div className="flex-grow">
                                        <button onClick={() => onSelectRecipe(recipe)} className="text-xl font-bold text-red-500 text-left hover:underline">
                                            <h3>{recipe.name}</h3>
                                        </button>
                                        <div className="flex items-center my-2">
                                            {[...Array(5)].map((_, i) => (
                                                <StarIcon key={i} className={`w-5 h-5 ${i < rating.rating ? 'text-yellow-400' : 'text-slate-600'}`} />
                                            ))}
                                        </div>
                                        <p className="text-slate-300 italic">"{rating.comment}"</p>
                                        <p className="text-xs text-slate-500 text-right mt-2">{new Date(rating.createdAt).toLocaleDateString('tr-TR')}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    // Liste Boş İse Gösterilecek Mesaj
                     <div className="text-center py-16 bg-slate-800 rounded-lg">
                        <h2 className="text-xl font-semibold text-white mb-2">Henüz Hiç Değerlendirme Yapmadınız</h2>
                        <p className="text-slate-400">Tarifleri deneyip yorumlarınızı bizimle paylaşabilirsiniz.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserRatingsPage;