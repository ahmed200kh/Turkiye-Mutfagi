// components/Chatbot.tsx
// Bu bileşen, uygulamanın sağ alt köşesinde bulunan ve kullanıcı ile etkileşime geçen
// yapay zeka destekli sohbet arayüzünü (Chatbot) oluşturur.

import React, { useState, useRef, useEffect } from 'react';
import { ChatBubbleIcon, CloseIcon, PaperAirplaneIcon, SmartChefIcon } from './icons';
// Gemini AI servisi ile iletişim kurmak için gerekli fonksiyonun içe aktarılması
import { sendMessageToBot } from '../services/geminiService';
import Spinner from './Spinner';

// Sohbet arayüzündeki her bir mesajın veri yapısını tanımlayan TypeScript arayüzü.
interface Message {
  text: string;           // Mesajın içeriği
  sender: 'user' | 'bot'; // Mesajı gönderen taraf (Kullanıcı veya Bot)
}

const Chatbot: React.FC = () => {
  // ---------------------------------------------------------------------------
  // DURUM YÖNETİMİ (STATE MANAGEMENT)
  // ---------------------------------------------------------------------------

  // Sohbet penceresinin görünürlük durumu (Açık/Kapalı)
  const [isOpen, setIsOpen] = useState(false);

  // Mesaj geçmişini tutan dizi. Başlangıçta bir karşılama mesajı içerir.
  const [messages, setMessages] = useState<Message[]>([
    { 
      text: "Merhaba! Ben Akıllı Yardımcı. Türk mutfağıyla ilgili ne merak ediyorsun? Örneğin, 'bana bir tavuk tarifi öner' diyebilirsin.", 
      sender: 'bot' 
    }
  ]);

  // Kullanıcının metin giriş alanındaki anlık değerini tutar
  const [inputValue, setInputValue] = useState('');

  // API isteği sırasında yüklenme (bekleme) durumunu kontrol eder
  const [isLoading, setIsLoading] = useState(false);
  
  // ---------------------------------------------------------------------------
  // REFERANSLAR (REFS)
  // ---------------------------------------------------------------------------

  // Mesaj listesinin sonuna otomatik kaydırma (Auto-scroll) yapmak için kullanılan referans
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // ---------------------------------------------------------------------------
  // YAN ETKİLER (SIDE EFFECTS)
  // ---------------------------------------------------------------------------

  // 'messages' dizisi her güncellendiğinde (yeni mesaj geldiğinde),
  // görünümü en son mesaja kaydırır.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---------------------------------------------------------------------------
  // OLAY İŞLEYİCİLERİ (EVENT HANDLERS)
  // ---------------------------------------------------------------------------

  /**
   * Kullanıcı mesajı gönderdiğinde çalışır.
   * Mesajı listeye ekler, API'ye gönderir ve yanıtı bekler.
   */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault(); // Sayfa yenilenmesini engelle
    
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return; // Boş mesaj gönderimini engelle

    // 1. Kullanıcının mesajını arayüze ekle (Optimistic Update)
    setMessages(prev => [...prev, { text: trimmedInput, sender: 'user' }]);
    setInputValue(''); // Giriş alanını temizle
    setIsLoading(true); // Yüklenme durumunu başlat

    try {
        // 2. Yapay zeka servisine mesajı gönder ve yanıtı bekle
        const botResponse = await sendMessageToBot(trimmedInput);
        
        // 3. Botun yanıtını mesaj listesine ekle
        setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
    } catch (error) {
        // Hata durumunda kullanıcıya bilgi ver
        setMessages(prev => [...prev, { text: "Üzgünüm, bir hata oluştu.", sender: 'bot' }]);
        console.error("Chatbot hatası:", error);
    } finally {
        setIsLoading(false); // İşlem tamamlandı
    }
  };

  /**
   * Sohbet penceresini açıp kapatan fonksiyon (Toggle).
   */
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // ---------------------------------------------------------------------------
  // ARAYÜZ (RENDER)
  // ---------------------------------------------------------------------------

  // Durum 1: Chatbot kapalıyken sadece açma butonu gösterilir.
  if (!isOpen) {
    return (
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-red-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-200 z-30"
        aria-label="Yardımcı'yı aç"
      >
        <ChatBubbleIcon className="w-8 h-8" />
      </button>
    );
  }

  // Durum 2: Chatbot açıkken sohbet penceresi gösterilir.
  return (
    <div className="fixed bottom-6 right-6 w-[350px] h-[500px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col z-30 animate-fade-in-up">
      
      {/* --- Üst Başlık (Header) --- */}
      <div className="flex items-center justify-between p-4 bg-slate-800 rounded-t-2xl border-b border-slate-700">
        <div className="flex items-center gap-2">
            <SmartChefIcon className="w-6 h-6 text-red-500"/>
            <h3 className="font-bold text-white">Akıllı Yardımcı</h3>
        </div>
        <button onClick={toggleChat} className="text-slate-400 hover:text-white">
          <CloseIcon className="w-6 h-6" />
        </button>
      </div>

      {/* --- Mesaj Alanı (Body) --- */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-red-600 text-white rounded-br-lg' : 'bg-slate-700 text-slate-200 rounded-bl-lg'}`}>
              {/* HTML içeriğini güvenli bir şekilde render et (Satır sonları için) */}
              <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />
            </div>
          </div>
        ))}
        
        {/* Yüklenme Animasyonu (Bot yazıyor...) */}
        {isLoading && (
          <div className="flex justify-start">
             <div className="max-w-xs px-4 py-2 rounded-2xl bg-slate-700 text-slate-200 rounded-bl-lg flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
             </div>
          </div>
        )}
        
        {/* Otomatik kaydırma hedefi */}
        <div ref={messagesEndRef} />
      </div>

      {/* --- Giriş Alanı (Footer) --- */}
      <div className="p-4 border-t border-slate-700">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Bir mesaj yazın..."
            className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 disabled:bg-slate-600"
            disabled={isLoading || !inputValue.trim()}
            aria-label="Gönder"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
      
      {/* Animasyon Stilleri */}
      <style>{`
            @keyframes fade-in-up {
                0% { opacity: 0; transform: translateY(20px) scale(0.95); }
                100% { opacity: 1; transform: translateY(0) scale(1); }
            }
            .animate-fade-in-up {
                animation: fade-in-up 0.3s ease-out forwards;
            }
      `}</style>
    </div>
  );
};

export default Chatbot;