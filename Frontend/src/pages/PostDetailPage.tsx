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
                <Link to="/" className="text-lg text-[#0f172a] hover:underline">← Ana Sayfaya Dön</Link>
            </div>
        );

    // Detay Sayfası
    return(
        // Ana Konteyner: Daha geniş (max-w-4xl) ve ortalanmış
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 font-sans">
            
            {/* Başlık ve Liste Linki */}
            <div className="flex justify-between items-start border-b border-gray-200 pb-4 mb-8">
                <h1 className="text-4xl font-extrabold text-[#111318] leading-tight pr-4">
                    {post.title}
                </h1>
                <Link 
                    to="/" 
                    className="text-lg text-[#444e63] font-medium hover:text-[#0f172a] transition-colors whitespace-nowrap"
                >
                    ← Listeye Dön
                </Link>
            </div>

            {/* Meta Veriler (Tarih, Yazar, Taslak Durumu) */}
            <div className="text-sm text-gray-500 mb-8 flex items-center gap-4">
                
                {/* Tarih */}
                <span className="font-medium text-[#444e63]">
                    Yayınlanma: {new Date(post.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                
                {/* Yazar */}
                <span className="font-medium text-[#444e63]">
                    Yazar: {post.authorFullName ?? post.authorEmail}
                </span>

                {/* Taslak Durumu */}
                {!post.isPusblished && (
                    <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-semibold">
                        Taslak
                    </span>
                )}
            </div>
            
            {/* ✏️ Düzenle/Sil Butonları */}
            {mine && (
                <div className="flex gap-4 mb-8">
                    <Link 
                        to={`/posts/edit/${post.id}`} 
                        state={{post}}
                        className="py-2 px-4 bg-gray-100 text-[#0f172a] font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Düzenle
                    </Link>
                    <button 
                        onClick={onDelete} 
                        className="py-2 px-4 bg-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-200 transition-colors cursor-pointer"
                    >
                        Sil
                    </button>
                </div>
            )}
            
            {/* İçerik */}
            {/* whitespace-pre-wrap: İçeriğin orijinal formatını korur (yeni satırlar, boşluklar) */}
            <div className="text-lg text-gray-700 leading-relaxed pt-6 border-t border-gray-100">
                <p style={{ whiteSpace: 'pre-wrap' }}>
                    {post.content}
                </p>
            </div>
        </div>
    );
}

export default PostDetailPage;