// components/UserInfoPage.tsx
// Bu bileşen, oturum açmış olan kullanıcının profil detaylarını (kullanıcı adı, e-posta) görüntülediği sayfayı oluşturur.

import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { UserCircleIcon } from './icons';

/**
 * UserInfoPage Bileşeni
 * -----------------------------------------------------------------------
 * Kimlik doğrulama bağlamından (AuthContext) alınan verileri kullanarak 
 * kullanıcıya özel bir profil özeti sunar.
 */
const UserInfoPage: React.FC = () => {
    // AuthContext üzerinden global durumdaki kullanıcı verisine (user object) erişim sağlanır.
    const auth = useContext(AuthContext);

    // --- Güvenlik Kontrolü (Auth Guard) ---
    // Eğer kullanıcı nesnesi mevcut değilse (null), yani kullanıcı giriş yapmamışsa;
    // profil detayları yerine giriş yapılması gerektiğini belirten bir uyarı arayüzü render edilir.
    if (!auth?.user) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Kullanıcı Bilgilerinizi Görüntülemek İçin Giriş Yapın</h2>
            </div>
        );
    }

    // --- Ana Render (Profil Görüntüleme) ---
    return (
        <div>
            {/* Sayfa Başlığı Alanı: Sayfanın amacını belirten başlık ve kısa açıklama */}
            <div className="bg-slate-800 py-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Kullanıcı Bilgilerim</h1>
                    <p className="mt-2 text-lg text-slate-300">Hesap detaylarınız ve profil bilgileriniz.</p>
                </div>
            </div>

            {/* Kullanıcı Profil Kartı: İkon ve bilgilerin merkezi olarak gösterildiği alan */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-lg">
                <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 text-center">
                    {/* Profil İkonu */}
                    <UserCircleIcon className="w-24 h-24 mx-auto text-slate-500 mb-4" />
                    
                    {/* Kullanıcı Bilgilerinin Listelendiği Bölüm */}
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-slate-400">Kullanıcı Adı</p>
                            {/* Dinamik veri: Kullanıcı adı */}
                            <p className="text-xl font-semibold text-white">{auth.user.username}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">E-posta Adresi</p>
                            {/* Dinamik veri: E-posta adresi */}
                            <p className="text-xl font-semibold text-white">{auth.user.email}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserInfoPage;