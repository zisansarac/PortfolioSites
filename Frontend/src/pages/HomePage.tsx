import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import api from '../lib/api';

// Backend'den dönen Post tipi
type Post = {
    id: number;
    title: string;
    slug: string;
    content: string;
    createdAt: string;
    author: string;
    authorFullName: string | null; 
    authorEmail: string | null;  
    authorAvatarUrl: string | null; 
    authorId : string;
};

type UserProfile = {
    fullName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    email: string;
};

const HomePage: React.FC = () => {
    const { isAuthenticated, user, logout, updateUser } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Postları Çekme Fonksiyonu (GET /api/posts)
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

    const fetchUserProfile = async () => {
        // Zaten avatarUrl veya bio varsa, tekrar çekmeye gerek yok (performans için)
        if (user && (user.avatarUrl || user.bio)) {
            return;
        }

        try {
            const res = await api.get<UserProfile>("/api/users/me");
            const updatedUser = res.data;
            
            // AuthContext'i backend'den gelen en güncel verilerle güncelle.
            if (updateUser) {
                updateUser({ 
                    email: updatedUser.email, 
                    fullName: updatedUser.fullName, 
                    avatarUrl: updatedUser.avatarUrl, 
                    bio: updatedUser.bio 
                });
            }
        } catch (err) {
            console.error("Home Page'de profil bilgisi çekilemedi:", err);
            // Hata olsa bile, AuthContext'i bozmayız.
        }
    };

    useEffect(() => {
        // Kullanıcı giriş yaptıysa ve avatar/bio bilgileri eksikse profil bilgilerini çek.
        // Bu, login sonrası veya sayfa yenileme sonrası AuthContext'in tam doldurulmasını sağlar.
        if (isAuthenticated && user && !user.avatarUrl && !user.bio) {
             // Sadece avatar ve bio boşsa çekimi tetikle.
             // Diğer alanlar (email, id, fullName) zaten login sırasında gelmiş olmalı.
            fetchUserProfile();
        }
    }, [isAuthenticated, user]); // user objesi değiştiğinde tetiklenir

    // Yükleme Durumu
    if (loading) {
        return <div style={{ padding: 20 }}>Loading...</div>;
    }

    // Hata Durumu
    if (error) {
        return <div style={{ padding: 20, color: 'crimson' }}>{error}</div>;
    }

    // Hesaplamalar:
    // 1. Profil kartı için dinamik kaydırma stilini hesapla (hizalama için)
    const profileMarginTop = isAuthenticated ? { marginTop: '72px' } : {};

    // 2. Main içeriğinin kaplayacağı sütun sayısını hesapla
    const mainColSpan = isAuthenticated ? '3' : '4';

    // 3. Post listesi için dinamik sütun sayısını hesapla (Alan genişliğine göre 3 veya 4 kart)
    const postGridCols = isAuthenticated ? 'lg:grid-cols-3' : 'lg:grid-cols-4';
    
    // 4. Boş yazı durumu için col-span hesaplama
    const emptyStateColSpan = isAuthenticated ? 'lg:col-span-3' : 'lg:col-span-4';


    return (
        // Sayfanın Ana Konteyneri
        <div className="max-w-6xl mx-auto pt-4 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
            
            {/* --- Header/Navigasyon --- */}
            <header className="flex flex-wrap justify-between items-center py-4 border-b border-gray-200 mb-10">
                <Link to="/" className="text-3xl font-extrabold text-gray-900 hover:text-sky-950 transition-colors">
                    Portfolio Site
                </Link>
                <nav className="flex space-x-4 items-center">
                    {isAuthenticated ? (
                        <>
                            <Link to="/profile" className="text-gray-600 hover:text-sky-950 font-bold transition-colors">My Profile</Link>
                            <Link to="/posts/new" className="px-4 py-2 bg-gray-100 text-gray-900 font-bold rounded-full hover:bg-gray-200 transition-colors">New Portfolio</Link>
                            <button onClick={logout} className="text-red-600 font-bold hover:text-red-800">Log Out</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="font-bold text-lg text-gray-900 hover:text-sky-800 transition-colors mr-10">Login</Link>
                            <Link to="/register" className="text-gray-900 font-bold text-lg transition-colors hover:text-sky-800 mr-10">Register</Link>
                        </>
                    )}
                </nav>
            </header>

            {/* --- ANA İÇERİK: 4 Sütunlu Responsive Grid (Profile + Portfolios) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start"> 

                {/* ⬅️ Sütun 1: Mini Profil Bloğu (lg:col-span-1) */}
                {isAuthenticated && (
                    <aside 
                        className="lg:col-span-1 p-6 bg-white border border-gray-200 rounded-2xl shadow-xl h-fit lg:sticky lg:top-8 transform hover:scale-[1.02] transition-transform duration-300"
                        style={profileMarginTop} 
                    >
                        
                        <h2 className="text-xl font-bold mb-5 text-gray-800 border-b pb-3">My Profile</h2>
                        
                        {/* AVATAR BLOĞU */}
                        <div className="text-center">
                            {user?.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt="Profil Resmi"
                                    // Resim yüklenemezse veya geçersizse baş harflere geri dönülür
                                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                        e.currentTarget.style.display = 'none'; // Resmi gizle
                                        const initialsDiv = e.currentTarget.nextElementSibling; // Baş harf div'ini bul
                                        if (initialsDiv instanceof HTMLElement) {
                                            initialsDiv.style.display = 'flex'; // Baş harf div'ini göster
                                        }
                                    }}
                                    className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border-2 border-sky-800"
                                />
                            ) : null}

                            {/* Baş Harf/Varsayılan İkon (Avatar yoksa veya yüklenemezse gösterilir) */}
                            <div 
                                style={{ display: user?.avatarUrl ? 'none' : 'flex' }} // Avatar varsa başlangıçta gizle
                                className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold mx-auto mb-2 text-gray-600"
                            >
                                {/* Kullanıcının baş harflerini gösterir */}
                                {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                            </div>
                        </div>

                        <p className="text-center text-xl font-bold text-gray-800 mb-1">{user?.fullName}</p>
                        <p className="text-center text-sm text-gray-500 mb-4">{user?.email}</p>
                        
                        {user?.bio && (
                            <p className="text-base text-gray-700 border-t pt-4 mt-4 border-gray-200 italic line-clamp-3">
                                "{user?.bio}"
                            </p>
                        )}
                        <Link to="/profile" className="block mt-4 font-semibold text-sm text-gray-900 hover:text-sky-950 text-center">
                            Update your profile →
                        </Link>
                    </aside>
                )}

                {/* ➡️ Sütun 2/3/4: Başlık ve Yazı Listesi (main) */}
                <main className={`lg:col-span-${mainColSpan} space-y-8`}>
                    
                    {/* Başlık: Responsive ve Taşmayı Engeller */}
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-8 truncate overflow-hidden">
                        All Portfolios
                    </h2>

                    {/* 🔥 YAZI LİSTESİ GRID KONTEYNERİ (Dinamik Sütun Sayısı) 🔥 */}
                    <div className={`grid grid-cols-1 sm:grid-cols-2 ${postGridCols} gap-2`}>
                        
                        {posts.length > 0 ? (
                            posts.map(post => {
                                const initials = post.authorFullName 
                                    ? post.authorFullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
                                    : (post.authorEmail || 'U')[0].toUpperCase();

                                const profileLink = `/users/${post.authorId}`;

                               return(
                                <div 
                                    key={post.id} 
                                    className="p-6 bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-0.5"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                            
                                            <div className="shrink-0 relative">
                                                {/* Avatar Resmi */}
                                                {post.authorAvatarUrl ? (
                                                    <img 
                                                        src={post.authorAvatarUrl}
                                                        alt={post.authorFullName || 'Yazar'} 
                                                        className="w-8 h-8 rounded-full object-cover border border-sky-900"
                                                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                                            e.currentTarget.style.display = 'none'; 
                                                            const initialsDiv = e.currentTarget.nextElementSibling; 
                                                            if (initialsDiv instanceof HTMLElement) { initialsDiv.style.display = 'flex'; }
                                                        }}
                                                    />
                                                ) : null}

                                                {/* Baş Harf/Varsayılan İkon */}
                                                <div 
                                                    style={{ display: post.authorAvatarUrl ? 'none' : 'flex' }}
                                                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600"
                                                >
                                                    {initials}
                                                </div>
                                            </div>
                                            
                                            {/* Yazar Adı */}
                                            {/* Yazar Adı: profileLink kullanıldı */}
                                            {/* Eğer yazar ID'si yoksa Link yerine sadece Span kullanabilirsiniz */}
                                            {post.authorId ? (
                                                <Link to={profileLink} className="text-sm font-semibold text-gray-800 truncate hover:text-cyan-700 transition-colors">
                                                    {post.authorFullName || post.authorEmail}
                                                </Link>
                                            ) : (
                                                <span className="text-sm font-semibold text-gray-800 truncate">
                                                    {post.authorFullName || post.authorEmail}
                                                </span>
                                            )}
                                            
                                        </div>
                                    

                                    <Link to={`/posts/${post.slug}`} className="block">
                                        <h3 className="text-xl font-bold text-gray-900 hover:text-sky-950 mb-3 transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>
                                    </Link>
                                    <p className="text-sm text-gray-500 font-medium mb-4">
                                        {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                                    </p>
                                    
                                    <p className="text-gray-700 line-clamp-4 overflow-hidden break-words text-base">
                                        {post.content}
                                    </p>
                                    
                                    <Link to={`/posts/${post.slug}`} className="mt-4 text-sky-950 hover:text-sky-800 font-medium inline-block">
                                        For more →
                                    </Link>
                                </div>
       
                            ); 
                        })
                        ) : (
                            // Boş yazı durumu için dinamik col-span kullanıldı
                            <div className={`${emptyStateColSpan} text-center py-10 text-gray-600`}>
                                There is no published content.
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default HomePage;