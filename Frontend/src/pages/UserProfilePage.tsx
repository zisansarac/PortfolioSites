/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/UserProfilePage.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../auth/AuthContext";

// Backend'den dönen tüm User alanlarını içeren tip
type UserProfile = {
    fullName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    email: string;
};

const UserProfilePage: React.FC = () => {
    const { isAuthenticated, user, login } = useAuth();
    const navigate = useNavigate();

    // Form alanları için yerel state'ler
    const [fullName, setFullName] = useState(user?.fullName || "");
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
    const [bio, setBio] = useState(user?.bio || "");
    
    // Yüklenme/Hata state'leri
    const [loading, setLoading] = useState(false); // Form gönderme yüklenmesi
    
    // 🔥 YENİ DURUM: Profil verisini çekerken yüklenme durumu
    // Başlangıçta TRUE, çünkü AuthContext'in token kontrolü bitene kadar beklememiz gerek.
    const [isFetchingProfile, setIsFetchingProfile] = useState(true); 

    const [fetchError, setFetchError] = useState<string | null>(null);
    const [updateSuccess, setUpdateSuccess] = useState(false);

    // -----------------------------------------------------------------
    // 🔥 KRİTİK DÜZELTME: Yönlendirme ve AuthContext Senkronizasyonu
    useEffect(() => {
        const token = localStorage.getItem('token');
        
        // 1. Eğer token varsa, yüklenme bitene kadar (isFetchingProfile=false) hiçbir şey yapma.
        // Bu, AuthContext'in tokenı okuyup isAuthenticated'ı TRUE yapmasına zaman tanır.
        if (token && isFetchingProfile) {
            return;
        }

        // 2. Yükleme bittiğinde (isFetchingProfile=false) veya token olmadığında kontrol et:
        if (!isAuthenticated && !token) {
            navigate("/login");
        }
        
    }, [isAuthenticated, navigate, isFetchingProfile]); // isFetchingProfile eklendi
    // -----------------------------------------------------------------


    // Eğer AuthContext'teki veriler değişirse formu güncelle
    useEffect(() => {
        if (user) {
            setFullName(user.fullName || "");
            setAvatarUrl(user.avatarUrl || "");
            setBio(user.bio || "");
        }
    }, [user]);

    // Opsiyonel: Backend'den en güncel profil verisini çekme (GET /api/users/me)
    const fetchUserProfile = async () => {
        setFetchError(null);
        setIsFetchingProfile(true); // Veri çekmeye başla
        try {
            const res = await api.get<UserProfile>("/api/users/me");
            const updatedUser = res.data;
            
            setFullName(updatedUser.fullName || "");
            setAvatarUrl(updatedUser.avatarUrl || "");
            setBio(updatedUser.bio || "");
            
        } catch (err: any) {
             setFetchError("Profil bilgileri çekilemedi.");
        } finally {
            setIsFetchingProfile(false); // Veri çekme bitti
        }
    };

    // Component yüklendiğinde ve isAuthenticated True olduğunda profili çek
    useEffect(() => {
        if (isAuthenticated) {
            // Sadece AuthContext başarılı bir şekilde giriş yaptığında veriyi çek
            fetchUserProfile();
        } else {
            // Eğer isAuthenticated false ise (ve token yoksa) yüklemeyi bitir.
            // (Token varsa, zaten üstteki useEffect'te True olmasını bekliyoruz)
            if (!localStorage.getItem('token')) {
                 setIsFetchingProfile(false);
            }
        }
    }, [isAuthenticated]); 


    // --- Form Gönderme: PUT /api/users/me ---
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); // Form gönderme yüklenmesi
        setUpdateSuccess(false);
        setFetchError(null);

        const updateData = {
            fullName: fullName,
            avatarUrl: avatarUrl, 
            bio: bio, 
        };
        

        try {
            await api.put("/api/users/me", updateData);

            if (user && login) {
                login(localStorage.getItem('token')!, {
                    email: user.email,
                    fullName: updateData.fullName,
                    avatarUrl: updateData.avatarUrl,
                    bio: updateData.bio
                });
            }
            
            setUpdateSuccess(true);
        } catch (err: any) {
            setFetchError(err.response?.data?.message || "Profil güncellenemedi.");
        } finally {
            setLoading(false); // Form gönderme yüklenmesi bitti
        }
    };

    // Avatar Önizlemesi Bileşeni
    const AvatarDisplay = () => {
        const avatarPreviewClass = "w-24 h-24 rounded-full object-cover border-2 border-[#888f9c] mb-4";
        const defaultAvatarClass = "w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-4xl text-gray-500 mb-4";

        if (avatarUrl) {
            return (
                <img 
                    src={avatarUrl} 
                    alt="Profil Resmi Önizlemesi" 
                    className={avatarPreviewClass}
                    onError={(e) => { 
                        e.currentTarget.style.display = 'none'; 
                    }}
                />
            );
        }
        return <div className={defaultAvatarClass}>👤</div>;
    }

    // --- YÜKLENİYOR EKRANI (PostEditPage'deki gibi) ---
    // Eğer AuthContext tokenı kontrol ediyor VE/VEYA biz API'dan veriyi çekiyorsak
    // Bu, hem Auth Context'in beklemesini hem de API'dan verinin gelmesini kapsar.
    if (isFetchingProfile) {
         return (
            <div className="w-full max-w-xl mx-auto my-12 p-8 sm:p-12 bg-white rounded-xl shadow-2xl flex justify-center items-center h-64">
                <p className="text-[#0f172a] text-lg font-medium">Profil bilgileri yükleniyor...</p>
            </div>
        );
    }
    
    // Yönlendirme, üstteki useEffect içinde yapıldığı için, buraya gelindiyse
    // ve isAuthenticated false ise, bu bir hatadır (ama yine de koruma).
    if (!isAuthenticated) return <div>Giriş Yapılmadı.</div>; 
    
    return (
        <div className="w-full max-w-xl mx-auto my-12 p-8 sm:p-12 bg-white rounded-xl shadow-2xl transition-all duration-300">
            {/* ... (Başlıklar, Form ve diğer içerikler) ... */}
            <h1 className="text-[#111318] text-3xl font-black leading-tight tracking-[-0.033em] mb-6 border-b pb-4">
                👤 Profil Bilgilerini Güncelle
            </h1>
            
            {fetchError && (
                <div className="text-sm text-red-600 bg-red-100 p-3 rounded-lg border border-red-300 mb-4">
                    {fetchError}
                </div>
            )}

            <div className="flex flex-col items-center mb-6">
                <AvatarDisplay />
            </div>
            
            <p className="text-[#444e63] text-base font-medium mb-6">
                <strong>E-posta:</strong> {user?.email} 
            </p>
            
            <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
                
                {/* Ad Soyad */}
                <label className="flex flex-col">
                    <p className="text-[#111318] text-base font-medium leading-normal pb-2">Tam Adınız</p>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="form-input flex w-full h-12 p-[15px] bg-neutral-100 border border-[#888f9c] rounded-lg focus:border-[#0f172a] focus:ring-2 focus:ring-[#0f172a]/20 text-base font-normal leading-normal outline-none transition-colors"
                        placeholder="Adınızı ve Soyadınızı girin"
                    />
                </label>
                
                {/* Avatar URL */}
                <label className="flex flex-col">
                    <p className="text-[#111318] text-base font-medium leading-normal pb-2">Avatar URL (Opsiyonel)</p>
                    <input
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        className="form-input flex w-full h-12 p-[15px] bg-neutral-100 border border-[#888f9c] rounded-lg focus:border-[#0f172a] focus:ring-2 focus:ring-[#0f172a]/20 text-base font-normal leading-normal outline-none transition-colors"
                        placeholder="Profil fotoğrafı linki"
                    />
                    <small className="text-[#444e63] text-sm font-light leading-normal mt-1">Temizlemek/kaldırmak için alanı boş bırakıp kaydedin.</small>
                </label>

                {/* Biyo (Bio) */}
                <label className="flex flex-col">
                    <p className="text-[#111318] text-base font-medium leading-normal pb-2">Biyo (Opsiyonel)</p>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="form-input flex w-full p-[15px] bg-neutral-100 border border-[#888f9c] rounded-lg focus:border-[#0f172a] focus:ring-2 focus:ring-[#0f172a]/20 text-base font-normal leading-normal outline-none transition-colors min-h-[100px] resize-y"
                        placeholder="Kendiniz hakkında kısa bir şeyler yazın"
                    />
                    <small className="text-[#444e63] text-sm font-light leading-normal mt-1">Temizlemek/kaldırmak için alanı boş bırakıp kaydedin.</small>
                </label>
                
                
                {updateSuccess && (
                    <div className="text-sm text-green-600 bg-green-100 p-3 rounded-lg border border-green-300 mt-4">
                        ✅ Profil başarıyla güncellendi!
                    </div>
                )}

                {/* Buton Stili */}
                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 flex h-14 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[#0f172a] text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#0f172a]/90 transition-colors duration-200 disabled:bg-[#0f172a]/50"
                >
                    <span className="truncate">{loading ? "💾 Kaydediliyor..." : "Profili Güncelle"}</span>
                </button>
            </form>
        </div>
    );
};

export default UserProfilePage;