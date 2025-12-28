# gemini_recipe_generator.py - Python betiği, Gemini API kullanarak malzemeleri ve talimatları doldurmak için

import json
import requests
import time
import os
import re


# ----------------------------------------------------
# 0. Devam etme ayarları
# ----------------------------------------------------

# Not: Bu değişkeni belirli bir tariften başlayarak işlemeyi başlatmak için ayarlamalısınız.
# 252. tariften başlamak istiyorsanız, değer 251 olmalıdır (sayım 0'dan başlıyor).
# Tatlı dosyasını başından işliyorsanız, 0 yapın.
START_INDEX = 0 
# ----------------------------------------------------
# 1. Anahtar Ayarları
# ----------------------------------------------------

# Anahtarı bir ortam değişkeninden okuyun veya doğrudan burada ayarlayın.

# " " yerine gerçek anahtarınızı yazdığınızdan emin olun.
GEMINI_API_KEY = "YOUR_GEMINI_API_KEY" 

# Giriş ve çıkış dosyaları. Bu liste sadece tatlı dosyasını işlemek için değiştirildi.
FILES_TO_PROCESS = [
    {"input": "desserts_with_images.json", "output": "desserts_final.json", "cuisine": "Turkish Dessert"},
]

# API ayarları
GEMINI_MODEL = "gemini-2.5-flash-lite"
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
DELAY_BETWEEN_CALLS = 3 # Her API isteği arasında zorunlu gecikme (saniye cinsinden)

# 429 hatası için yeniden deneme ayarları
MAX_RETRIES = 5 
BASE_DELAY = 2 # İlk bekleme süresi saniye cinsinden (2, 4, 8, 16, 32)
SAVE_INTERVAL = 10 # Otomatik geçici kaydından önce tarif sayısı

# JSON modu (JSON Schema) - çıktıların yapılandırılmış olduğundan emin olmak için
RESPONSE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "ingredients": {
            "type": "ARRAY",
            "description": "Ortak birimlerle malzeme miktarları listesi.",
            "items": {"type": "STRING"}
        },
        "instructions": {
            "type": "ARRAY",
            "description": "Tarifin yapılma yöntemi adım adım liste. Her adım net ve ayrıntılı olmalıdır.",
            "items": {"type": "STRING"}
        }
    },
    "propertyOrdering": ["ingredients", "instructions"],
    "required": ["ingredients", "instructions"]
}

def save_current_recipes(recipes_list, output_file):
    """Tarifler'in mevcut durumunu güvenli bir şekilde çıktı dosyasına kaydedin."""
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(recipes_list, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"     -> Dosya {output_file} için geçici kayıt hatası: {e}")

def generate_recipe_content(recipe_name, cuisine, attempt_num):
    """
    JSON biçiminde malzemeleri ve yapılış yöntemini oluşturmak için Gemini API'ye bağlanır.
    """
    
    # Sistem talimatları (modelin rolünü profesyonel bir aşçı olarak belirleme)
    system_prompt = (
        "Sen Türk mutfağında uzman profesyonel bir aşçısın. Görevin, 'Türk Tatlısı' tarifleri için "
        "ayrıntılı malzemeler listesi (miktarlarıyla birlikte) ve adım adım pişirme talimatları oluşturmaktır. "
        "Çıktı YALNIZCA belirlenen şemaya uygun bir JSON olmalıdır."
    )

    # Kullanıcı sorgusu (porsiyon sayısı 2 olarak ayarlandı)
    user_query = (
        f"Lütfen '{cuisine}' kategorisindeki '{recipe_name}' yemeği için malzemeler ve tarifi oluştur. "
        f"Malzemeler 2 Kişilik porsiyon için uygun olmalıdır. "
        f"Türkçe kullan. Talimatlar ayrıntılı ve anlaşılır olmalıdır."
    )

    payload = {
        "contents": [{"parts": [{"text": user_query}]}],
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": RESPONSE_SCHEMA
        }
    }

    headers = {'Content-Type': 'application/json'}
    
    try:
        # Zaman aşımını artırın çünkü metin oluşturma görüntü almaktan daha uzundur
        response = requests.post(GEMINI_API_URL, headers=headers, json=payload, timeout=60) 
        
        # Bağlantı hatalarını işle
        if response.status_code == 429:
            # Üstel Geri Alma yeniden deneme mantığını uygulamak için 429 durumunu döndür
            return {"error": "Quota Exceeded", "status": 429}
            
        if response.status_code != 200:
            print(f"     -> API Hatası (Durum: {response.status_code}): {response.text[:100]}...")
            return None

        result = response.json()
        
        # JSON çıktısını çıkart ve ayrıştır
        json_text = result.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text')
        
        if not json_text:
            print("     -> Gemini yanıtından metin alınamadı.")
            return None
            
        # Alınan metni temizle ve ayrıştırmadan önce hatalı JSON biçimini düzelt
        json_text_cleaned = json_text.strip().replace("```json\n", "").replace("\n```", "")
        
        return json.loads(json_text_cleaned)
        
    except requests.exceptions.RequestException as e:
        print(f"     -> Bağlantı Hatası (İstek Hatası): {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"     -> Gelen JSON'u çözümleme hatası: {e}")
        return None
    except Exception as e:
        print(f"     -> Beklenmeyen hata: {e}")
        return None

def process_file(input_file, output_file, cuisine_type):
    """
    JSON dosyasını okuyan, tarifleri işleyen ve yeni dosyayı kaydeden ana işlev.
    """
    print(f"\n=======================================================")
    print(f"--- {input_file} dosyası işlenmeye başlanıyor ({cuisine_type}) ---")
    print(f"=======================================================")

    # 1. Giriş dosyasını okuyun
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            file_content = f.read()
            json_text_cleaned = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", file_content)
            json_text_cleaned = json_text_cleaned.replace(u'\u00A0', ' ')
            recipes = json.loads(json_text_cleaned)

    except (json.JSONDecodeError, FileNotFoundError) as e:
        print(f"JSON okuma hatası ({input_file}): {e}")
        return

    total_recipes = len(recipes)
    processed_count = 0

    # 2. Her tarifi geçer ve güncelleyin
    for i, recipe in enumerate(recipes):
        recipe_name = recipe.get('name')

        # Devam etme mantığı (daha önce işlenen tarifleri atla)
        if i < START_INDEX:
            print(f"[{i+1}/{total_recipes}] Atlanıyor: {recipe_name} (Başlangıç indeksi nedeniyle).")
            continue

        if not recipe_name:
            continue

        print(f"\n[{i+1}/{total_recipes}] İşleniyor: {recipe_name}...")

        content = None
        
        # --- Üstel bekleme ve yeniden deneme mantığı ---
        for attempt in range(MAX_RETRIES):
            
            # 3. Gemini'den içerik al
            result = generate_recipe_content(recipe_name, cuisine_type, attempt)

            if isinstance(result, dict) and result.get("status") == 429:
                 # Başarısız: 429 hatası (Kota Sınırı)
                wait_time = BASE_DELAY * (2 ** attempt) 
                
                if attempt < MAX_RETRIES - 1:
                    print(f"     -> API Hatası: Kota aşıldı (429). {wait_time} saniye bekleniyor... (Deneme #{attempt + 2})")
                    time.sleep(wait_time)
                else:
                    print(f"     -> Hata: 5 denemeden sonra başarısız oldu.")
                    break
            
            else:
                content = result
                break # Başarı veya 429 olmayan hata sonrası döngüden çık

        # 4. Son sonucu işle
        if content:
            recipe['ingredients'] = content.get('ingredients', [])
            recipe['instructions'] = content.get('instructions', [])
            print(f"     -> Başarılı: {len(recipe['ingredients'])} malzeme ve {len(recipe['instructions'])} adım eklendi.")
            processed_count += 1
        else:
            print(f"     -> Hata: {recipe_name} için içerik alınamadı. Alanlar olduğu gibi bırakıldı.")

        # 5. Sınır aşmayı önlemek için gecikme
        print(f"     -> Bir sonraki istekten önce {DELAY_BETWEEN_CALLS} saniye bekleniyor...")
        time.sleep(DELAY_BETWEEN_CALLS)
        
        # --- Periyodik geçici kayıt ---
        if (i + 1) % SAVE_INTERVAL == 0:
            save_current_recipes(recipes, output_file)
            print(f"     -> [Geçici Kayıt]: {i + 1} tariften sonra mevcut durum başarıyla kaydedildi.")


    # 6. Son dosyayı kaydet
    save_current_recipes(recipes, output_file) # Son toplu işi kaydetmek için son kayıt
    print(f"\n--- {input_file} dosya işleme tamamlandı ---")
    print(f"{processed_count} tarif güncellendi ve nihai dosya şuraya kaydedildi: {output_file}")


def main():
    if not GEMINI_API_KEY:
        print("Hata: Gemini API anahtarı bulunamadı. Lütfen koda doğru anahtarı ekleyin.")
        return

    for file_info in FILES_TO_PROCESS:
        process_file(file_info["input"], file_info["output"], file_info["cuisine"])

    print("\n\n*** Tüm dosya işleme tamamlandı! ***")


if __name__ == "__main__":
    main()
