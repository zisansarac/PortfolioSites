// src/pages/HomePage.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import api from '../lib/api';

// Tanım: Backend'den dönen Post tipi
type Post = {
    id: number;
    title: string;
    slug: string;
    content: string;
    createdAt: string;
};

const HomePage: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 🎯 Postları Çekme Fonksiyonu (GET /api/posts)
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // Anonim erişime açık olduğu için token gerekmez
                const res = await api.get<Post[]>('/api/posts'); 
                setPosts(res.data);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
            } catch (err: any) {
                setError('Tanıtım yazıları yüklenirken bir hata oluştu.');
                // Hata 404 olsa bile, misafire göstermeliyiz.
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    // Yükleme Durumu
    if (loading) {
        return <div style={{ padding: 20 }}>Yazılar yükleniyor...</div>;
    }

    // Hata Durumu
    if (error) {
        return <div style={{ padding: 20, color: 'crimson' }}>{error}</div>;
    }

    return (
        // max-w-7xl yerine max-w-6xl (daha büyük) ve font-sans
        <div className="max-w-6xl mx-auto pt-4 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
            
            {/* --- Header/Navigasyon --- */}
            <header className="flex flex-wrap justify-between items-center py-4 border-b border-gray-200 mb-10">
                {/* primary-500 yeni özgün rengimiz */}
                <Link to="/" className="text-3xl font-extrabold text-primary-700 hover:text-primary-900 transition-colors">
                    Sara Portföy
                </Link>
                <nav className="flex space-x-4 items-center">
                    {/* ... (Auth linkleri, renkler primary-600 olarak güncellenmeli) ... */}
                    {isAuthenticated ? (
                        <>
                            <Link to="/profile" className="text-gray-600 hover:text-primary-600 transition-colors">Profilim</Link>
                            <Link to="/posts/new" className="px-4 py-2 bg-primary-600 text-white rounded-full text-sm hover:bg-primary-700 transition-colors">Yeni Yazı</Link>
                            <button onClick={logout} className="text-red-500 hover:text-red-700">Çıkış Yap</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700 transition-colors">Giriş Yap</Link>
                            <Link to="/register" className="text-gray-600 hover:text-primary-600">Kayıt Ol</Link>
                        </>
                    )}
                </nav>
            </header>

            {/* --- Ana İçerik Alanı: Responsive Grid --- */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12"> {/* 4 Sütunlu yapı */}

                {/* ⬅️ Sütun 1: Mini Profil Bloğu (lg:col-span-1) */}
                {isAuthenticated && (
                    <aside className="lg:col-span-1 p-6 bg-white border border-gray-200 rounded-2xl shadow-xl h-fit lg:sticky lg:top-8 transform hover:scale-[1.02] transition-transform duration-300">
                        {/* Başlıklar, ikonlar, boşluklar iyileştirildi */}
                        <h2 className="text-xl font-bold mb-5 text-gray-800 border-b pb-3">Profil</h2>
                        
                        {/* Avatar / Baş Harf */}
                        {/* ... (Avatar kısmı aynı kalır, bg-blue-100 yerine bg-primary-100 kullanın) */}
                        <p className="text-center text-xl font-bold text-primary-800 mb-1">{user?.fullName}</p>
                        <p className="text-center text-sm text-gray-500 mb-4">{user?.email}</p>
                        
                        {/* Biyo alanı daha stil sahibi */}
                        {user?.bio && (
                            <p className="text-base text-gray-700 border-t pt-4 mt-4 border-gray-200 italic">
                                "{user?.bio}"
                            </p>
                        )}
                        <Link to="/profile" className="block mt-4 text-sm text-primary-600 hover:underline text-center">
                            Profili Güncelle →
                        </Link>
                    </aside>
                )}

                {/* ➡️ Sütun 2: Yazı Listesi (lg:col-span-3) */}
                <main className={`lg:col-span-${isAuthenticated ? '3' : '4'} space-y-8`}>
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-8">Yayınlanmış Tüm Yazılar</h2>
                    
                    {posts.map(post => (
                        <div 
                            key={post.id} 
                            // Kart Büyüklüğü: p-8 (daha fazla boşluk), rounded-2xl, shadow-xl (daha belirgin gölge)
                            className="p-8 bg-white border border-gray-100 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1"
                        >
                            <Link to={`/posts/${post.slug}`} className="block">
                                <h3 className="text-2xl font-bold text-gray-900 hover:text-primary-600 mb-3 transition-colors">
                                    {post.title}
                                </h3>
                            </Link>
                            <p className="text-sm text-primary-500 font-medium mb-4">
                                {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                            </p>
                            {/* Yazı içeriği daha uzun gösterilebilir */}
                            <p className="text-lg text-gray-700 line-clamp-3">{post.content}</p> 
                            <Link to={`/posts/${post.slug}`} className="mt-4 text-primary-600 hover:text-primary-700 font-medium inline-block">
                                Devamını Oku →
                            </Link>
                        </div>
                    ))}
                    {/* ... (Eksik yazı durumu) ... */}
                </main>
            </div>
        </div>
    );
};

export default HomePage;