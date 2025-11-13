/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom"
import type { PostItem } from "../type/post";
import { useAuth } from "../auth/AuthContext";
import api from "../lib/api";

const PostDetailPage:React.FC = () => {
    const {slug} = useParams();
    const [post, setPost] = useState<PostItem | null>(null);
    const [loading, setLoading] = useState(true);
    // useAuth hook'unuzun userId döndürdüğünü varsayıyoruz.
    const { userId } = useAuth() as any; 
    const navigate = useNavigate();

    // 🎯 Veri Çekme (fetch)
    useEffect(() => {
        const run = async () => {
            setLoading(true);
            try{
                const res = await api.get<PostItem>(`/api/posts/${slug}`);
                setPost(res.data);
            } catch (error) {
                // Hata oluşursa post'u null olarak bırakabiliriz, NotFound ekranına düşer
                setPost(null); 
            } finally{
                setLoading(false);
            }
        };
        run();
    },[slug]);

    // 🎯 Yetki Kontrolü
    const mine = !!(userId && post && userId === post.authorId);

    // 🎯 Silme İşlemi
    const onDelete = async () => {
        if(!post)return;
        if(!confirm("Bu yazıyı silmek istediğine emin misin?"))return;
        try {
            await api.delete(`/api/posts/${post.id}`);
            navigate("/");
        } catch (error) {
            console.error("Silme işlemi başarısız oldu:", error);
            alert("Silme işlemi sırasında bir hata oluştu.");
        }
    };

    // ------------------------------ RENDER KISMI ------------------------------

    // Yüklenme Durumu
    if(loading)
        return(
            <div className="max-w-4xl mx-auto py-12 text-center text-gray-700">İçerik yükleniyor...</div> 
        );

    // Bulunamadı Durumu
    if(!post)
        return(
            <div className="max-w-4xl mx-auto py-12 text-center text-gray-700">
                <h1 className="text-3xl font-bold text-red-600 mb-4">404 - İçerik Bulunamadı</h1>
                <Link to="/" className="text-lg text-gray-700 hover:underline">← Ana Sayfaya Dön</Link>
            </div>
        );

    // Detay Sayfası
    return(
        // Ana Konteyner: Daha geniş ve ortalanmış
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 font-sans">
            
            {/* Header (Profil Sayfası Stilinde: Fotoğraf, Başlık, Aksiyon Butonları) */}
            <div className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-100">
                <div className="flex justify-between items-start">
                    
                    {/* Yazar Bilgisi ve Başlık */}
                    <div className="flex items-start gap-4">
                        {/* Avatar / Yazarın Fotoğrafı (Postta yoksa varsayılan) */}
                        <img 
                            src={post.avatarUrl || "https://i.pravatar.cc/150?img=1"} // Varsayılan görsel
                            alt={post.authorFullName || 'Yazar'} 
                            className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md"
                        />
                        
                        {/* Başlık ve Yazar Adı */}
                        <div>
                            <h1 className="text-3xl font-extrabold text-[#111318] leading-snug">
                                {post.authorFullName ?? post.authorEmail}
                                
                            </h1>
                            <p className="text-lg text-black font-bold mt-1">
                                {post.title}
                            </p>
                            <span className="inline-block text-sm text-gray-500 mt-2">
                                Yayınlanma: {new Date(post.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            {!post.isPublished && (
                                <span className="ml-3 bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold">
                                    Taslak
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Aksiyon Butonları (Düzenle/Sil veya Listeye Dön) */}
                    <div className="flex gap-3">
                        {mine ? (
                            <>
                                <Link 
                                    to={`/posts/edit/${post.id}`} 
                                    state={{post}}
                                    className="py-2 px-4 bg-sky-900 text-white font-semibold rounded-lg hover:bg-sky-700 transition-colors border border-sky-800"
                                >
                                    Edit
                                </Link>
                                <button 
                                    onClick={onDelete} 
                                    className="py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 transition-colors border border-red-200"
                                >
                                    Delete
                                </button>
                            </>
                        ) : (
                            <Link 
                                to="/" 
                                className="py-2 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                ← Listeye Dön
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* İçerik Bölümü (Hakkında Kartı Stilinde) */}
            <div className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-100">
                
                {/* Bölüm Başlığı */}
                <h2 className="text-2xl font-bold text-[#111318] mb-4">
                    About
                </h2>

                {/* İçerik */}
                <div className="text-base text-gray-700 leading-relaxed mt-4">
    
                    <p style={{ whiteSpace: 'pre-wrap' }}>
                        {post.content}
                    </p>
                </div>
            </div>

            
        </div>
    );
}

export default PostDetailPage;