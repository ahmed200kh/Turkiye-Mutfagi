// components/FavoritesPage.tsx
// Bu dosya, kullanıcının favori tariflerini Firestore veritabanından çekip listeler.

import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import RecipeGrid from './RecipeGrid';
import * as api from '../services/apiService'; // API servis katmanı içe aktarılıyor
import Spinner from './Spinner';
import { type Recipe } from '../types';

interface FavoritesPageProps {
    onSelectRecipe: (recipe: Recipe) => void;
}

/**
 * FavoritesPage Bileşeni
 * * Bu bileşen, oturum açmış kullanıcının 'users' koleksiyonundaki favori ID listesini okur
 * ve bu ID'lere karşılık gelen tarif detaylarını 'recipes' koleksiyonundan çeker.
 */
const FavoritesPage: React.FC<FavoritesPageProps> = ({ onSelectRecipe }) => {
    const auth = useContext(AuthContext);
    
    // --- State Yönetimi (Durum Yönetimi) ---
    // Firestore'dan çekilen tarif nesnelerini tutan state
    const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
    // Veri çekme işlemi sırasındaki yüklenme durumunu kontrol eden state
    const [isLoading, setIsLoading] = useState(true);

    /**
     * useEffect Kancası
     * Kullanıcı değiştiğinde veya kullanıcının favori listesi güncellendiğinde tetiklenir.
     * Amacı: Firestore'dan güncel verileri getirmektir.
     */
    useEffect(() => {
        // 1. Kullanıcı nesnesi ve favori listesi mevcut mu kontrolü
        if (auth?.user?.favorites) {
            
            // 2. Eğer favori listesi boşsa, API isteği yapmaya gerek yok
            if (auth.user.favorites.length === 0) {
                setFavoriteRecipes([]);
                setIsLoading(false);
                return;
            }
            
            // 3. Asenkron veri çekme fonksiyonu
            const fetchFavorites = async () => {
                setIsLoading(true);
                try {
                    // API servisini kullanarak sadece favori ID'lerine sahip tarifleri getir
                    // (Batch request mantığı ile çalışır)
                    const recipes = await api.getRecipesByIds(auth.user.favorites);
                    setFavoriteRecipes(recipes);
                } catch (error) {
                    console.error("Favori tarifler çekilirken hata oluştu (Fetch Error):", error);
                } finally {
                    setIsLoading(false); // İşlem bitince yüklemeyi durdur
                }
            };
            
            fetchFavorites();

        } else if (!auth?.user) {
            // Kullanıcı oturum açmamışsa listeyi temizle
            setIsLoading(false);
            setFavoriteRecipes([]);
        }
    }, [auth?.user, auth?.user?.favorites]); // Bağımlılık dizisi (Dependency Array)

    // --- Hataları kontrol et(Loading UI) ---
    // Hem Auth kontrolü hem de veri çekme işlemi sırasında Spinner gösterilir
    if (auth?.loading) {
        return (
          <div className="pt-12 sm:pt-20">
            <Spinner />
            <p className="text-center mt-4 text-slate-400 text-sm sm:text-base">Kullanıcı doğrulaması yapılıyor...</p>
          </div>
        );
    }

    // --- Yetkilendirme Kontrolü (Auth Check) ---
    // Kullanıcı giriş yapmamışsa uyarı mesajı göster
    if (!auth?.user) {
        return (
            <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-12 sm:py-16 text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Favorilerinizi Görüntülemek İçin Giriş Yapın</h2>
                <p className="text-slate-400 text-sm sm:text-base">Beğendiğiniz tarifleri kaydedip onlara buradan kolayca ulaşabilirsiniz.</p>
            </div>
        );
    }
    
    // --- Ana Render ---
    return (
        <div>
            <div className="bg-slate-800 py-6 sm:py-10">
                <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 text-center">
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">Favori Tariflerim</h1>
                    <p className="mt-2 text-sm sm:text-lg text-slate-300">Kaydettiğiniz lezzetler bir arada.</p>
                </div>
            </div>
            
            {/* RecipeGrid bileşenine 'favorites' tipi ile veriyi gönderiyoruz.
                Burada 'recipeList' prop'u üzerinden Firestore'dan çektiğimiz veriyi (favoriteRecipes) aktarıyoruz.
            */}
            {isLoading ? (
                <div className="pt-12 sm:pt-20 flex justify-center">
                    <Spinner />
                </div>
            ) : favoriteRecipes.length > 0 ? (
                <RecipeGrid type="favorites" recipeList={favoriteRecipes} onSelectRecipe={onSelectRecipe} />
            ) : (
                <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-12 sm:py-16">
                    <div className="text-center bg-slate-800 rounded-lg p-8 sm:p-12 border border-slate-700">
                        <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">Henüz Favori Eklememişsiniz</h2>
                        <p className="text-slate-400 text-sm sm:text-base">Beğendiğiniz tarifleri favorilere ekleyerek buradan erişebilirsiniz.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FavoritesPage;