// types.ts
// Bu modül, uygulama genelinde kullanılan veri modellerini ve TypeScript tip tanımlamalarını merkezi olarak barındırır.
// Statik tip kontrolü (Static Type Checking) sağlayarak, veri tutarlılığını artırır ve geliştirme sürecindeki hataları minimize eder.

/**
 * --- Sabit Değer Tipleri (String Literal Union Types) ---
 * Bu tipler, belirli alanların sadece önceden tanımlanmış değerleri almasını zorunlu kılar.
 */

// Tarifin zorluk derecesini standartlaştırır.
export type Difficulty = 'Kolay' | 'Orta' | 'Zor';

// Tarifin tahmini maliyet aralığını sınıflandırır.
export type Cost = 'Ucuz' | 'Orta' | 'Pahalı';

// Tarifin kategorik ayrımını (Ana Yemek veya Tatlı) belirler.
// Bu ayrım, filtreleme ve veritabanı sorgularında kullanılır.
export type RecipeType = 'main' | 'dessert';

/**
 * Recipe Arayüzü (Interface)
 * -----------------------------------------------------------------------
 * Uygulamanın temel veri birimi olan 'Tarif' nesnesinin şemasıdır.
 * Firestore veritabanındaki 'recipes' koleksiyonundan dönen verilerin yapısını temsil eder.
 */
export interface Recipe {
  id: number; // Veritabanındaki benzersiz kayıt kimliği (Primary Key).
  name: string; // Tarifin kullanıcıya görünen başlığı.
  type: RecipeType; // Tarifin kategorisi (main/dessert).
  image: string; // Tarif görselinin barındırıldığı URL adresi.
  time: number; // Hazırlama ve pişirme süresinin toplamı (dakika).
  difficulty: Difficulty; // Hazırlama zorluk seviyesi.
  cost: Cost; // Tahmini maliyet seviyesi.
  ingredients: string[]; // Gerekli malzemelerin listesi (Array of Strings).
  instructions: string[]; // Adım adım hazırlama talimatları.
}

/**
 * AiRecipeSuggestion Arayüzü
 * -----------------------------------------------------------------------
 * Yapay Zeka (Gemini AI) servisi tarafından dinamik olarak üretilen tarif önerilerinin formatıdır.
 * API yanıtının (JSON Response) beklenen yapısını tanımlar ve tip güvenliğini sağlar.
 */
export interface AiRecipeSuggestion {
  recipeName: string; // AI tarafından önerilen tarifin adı.
  description: string; // Tarifin iştah açıcı kısa bir özeti.
  ingredients: string[]; // AI tarafından belirlenen malzeme listesi.
  instructions: string[]; // AI tarafından oluşturulan hazırlık adımları.
}

/**
 * User Arayüzü
 * -----------------------------------------------------------------------
 * Sistemdeki kayıtlı kullanıcı profilini temsil eder.
 * Firebase Authentication (Auth) ve Firestore (Veritabanı) verilerinin birleşiminden oluşur.
 */
export interface User {
  id: string; // Firebase Authentication tarafından atanan benzersiz UID.
  username: string; // Kullanıcının uygulamada görünen adı.
  email: string; // Kullanıcının kayıtlı e-posta adresi.
  favorites: number[]; // Kullanıcının favoriye eklediği tariflerin ID listesi (Relational Reference).
}

/**
 * Rating Arayüzü
 * -----------------------------------------------------------------------
 * Kullanıcı etkileşimlerini (Puanlama ve Yorum) temsil eden veri modelidir.
 * Bir tarif ile bir kullanıcı arasındaki "Değerlendirme" ilişkisini tanımlar.
 */
export interface Rating {
  id: string; // Yorumun veritabanındaki benzersiz kimliği.
  recipeId: number; // Yorumun yapıldığı tarifin ID'si (Foreign Key).
  userId: string; // Yorumu yapan kullanıcının ID'si (Foreign Key).
  username: string; // Yorumu yapan kişinin o anki kullanıcı adı (Denormalized Data).
  rating: number; // Kullanıcının verdiği puan (Skala: 1-5).
  comment: string; // Kullanıcının metin tabanlı geri bildirimi.
  createdAt: string; // İşlemin gerçekleştiği zaman damgasının ISO string formatı.
}