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
    const { userId, user } = useAuth() as any; 
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

    //  Yetki Kontrolü
    const mine = !!(userId && post && userId === post.authorId);

    //  Silme İşlemi
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

    // ------------------ RENDER KISMI ------------------------------

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

        let currentAvatarUrl: string | null = null;

        if (mine) {
        // Eğer post bize aitse: AuthContext'ten gelen en güncel veriyi kullan.
        // Bu, profil sayfasında kaydeder kaydetmez güncel avatarı gösterir.
        currentAvatarUrl = user?.avatarUrl || null; 
    } else {
        // Eğer post başkasına aitse: Backend'den post verisiyle birlikte gelen avatarı kullan.
        // (Backend'in bu alanı döndürdüğünü varsayıyoruz)
        // Eğer PostItem tipinizde 'avatarUrl' değil 'authorAvatarUrl' varsa onu kullanın:
        currentAvatarUrl = (post as any)?.authorAvatarUrl || null; 
    }

       

    const initials = post.authorFullName 
        ? post.authorFullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
        : (post.authorEmail || 'U')[0].toUpperCase();

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
                        <div className="relative flex-shrink-0">
                            
                            {/* Avatar Resmi */}
                            {currentAvatarUrl ? (
                                <img 
                                    // post.avatarUrl'ı kullanıyoruz
                                    src={currentAvatarUrl} 
                                    alt={post.authorFullName || 'Yazar'} 
                                    className="w-20 h-20 rounded-full object-cover border-3 border-cyan-900 shadow-md"
                                    // Resim yüklenemezse veya geçersizse:
                                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                        e.currentTarget.style.display = 'none'; // Resmi gizle
                                        const initialsDiv = e.currentTarget.nextElementSibling; // Baş harf div'ini bul
                                        if (initialsDiv instanceof HTMLElement) {
                                            initialsDiv.style.display = 'flex'; // Baş harf div'ini göster
                                        }
                                    }}
                                />
                            ) : null}

                            {/* Baş Harf/Varsayılan İkon */}
                            <div 
                                // Avatar URL'si yoksa veya yüklenemezse gösterilir (onError ile değiştirilebilir)
                                style={{ display: currentAvatarUrl ? 'none' : 'flex' }}
                                className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600 shadow-md"
                            >
                                {initials}
                            </div>
                        </div>

                        {/* Başlık ve Yazar Adı */}
                        <div>
                            <Link to={`/users/${post.authorId}`}>

                            <h1 className="text-3xl font-bold text-[#111318] leading-snug hover:text-sky-800">
                                {post.authorFullName ?? post.authorEmail}
                                
                            </h1>
                            
                            </Link>
                            
                            <p className="text-lg text-black font-bold mt-1">
                                {post.title}
                            </p>
                            <span className="inline-block text-sm text-gray-500 mt-2">
                                Published At: {new Date(post.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'numeric', year: 'numeric' })}
                            </span>
                            {!post.isPublished && (
                                <span className="ml-3 bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold">
                                    Draft
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
                                    className="py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 transition-colors border border-red-600"
                                >
                                    Delete
                                </button>
                            </>
                        ) : (
                            <Link 
                                to="/" 
                                className="py-2 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                ← Back to home
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