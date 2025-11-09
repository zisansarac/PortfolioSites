/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/UserProfilePage.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../auth/AuthContext";

// Backend'den dönen tüm User alanlarını içeren tip (AuthContext.tsx'te tanımladığımız User tipiyle uyumlu olmalı)
type UserProfile = {
    fullName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    email: string;
    // ... Diğer alanlar
};

const UserProfilePage: React.FC = () => {
    const { isAuthenticated, user, login } = useAuth();
    const navigate = useNavigate();

    // Form alanları için yerel state'ler
    const [fullName, setFullName] = useState(user?.fullName || "");
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
    const [bio, setBio] = useState(user?.bio || "");
    
    // Yüklenme/Hata state'leri
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [updateSuccess, setUpdateSuccess] = useState(false);

    // Eğer kullanıcı giriş yapmamışsa, yönlendir
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

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
        try {
            // Interceptor sayesinde token otomatik gönderiliyor
            const res = await api.get<UserProfile>("/api/users/me");
            const updatedUser = res.data;
            
            // State'leri ve AuthContext'i güncel verilerle senkronize et
            setFullName(updatedUser.fullName || "");
            setAvatarUrl(updatedUser.avatarUrl || "");
            setBio(updatedUser.bio || "");

            // Not: login fonksiyonu sadece JWT ve temel user'ı kaydeder.
            // Sadece lokal state'i güncelleyelim.
            
        } catch (err: any) {
             setFetchError("Profil bilgileri çekilemedi.");
        }
    };

    // Component yüklendiğinde profili çek
    useEffect(() => {
        if (isAuthenticated) {
            fetchUserProfile();
        }
    }, [isAuthenticated]); 


    // --- Form Gönderme: PUT /api/users/me ---
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setUpdateSuccess(false);
        setFetchError(null);

        // Kullanıcının temizlemek istediği alanlar için boş string ("") konvansiyonunu uygula
        const updateData = {
            fullName: fullName || null,
            avatarUrl: avatarUrl === "" ? "" : avatarUrl || null,
            bio: bio === "" ? "" : bio || null,
        };
        
        // ÖNEMLİ: Eğer alanın içeriği boşsa (kullanıcı temizlemek istiyorsa), backend'e boş string ("") göndermeliyiz.
        // Eğer alan hiç değişmediyse, backend'e null veya undefined göndermeliyiz ki, backend mantığımız atlayabilsin.
        // Ancak bu yapıda, her zaman formdaki mevcut değeri gönderiyoruz.

        try {
            await api.put("/api/users/me", {
                fullName,
                // Backend'in temizleme mantığına uygun olarak boş stringi gönder
                avatarUrl: avatarUrl, 
                bio: bio, 
            });

            // Başarılı güncelleme sonrası AuthContext'teki user objesini manuel olarak güncelle
            // Normalde tam AuthResponse dönmediği için bu gereklidir.
            if (user && login) {
                // Mevcut token'ı ve yeni User objesini kullanarak login'i tekrar çağır
                // Not: user objesi sadece email, fullName, avatarUrl, bio içerir.
                login(sessionStorage.getItem('token')!, {
                    email: user.email,
                    fullName,
                    avatarUrl,
                    bio
                });
            }
            
            setUpdateSuccess(true);
        } catch (err: any) {
            setFetchError(err.response?.data?.message || "Profil güncellenemedi.");
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) return <div>Giriş Yapılmadı.</div>;
    
    return (
        <div style={{ maxWidth: 500, margin: "60px auto", fontFamily: "system-ui" }}>
            <h1>Profil Bilgileri</h1>
            {fetchError && <div style={{ color: "crimson", marginBottom: 20 }}>{fetchError}</div>}
            
            <p><strong>E-posta:</strong> {user?.email}</p>
            
            <form onSubmit={onSubmit}>
                
                {/* Ad Soyad */}
                <label style={{ display: "block", marginTop: 12 }}>Ad Soyad
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        style={{ width: "100%", padding: 10, marginTop: 12 }}
                    />
                </label>
                
                {/* Avatar URL */}
                <label style={{ display: "block", marginTop: 12 }}>Avatar URL (Opsiyonel)
                    <input
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        style={{ width: "100%", padding: 10, marginTop: 12 }}
                    />
                    <small>Temizlemek için alanı boş bırakın.</small>
                </label>

                {/* Biyo (Bio) */}
                <label style={{ display: "block", marginTop: 12 }}>Biyo (Opsiyonel)
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        style={{ width: "100%", padding: 10, marginTop: 12 }}
                    />
                    <small>Temizlemek için alanı boş bırakın.</small>
                </label>
                
                {updateSuccess && <div style={{ color: "green", marginTop: 20 }}>Profil başarıyla güncellendi!</div>}

                <button
                    type="submit"
                    disabled={loading}
                    style={{ width: "100%", padding: 12, marginTop: 20, border: 0, borderRadius: 8, cursor: "pointer" }}
                >
                    {loading ? "Kaydediliyor..." : "Profili Güncelle"}
                </button>
            </form>
        </div>
    );
};

export default UserProfilePage;