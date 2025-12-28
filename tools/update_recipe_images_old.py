# recipe_image_downloader.py - Pexels'den Türk yemek resimleri indirmek için Python betiği
import json
import requests
import time
import re
import os

# 1. --- Ayarlar ---
# !! Önemli: API anahtarınızı buraya koyun
PEXELS_API_KEY = ""

# Giriş ve çıkış dosyaları
INPUT_JSON_FILE = 'food.json' 
OUTPUT_JSON_FILE = 'food_with_images.json'
PEXELS_API_URL = 'https://api.pexels.com/v1/search'
MAX_RETRIES = 5 # Her tarif için maksimum arama denemesi
BASE_DELAY = 2 

def search_pexels_image(query, api_key):
    """
    Pexels'de tarif adı kullanarak bir resim arar.
    """
    headers = {
        "Authorization": api_key
    }
    # Sorguyu geliştirme: enhanced_query = f"{query} Turkish Food" silindi
    params = {
        "query": query, # Şimdi ismi olduğu gibi kullanıyoruz
        "per_page": 1,
        "locale": "tr-TR"
    }
    
    try:
        response = requests.get(PEXELS_API_URL, headers=headers, params=params)
        
        if response.status_code == 429:
            return {"error": "Too Many Requests", "status": 429}
        
        if response.status_code == 200:
            data = response.json()
            if data['photos']:
                image_url = data['photos'][0]['src']['large2x']
                return image_url
            else:
                print(f"    -> İçin resim bulunamadı: {query}")
                return None
        else:
            print(f"    -> Pexels bağlantı hatası: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"    -> Bağlantı sırasında beklenmedik hata: {e}")
        return None

def main():
    """
    Betiği çalıştıran ve yeniden deneme mantığını uygulayan ana işlev.
    """
    print("--- Yemek resim güncelleme işlemi başlanıyor ---")
    
    # 1. API anahtarını kontrol et
    if not PEXELS_API_KEY or PEXELS_API_KEY == "YOUR_PEXELS_API_KEY_HERE":
        print("Hata: Lütfen Pexels API anahtarını kod içinde 'PEXELS_API_KEY' değişkenine ekleyin.")
        return

    # 2. JSON dosyasını oku
    try:
        print(f"--- {INPUT_JSON_FILE} dosyasını okumaya başla ---")
        with open(INPUT_JSON_FILE, 'r', encoding='utf-8') as f:
            file_content = f.read()
            # Geçersiz karakterleri işlemek için temizleme adımı
            json_text_cleaned = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", file_content)
            json_text_cleaned = json_text_cleaned.replace(u'\u00A0', ' ')

            # Yemek tarifleri dizisini çıkar (recipes array)
            recipes = json.loads(json_text_cleaned)
            
            if not isinstance(recipes, list):
                print("Hata: Çıkarılan metin bir dizi değildi.")
                return
                
    except (json.JSONDecodeError, FileNotFoundError) as e:
        print(f"JSON okuma kritik hatası: {e}")
        return
        
    print(f"{len(recipes)} yemek bulundu ve başarıyla temizlendi. Resimleri aranıyor...")
    
    updated_recipes = []
    
    # 3. Her yemeği geçer ve resmi güncelle
    for recipe in recipes:
        recipe_name = recipe.get('name')
        if not recipe_name:
            continue
            
        print(f"\nAranıyor: {recipe_name}...")
        
        image_found = False
        
        # --- Üstel bekleme ve yeniden deneme mantığı ---
        for attempt in range(MAX_RETRIES):
            
            # 3.1. Resmi ara
            result = search_pexels_image(recipe_name, PEXELS_API_KEY)
            
            # 3.2. Arama sonuçlarını işle
            if isinstance(result, str):
                # Başarı: Resim bağlantısı bulundu
                recipe['image'] = result
                print(f"    -> Başarıyla güncellendi (Deneme #{attempt + 1}).")
                image_found = True
                break # Deneme döngüsünden çık
            
            elif isinstance(result, dict) and result.get("status") == 429:
                # Başarısız: 429 hatası (Çok Fazla İstek)
                wait_time = BASE_DELAY * (2 ** attempt) # Üstel bekleme süresini hesapla (2, 4, 8, 16, 32 saniye...)
                
                if attempt < MAX_RETRIES - 1:
                    print(f"    -> Hata: İstek sınırı aşıldı (429). {wait_time} saniye bekleniyor (Deneme #{attempt + 2}...)...")
                    time.sleep(wait_time)
                else:
                    print(f"    -> Başarısız: {MAX_RETRIES} denemeden sonra istek sınırı aşıldı (429).")
                    break
            
            elif result is None:
                # Başarısız: Resim bulunamadı
                break
                
            else:
                # Başarısız: Başka bir bağlantı hatası
                break
        
        # 4. Sonucu kaydet (resim bulundu ya da denemeler tükendi)
        if not image_found:
            print(f"    -> Yer tutucu resim {MAX_RETRIES} denemeden sonra bırakıldı.")
            
        # Yemeği (güncellendi ya da değilse) son listeye ekle
        updated_recipes.append(recipe)
        
        # 5. Her yemek arasında temel zorunlu gecikme (429 sınırına ulaşmayı önlemek için)
        time.sleep(1.5) 

    # 6. Yeni dosyayı kaydet
    try:
        with open(OUTPUT_JSON_FILE, 'w', encoding='utf-8') as f:
            json.dump(updated_recipes, f, ensure_ascii=False, indent=2)
        print("\n--- İşlem başarıyla tamamlandı! ---")
        print(f"Güncellenmiş yemekler resimlerle kaydedildi: {OUTPUT_JSON_FILE}")
    except Exception as e:
        print(f"Yeni dosya kaydedilirken hata: {e}")

if __name__ == "__main__":
    main()
