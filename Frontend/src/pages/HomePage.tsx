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
        <div style={{ maxWidth: 800, margin: '60px auto', fontFamily: 'system-ui' }}>
            
            {/* --- Auth Menüsü / Profil Özeti --- */}
            <header style={{ marginBottom: 40, borderBottom: '1px solid #ccc', paddingBottom: 15 }}>
                <h1>Portföy Sitesi</h1>
                {isAuthenticated ? (
                    <div>
                        <p>Giriş Yaptın: <strong>{user?.fullName || user?.email}</strong></p>
                        <Link to="/profile" style={{ marginRight: 15 }}>Profilim</Link>
                        <Link to="/posts/new" style={{ marginRight: 15 }}>Yeni Yazı Ekle</Link>
                        <button onClick={logout}>Çıkış Yap</button>
                    </div>
                ) : (
                    <div>
                        <p>Hoş Geldiniz, misafir!</p>
                        <Link to="/login" style={{ marginRight: 15 }}>Giriş Yap</Link>
                        <Link to="/register">Kayıt Ol</Link>
                    </div>
                )}
            </header>

            {/* --- Tanıtım Yazıları Listesi --- */}
            <h2>Tüm Yayınlanmış Yazılar ({posts.length})</h2>
            <div style={{ marginTop: 20 }}>
                {posts.length === 0 ? (
                    <p>Henüz yayınlanmış bir tanıtım yazısı yok.</p>
                ) : (
                    posts.map(post => (
                        <div key={post.id} style={{ border: '1px solid #eee', padding: 15, marginBottom: 15, borderRadius: 5 }}>
                            <Link to={`/posts/${post.slug}`} style={{ textDecoration: 'none', color: '#007bff' }}>
                                <h3>{post.title}</h3>
                            </Link>
                            <p style={{ color: '#666', fontSize: '0.9em' }}>
                                Yayın Tarihi: {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                            {/* Content'in sadece kısa bir özetini gösterir */}
                            <p>{post.content.substring(0, 150)}...</p> 
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HomePage;