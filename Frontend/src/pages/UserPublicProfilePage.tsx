/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';

// Yazarın sadece genel profil bilgilerini çekeceğimiz tip
type PublicProfile = {
    fullName: string;
    avatarUrl: string | null;
    bio: string | null;
    email: string; // Göstermek isterseniz
    // Diğer herkese açık alanlar...
};

const UserPublicProfilePage: React.FC = () => {
    // URL'den dinamik ID'yi alıyoruz (Örn: /users/123 -> authorId = "123")
    const { authorId } = useParams<{ authorId: string }>(); 
    
    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authorId) return;

        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                // GET /api/users/:id
                const res = await api.get<PublicProfile>(`/api/users/${authorId}`);
                setProfile(res.data);
            } catch (err) {
                setError("Kullanıcı profili yüklenirken bir hata oluştu veya kullanıcı bulunamadı.");
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [authorId]); // authorId değiştiğinde tekrar çalışır

    if (loading) {
        return <div className="text-center py-12">Profil yükleniyor...</div>;
    }

    if (error || !profile) {
        return <div className="text-center py-12 text-red-600 font-semibold">{error || "Profil bulunamadı."}</div>;
    }

    // Avatar için baş harf hesaplama
    const initials = profile.fullName 
        ? profile.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
        : (profile.email || 'U')[0].toUpperCase();

    // ------------------ RENDER KISMI ------------------
    return (
        <div className="max-w-3xl mx-auto my-20 p-8 sm:p-12 bg-white rounded-xl shadow-2xl border border-gray-100">
            <div className="flex flex-col items-center mb-6">
                
                {/* Avatar */}
                <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border-4 border-sky-950 shadow-md">
                    {profile.avatarUrl ? (
                        <img 
                            src={profile.avatarUrl} 
                            alt={profile.fullName} 
                            className="w-full h-full object-cover" 
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-600">
                            {initials}
                        </div>
                    )}
                </div>

                <h1 className="text-3xl font-extrabold text-gray-900">{profile.fullName}</h1>
                <p className="text-gray-500 text-md">{profile.email}</p>
            </div>
            
            {/* Bio Kartı */}
            <div className="p-4 bg-gray-50 rounded-lg mt-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Biography</h2>
                <p className="text-gray-900 leading-relaxed italic">
                    {profile.bio || "Bu kullanıcı henüz kendisi hakkında bir açıklama eklemedi."}
                </p>
            </div>
            
            <div className="mt-8 text-center">
                <Link to="/" className="text-cyan-900  hover:text-sky-600 font-semibold">
                    ← All Portfolios
                </Link>
            </div>
        </div>
    );
};

export default UserPublicProfilePage;