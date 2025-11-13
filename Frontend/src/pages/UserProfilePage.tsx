/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */


import React, { useState, useEffect, useRef, type ChangeEvent } from "react";
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
    // updateUser'ı AuthContext'ten almayı unutma
    const { isAuthenticated, user, login, updateUser } = useAuth();
    const navigate = useNavigate();

    // Dosya inputuna referans (UI'daki daireye tıklayınca dosya seçimi için)
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form alanları için yerel state'ler
    // Not: user objesi null ise, bu state'ler ilk render'da boş başlar.
    // fetchUserProfile çağrısı bu state'leri backend verileriyle güncelleyecektir.
    const [fullName, setFullName] = useState(user?.fullName || "");
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
    const [bio, setBio] = useState(user?.bio || "");
    
    // Yüklenme/Hata state'leri
    const [loading, setLoading] = useState(false); // Form gönderme yüklenmesi
    const [isFetchingProfile, setIsFetchingProfile] = useState(true); 

    const [fetchError, setFetchError] = useState<string | null>(null);
    const [updateSuccess, setUpdateSuccess] = useState(false);

    // Yönlendirme ve AuthContext Senkronizasyonu
    useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (token && isFetchingProfile) {
            return;
        }

        if (!isAuthenticated && !token && !isFetchingProfile) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate, isFetchingProfile]); 

    // Eğer AuthContext'teki veriler değişirse formu güncelle
    // Bu, Home Page'den gelindiğinde veya başarılı güncellemelerden sonra formun dolmasını sağlar.
    useEffect(() => {
        if (user) {
            setFullName(user.fullName || "");
            setAvatarUrl(user.avatarUrl || "");
            setBio(user.bio || "");
        }
    }, [user]);

    // Backend'den en güncel profil verisini çekme (GET /api/users/me)
    const fetchUserProfile = async () => {
        setFetchError(null);
        setIsFetchingProfile(true);
        try {
            const res = await api.get<UserProfile>("/api/users/me");
            const updatedUser = res.data;
            
            // Form state'lerini güncelle (bu sayfanın kendisi için)
            setFullName(updatedUser.fullName || "");
            setAvatarUrl(updatedUser.avatarUrl || "");
            setBio(updatedUser.bio || "");
            
            // AuthContext'i backend'den gelen en güncel verilerle güncelle.
            // Bu, HomePage'deki kartın login sonrası ve /profile'a her gelindiğinde 
            // güncel veriyi görmesini sağlar.
            if (updateUser) {
                updateUser({ 
                    email: updatedUser.email, 
                    fullName: updatedUser.fullName, 
                    avatarUrl: updatedUser.avatarUrl, 
                    bio: updatedUser.bio 
                });
            }

        } catch (err: any) {
            setFetchError("Profil bilgileri çekilemedi.");
        } finally {
            setIsFetchingProfile(false);
        }
    };

    // Component yüklendiğinde ve token mevcutsa profili çek
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (isAuthenticated || token) {
            fetchUserProfile();
        } else {
            setIsFetchingProfile(false); 
        }
    }, [isAuthenticated]); // isAuthenticated değiştiğinde tetiklenir

    // Dosya Seçimi ve Base64 Dönüşümü ---
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        
        if (file) {
            // Sadece resim dosyalarını kabul et
            if (!file.type.startsWith('image/')) {
                setFetchError("Lütfen sadece bir resim dosyası seçin (JPG, PNG, vb.).");
                setAvatarUrl('');
                return;
            }
            
            // Büyük dosyaları engelle 
            if (file.size > 5 * 1024 * 1024) {
                setFetchError("Resim boyutu 5MB'ı aşmamalıdır.");
                setAvatarUrl('');
                return;
            }

            setFetchError(null);
            const reader = new FileReader();
            
            reader.onloadstart = () => setLoading(true); // Dosya okuma başlarken loading
            
            reader.onloadend = () => {
                // Base64 string'ini avatarUrl olarak kullan
                setAvatarUrl(reader.result as string);
                setLoading(false); // Dosya okuma bitti
            };
            
            reader.onerror = () => {
                setFetchError("Dosya okuma hatası.");
                setLoading(false);
            };
            
            reader.readAsDataURL(file);
        }
    };

    // Avatarı Temizleme 
    const clearAvatar = () => {
        setAvatarUrl("");
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // File input değerini sıfırla
        }
    };

    // --- Form Gönderme: PUT /api/users/me ---
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); // Form gönderme yüklenmesi
        setUpdateSuccess(false);
        setFetchError(null);

        const updateData = {
            fullName: fullName,
            avatarUrl: avatarUrl || null,
            bio: bio || null,
        };
        
        try {
            await api.put("/api/users/me", updateData);

            if (user && updateUser) {
                // Auth Context'i güncel verilerle yenile
                updateUser({
                    email: user.email,
                    fullName: updateData.fullName,
                    avatarUrl: updateData.avatarUrl,
                    bio: updateData.bio
                });
            }
            
            setUpdateSuccess(true);
            // navigate("/");
        } catch (err: any) {
            setFetchError(err.response?.data?.message || "Profil güncellenemedi. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false); // Form gönderme yüklenmesi bitti
        }
    };

    // --- Avatar Önizlemesi ve Yükleme Mekanizması ---
    const AvatarUploadSection = () => {
        const avatarPreviewClass = "w-28 h-28 rounded-full object-cover border-4 border-sky-900 transition duration-300 hover:border-sky-700 group-hover:scale-105 cursor-pointer shadow-lg";
        const defaultAvatarClass = "w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center text-4xl text-gray-500 transition duration-300 hover:bg-gray-300 group-hover:scale-105 cursor-pointer shadow-lg";

        const handleClick = () => {
             // Daireye tıklanınca gizli dosya seçme penceresini aç
             fileInputRef.current?.click();
        };

        return (
            <div className="flex flex-col items-center mb-8">
                {/* 1. Gizli Dosya Inputu */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />

                {/* 2. Görsel Alanı (Tıklanabilir) */}
                <div
                    onClick={handleClick}
                    className="relative group flex flex-col items-center justify-center"
                >
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt="Profil Resmi Önizlemesi"
                            className={avatarPreviewClass}
                            // Resim yüklenemezse (örneğin Base64 hatası veya geçersiz URL)
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                // Hata durumunda default ikonu göster
                                e.currentTarget.style.display = 'none';
                                setAvatarUrl(''); // Base64'ü temizle, default icon çıksın
                            }}
                        />
                    ) : (
                        <div className={defaultAvatarClass}>
                            {/* SVG Icon: Resim Ekleme */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-600 hover:text-sky-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-4.5-4.5L9 19"/>
                            </svg>
                        </div>
                    )}
                    {/* Hover Efekti */}
                    <div className="absolute inset-0 w-28 h-28 flex items-center justify-center bg-transparent bg-opacity-30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <span className="text-white text-xs font-bold text-center">Choose a new image</span>
                    </div>
                </div>

                {/* 3. Resmi Kaldır Butonu */}
                {avatarUrl && (
                    <button
                        type="button"
                        onClick={clearAvatar}
                        className="mt-3 text font-medium text text-red-500 hover:text-red-700 transition-colors"
                    >
                        Drop the current image
                    </button>
                )}
            </div>
        );
    }
    
    // --- YÜKLENİYOR EKRANI ---
    if (isFetchingProfile || loading) {
          return (
              <div className="w-full max-w-xl mx-auto my-12 p-8 sm:p-12 bg-white rounded-xl shadow-2xl flex justify-center items-center h-64">
                  <p className="text-[#0f172a] text-lg font-medium">
                      {loading ? "Saving..." : "Loading..."}
                  </p>
              </div>
          );
    }
    
    // Güvenlik: Eğer yetkilendirme yoksa
    if (!isAuthenticated) return <div>Giriş Yapılmadı.</div>;
    
    return (
        <div className="w-full max-w-xl mx-auto my-12 p-8 sm:p-12 bg-white rounded-xl shadow-2xl transition-all duration-300">
            <h1 className="text-[#111318] text-2xl font-black leading-tight tracking-[-0.033em] mb-6 border-b pb-4">
                Update Your Profile
            </h1>
            
            {/* Hata Mesajları */}
            {fetchError && (
                <div className="text-sm text-red-600 bg-red-100 p-3 rounded-lg border border-red-300 mb-4">
                    {fetchError}
                </div>
            )}
            
            {/* Avatar Yükleme Alanı */}
            <AvatarUploadSection />

            <p className="text-[#444e63] text-base font-medium mb-6 ">
                <strong>Email:</strong> {user?.email}
            </p>
            
            <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
                
                {/* Ad Soyad */}
                <label className="flex flex-col">
                    <p className="text-[#111318] text-base font-medium leading-normal pb-2">Your Full Name</p>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="form-input flex w-full h-12 p-[15px] bg-neutral-100 border border-[#888f9c] rounded-lg focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 text-base font-normal leading-normal outline-none transition-colors"
                        placeholder="Enter your full name"
                    />
                </label>
                
                {/* Biyo */}
                <label className="flex flex-col">
                    <p className="text-[#111318] text-base font-medium leading-normal pb-2">Your Bio</p>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="form-input flex w-full p-[15px] bg-neutral-100 border border-[#888f9c] rounded-lg focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 text-base font-normal leading-normal outline-none transition-colors min-h-[100px] resize-y"
                        placeholder="Write something about you"
                    />
                    <small className="text-[#444e63] text-sm font-light leading-normal mt-1">This area will be displayed to other users.</small>
                </label>
                
              
                {updateSuccess && (
                    <div className="text-sm text-green-600 bg-green-100 p-3 rounded-lg border border-green-300 mt-4">
                         Profile updated successfully!
                    </div>
                )}

                {/* Buton Stili */}
                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 flex h-14 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-cyan-900 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-sky-800/90 transition-colors duration-200 disabled:bg-sky-800/50 shadow-md hover:shadow-lg"
    
                >
                    
                    <span className="truncate">{loading ? "Saving..." : "Update"}</span>
                </button>
            </form>
        </div>
    );
};

export default UserProfilePage;