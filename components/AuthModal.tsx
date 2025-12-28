// components/AuthModal.tsx
// Bu bileşen, kullanıcıların kimlik doğrulama işlemlerini (Giriş Yap, Kayıt Ol, Şifre Sıfırla)
// gerçekleştirebileceği modal (açılır pencere) arayüzünü sağlar.

import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { CloseIcon } from './icons';
import Spinner from './Spinner';
import * as api from '../services/apiService'; // API servisleri içe aktarılıyor
import { MIN_PASSWORD_LENGTH, MAX_USERNAME_LENGTH, ERROR_MESSAGES } from '../constants';

/**
 * AuthMode Tipi
 * Modalın o anki durumunu (State) belirler.
 * - 'login': Kullanıcı giriş ekranı.
 * - 'signup': Yeni hesap oluşturma ekranı.
 * - 'resetPassword': Şifre sıfırlama talebi ekranı.
 */
type AuthMode = 'login' | 'signup' | 'resetPassword';

/**
 * AuthModalProps Arayüzü
 * Bileşene dışarıdan aktarılan parametreler.
 * - mode: Modalın başlangıçta hangi modda açılacağını belirler.
 * - onClose: Modal kapatıldığında çalışacak fonksiyon.
 */
interface AuthModalProps {
  mode: 'login' | 'signup';
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ mode: initialMode, onClose }) => {
  // --- Durum Yönetimi (State Management) ---
  const [mode, setMode] = useState<AuthMode>(initialMode); // Mevcut görünüm modu
  const [email, setEmail] = useState(''); // E-posta adresi
  const [username, setUsername] = useState(''); // Kullanıcı adı (Sadece kayıt için)
  const [password, setPassword] = useState(''); // Şifre
  const [confirmPassword, setConfirmPassword] = useState(''); // Şifre doğrulama (Sadece kayıt için)
  const [error, setError] = useState<string | null>(null); // Hata mesajları
  const [success, setSuccess] = useState<string | null>(null); // Başarı mesajları (örn: e-posta gönderildi)
  const [isLoading, setIsLoading] = useState(false); // İşlem yüklenme durumu
  const auth = useContext(AuthContext); // Global Auth Context'e erişim

  /**
   * validateEmail - E-posta Validasyonu
   */
  const validateEmail = (emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  /**
   * handleSubmit - Form Gönderme İşlemi
   * Kullanıcının girdiği verilere ve mevcut moda göre ilgili API işlemini başlatır.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Sayfa yenilenmesini engelle
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    // --- 1. Şifre Sıfırlama Mantığı ---
    if (mode === 'resetPassword') {
        if (!validateEmail(email)) {
            setError(ERROR_MESSAGES.INVALID_EMAIL);
            setIsLoading(false);
            return;
        }
        
        try {
            await api.apiSendPasswordResetEmail(email);
            setSuccess('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.');
            setEmail(''); // Başarılı işlem sonrası e-posta alanını temizle
        } catch (err: any) {
            setError(err.message || ERROR_MESSAGES.UNKNOWN_ERROR);
        } finally {
            setIsLoading(false);
        }
        return; // İşlemi burada sonlandır
    }
    
    // --- 2. E-posta Validasyonu ---
    if (!validateEmail(email)) {
        setError(ERROR_MESSAGES.INVALID_EMAIL);
        setIsLoading(false);
        return;
    }
    
    // --- 3. Kayıt Olma Validasyonu ---
    if (mode === 'signup') {
        if (username.length === 0) {
            setError("Kullanıcı adı boş olamaz.");
            setIsLoading(false);
            return;
        }
        
        if (username.length > MAX_USERNAME_LENGTH) {
            setError(`Kullanıcı adı ${MAX_USERNAME_LENGTH} karakterden kısa olmalı.`);
            setIsLoading(false);
            return;
        }
        
        if (password.length < MIN_PASSWORD_LENGTH) {
            setError(ERROR_MESSAGES.INVALID_PASSWORD);
            setIsLoading(false);
            return;
        }
        
        if (password !== confirmPassword) {
            setError('Şifreler eşleşmiyor.');
            setIsLoading(false);
            return;
        }
    }
    
    // --- 4. Giriş Validasyonu ---
    if (mode === 'login') {
        if (password.length === 0) {
            setError("Şifre boş olamaz.");
            setIsLoading(false);
            return;
        }
    }

    // --- 5. Giriş veya Kayıt İşlemi ---
    try {
      if (mode === 'login') {
        // Giriş yapma fonksiyonunu çağır
        await auth?.login(email, password);
      } else {
        // Kayıt olma fonksiyonunu çağır
        await auth?.signup(username, email, password);
      }
      onClose(); // İşlem başarılıysa modalı kapat
    } catch (err: any) {
      setError(err.message || ERROR_MESSAGES.UNKNOWN_ERROR);
    } finally {
      setIsLoading(false); // Yüklenme durumunu kapat
    }
  };

  /**
   * toggleMode - Mod Değiştirme
   * Modalın görünümünü (Giriş/Kayıt/Sıfırlama) değiştirir ve hata/başarı mesajlarını temizler.
   */
  const toggleMode = (targetMode: AuthMode) => {
    setMode(targetMode);
    setError(null);
    setSuccess(null);
  };
  
  // Giriş ve Kayıt arasında hızlı geçiş sağlayan yardımcı fonksiyon
  const switchLoginSignup = () => {
    toggleMode(mode === 'login' ? 'signup' : 'login');
  };

  // Geçerli moda göre modal başlığını belirle
  const getTitle = () => {
    if (mode === 'login') return 'Giriş Yap';
    if (mode === 'signup') return 'Kayıt Ol';
    if (mode === 'resetPassword') return 'Şifremi Sıfırla';
    return '';
  }

  return (
    // Modal Overlay (Arka Plan Karartma)
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      {/* Modal İçerik Kutusu */}
      <div
        className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-8 border border-slate-700 relative animate-fade-in-up"
        onClick={(e) => e.stopPropagation()} // Tıklamanın overlay'e geçmesini engelle
      >
        {/* Kapatma Butonu */}
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200">
          <CloseIcon className="w-6 h-6" />
        </button>
        
        {/* Dinamik Başlık */}
        <h2 className="text-2xl font-bold text-center text-white mb-2">{getTitle()}</h2>
        
        {/* Alt Başlık / Açıklama */}
        {mode !== 'resetPassword' && (
           <p className="text-center text-slate-400 mb-6">{mode === 'login' ? 'Favori ve yorumlar için giriş yapın.' : 'Yeni bir hesap oluşturun.'}</p>
        )}
       
        {/* Başarı Mesajı Gösterimi */}
        {success && (
            <div className="p-4 mb-4 text-sm text-green-300 bg-green-900/50 rounded-lg text-center">
                {success}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Kayıt Modu: Kullanıcı Adı Alanı */}
          {mode === 'signup' && (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-300">Kullanıcı Adı</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
          )}
          
          {/* E-posta Alanı (Her modda görünür) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300">E-posta</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          {/* Şifre Alanı (Şifre sıfırlama modunda gizlenir) */}
          {mode !== 'resetPassword' && (
            <>
              <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-300">Şifre</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-red-500 focus:border-red-500"
                  />
              </div>
            </>
          )}

           {/* Kayıt Modu: Şifre Tekrar Alanı */}
           {mode === 'signup' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300">Şifreyi Onayla</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Lütfen en az 6 karakterli bir şifre belirleyin.
              </p>
            </div>
          )}
          
          {/* Hata Mesajı Gösterimi */}
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          {/* Aksiyon Butonu */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-slate-600"
          >
            {/* Yükleniyorsa Spinner, değilse duruma uygun metin göster */}
            {isLoading ? <Spinner /> : (mode === 'login' ? 'Giriş Yap' : (mode === 'signup' ? 'Kayıt Ol' : 'Sıfırlama Linki Gönder'))}
          </button>
        </form>
        
        {/* Alt Bağlantılar (Şifremi Unuttum / Hesap Oluştur) */}
        {mode === 'login' && (
            <div className="mt-4 text-center text-sm">
                <button onClick={() => toggleMode('resetPassword')} className="font-medium text-red-500 hover:text-red-400">
                    Şifremi unuttum?
                </button>
            </div>
        )}
        
        {mode === 'resetPassword' ? (
             <p className="mt-6 text-center text-sm text-slate-400">
              Giriş yapmaya geri dön?{" "}
              <button onClick={() => toggleMode('login')} className="font-medium text-red-500 hover:text-red-400">
                Giriş Yap
              </button>
            </p>
        ) : (
            <p className="mt-6 text-center text-sm text-slate-400">
              {mode === 'login' ? "Hesabın yok mu? " : "Zaten bir hesabın var mı? "}
              <button onClick={switchLoginSignup} className="font-medium text-red-500 hover:text-red-400">
                {mode === 'login' ? 'Kayıt Ol' : 'Giriş Yap'}
              </button>
            </p>
        )}

      </div>
       {/* CSS Animasyonları */}
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

export default AuthModal;