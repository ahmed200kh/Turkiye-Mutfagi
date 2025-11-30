// services/geminiService.ts
// Bu modül, uygulamanın Yapay Zeka (AI) yeteneklerini yöneten servis katmanıdır.
// Google Gemini API ile iletişim kurarak akıllı tarif önerileri ve sohbet botu (Chatbot) fonksiyonlarını sağlar.

import { GoogleGenAI, Type, Chat } from "@google/genai";
import { type AiRecipeSuggestion } from '../types';

// Not: Güvenlik ve yapılandırma gereği, API anahtarı çevresel değişkenlerden (environment variables) alınır.
// Bu anahtar, Google Cloud projesine yetkili erişim sağlar.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * getRecipeSuggestions - Akıllı Tarif Öneri Motoru
 * -----------------------------------------------------------------------
 * Kullanıcının elindeki malzemeleri analiz eder ve Gemini AI modelini kullanarak
 * bağlama uygun, yapılandırılmış (Structured JSON) tarif önerileri üretir.
 * * @param ingredients - Kullanıcının girdiği malzeme listesi (virgülle ayrılmış string).
 * @param recipeType - İstenen tarif kategorisi ('Ana Yemek' veya 'Tatlı').
 * @param suggestionCount - Üretilecek öneri sayısı.
 * @param ingredientStrictness - Malzeme kullanım kısıtı ('strict': Sadece eldekiler, 'flexible': Ek malzeme eklenebilir).
 * @returns AiRecipeSuggestion tipinde yapılandırılmış tarif nesneleri dizisi.
 */
export const getRecipeSuggestions = async (
  ingredients: string,
  recipeType: 'Ana Yemek' | 'Tatlı',
  suggestionCount: number,
  ingredientStrictness: 'strict' | 'flexible'
): Promise<AiRecipeSuggestion[]> => {
  // Model Seçimi: Karmaşık metin üretimi ve JSON yapılandırması için optimize edilmiş 'gemini-2.5-flash' modeli kullanılır.
  const model = 'gemini-2.5-flash'; 

  // Prompt Mühendisliği (Prompt Engineering):
  // Modelin davranışını yönlendirmek için kullanıcının kısıtlamalarına göre dinamik talimat oluşturulur.
  const strictnessInstruction = ingredientStrictness === 'strict' 
    ? "Önerdiğin tarifler SADECE ve SADECE verdiğim malzemelerle yapılabilmeli. Kesinlikle ek malzeme gerektirmemeli."
    : "Verdiğim malzemeleri ana malzeme olarak kullan, ancak tariflerin daha lezzetli olması için birkaç ek temel malzeme (tuz, karabiber, yağ, su gibi) önerebilirsin.";

  // Ana Prompt: Modelden beklenen görev ve çıktı formatı net bir şekilde tanımlanır.
  const prompt = `
    Elimdeki malzemeler: "${ingredients}".
    ${strictnessInstruction}
    Bu malzemeleri kullanarak bana ${suggestionCount} tane, Türk mutfağına uygun, "${recipeType}" kategorisinde tarif öner.
    Önerdiğin her tarif için bir tarif adı, kısa bir açıklama, gerekli malzemelerin listesi ve hazırlama adımlarının listesini ver.
    Cevabın sadece JSON formatında olsun.
  `;

  // Şema Tanımlaması (Schema Definition):
  // Modelin çıktısının (Output) uygulama tarafından işlenebilir olması için katı bir JSON şeması zorunlu kılınır.
  // Bu, AI'ın rastgele metin yerine belirlenen veri yapısında (Array of Objects) yanıt vermesini garanti eder.
  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        recipeName: {
          type: Type.STRING,
          description: 'Önerilen tarifin adı.',
        },
        description: {
          type: Type.STRING,
          description: 'Tarif hakkında kısa ve iştah açıcı bir açıklama.',
        },
        ingredients: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
          description: 'Tarif için gerekli malzemeler listesi.',
        },
        instructions: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
          description: 'Tarifin hazırlanış adımları listesi.',
        },
      },
      required: ['recipeName', 'description', 'ingredients', 'instructions'],
    },
  };

  try {
    // API İsteği: Yapılandırılmış model ve prompt ile içerik üretimi başlatılır.
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        // Response MIME Type ve Schema ayarları ile deterministik çıktı sağlanır.
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    // API Yanıtının İşlenmesi
    const text = response.text;
    
    // JSON Ayrıştırma (Parsing)
    const suggestions: AiRecipeSuggestion[] = JSON.parse(text);

    // Tip Güvenliği Kontrolü: Dönen verinin beklenen dizi formatında olup olmadığı doğrulanır.
    if (!Array.isArray(suggestions)) {
        throw new Error("API'den beklenen formatta bir dizi dönmedi.");
    }
    
    return suggestions;

  } catch (error) {
    console.error("Gemini API isteği sırasında hata:", error);
    
    // Hata Yönetimi: Kullanıcıya anlamlı bir hata mesajı iletmek için hata yeniden fırlatılır.
    if (error instanceof Error) {
        throw new Error(`Tarif önerileri alınamadı: ${error.message}`);
    }
    // Bilinmeyen hata durumları için genel mesaj
    throw new Error("Tarif önerileri alınırken bilinmeyen bir sorun oluştu. Lütfen API anahtarınızı kontrol edin.");
  }
};


// --- Akıllı Yardımcı (Chatbot) Servisi ---

// Chat Oturumu Başlatma:
// Süreklilik arz eden bir diyalog (sohbet) için model yapılandırılır.
// 'systemInstruction' ile modele bir "Persona" (Kişilik) atanır.
const chatbot: Chat = ai.chats.create({
  model: 'gemini-2.5-flash',
  config: {
    // Sistem Talimatı: Modelin rolünü, uzmanlık alanını ve iletişim tonunu belirler.
    systemInstruction: 'Sen Türk mutfağı konusunda uzman, yardımsever bir aşçısın. Adın "Akıllı Yardımcı". Kullanıcılara tarifler bulmalarında, yemek pişirme teknikleri hakkında bilgi vermede ve malzemeler hakkında sorularını yanıtlamada yardımcı ol. Cevapların samimi, anlaşılır ve teşvik edici olsun. Cevaplarını markdown formatında verme, düz metin kullan.',
  },
});

/**
 * sendMessageToBot - Mesaj Gönderimi
 * Kullanıcının mesajını aktif sohbet oturumuna iletir ve AI'ın yanıtını döndürür.
 * * @param message - Kullanıcıdan gelen metin girdisi.
 * @returns AI modelinden gelen metin yanıtı.
 */
export const sendMessageToBot = async (message: string): Promise<string> => {
  try {
    // Mevcut sohbet geçmişini koruyarak yeni mesajı gönder.
    const response = await chatbot.sendMessage({ message: message });
    return response.text;
  } catch (error) {
    console.error("Chatbot mesaj gönderimi sırasında hata:", error);
    return "Üzgünüm, şu anda bir sorunla karşılaştım. Lütfen daha sonra tekrar deneyin.";
  }
};