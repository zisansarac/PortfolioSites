import React, { useEffect, useState } from "react";              // React ve gerekli hook'lar
import { useLocation, useNavigate, useParams, Link } from "react-router-dom"; 
// useParams → URL'den id/slug gibi parametreleri alır
// useNavigate → sayfa yönlendirmesi yapar
// useLocation → sayfaya geçerken gönderilen state verisini alır
// Link → sayfalar arasında yönlendirme bağlantısı oluşturur

import api from "../lib/api"; // Axios instance (API istekleri)

import type { PostCreateRequest, PostItem, PostUpdateRequest } from "../type/post"; 

// Blog tipleri (oluşturma/güncelleme nesneleri)

type NavState = { post?: PostItem };                             // Liste sayfasından "state" ile gönderilen post tipi

// Ana bileşen: BlogEditPage
const PostEditPage: React.FC = () => {
  const { id } = useParams();               // URL'deki :id parametresini al (örneğin /blog/edit/12)
  const { state } = useLocation() as { state: NavState }; // useLocation ile state üzerinden gelen post'u al
  const navigate = useNavigate();           // navigate → sayfa yönlendirmesi için kullanılır

  const editing = !!id;                     // Eğer id varsa, düzenleme modundayız
  const initial = state?.post;              // Eğer liste sayfasından "Düzenle" ile gelindiyse, post bilgisi state içindedir

  // Form alanlarını ve durum değişkenlerini tanımla
  const [title, setTitle] = useState(initial?.title ?? "");              // Başlık input'u
  const [content, setContent] = useState(initial?.content ?? "");        // İçerik textarea'sı
  const [isPublished, setIsPublished] = useState<boolean>(initial?.isPusblished ?? true); // Yayın durumu
  const [busy, setBusy] = useState(false);                               // API isteği sırasında butonu devre dışı bırakmak için
  const [error, setError] = useState<string | null>(null);               // Hata mesajı

  // Eğer kullanıcı doğrudan /blog/edit/:id adresine giderse (state yoksa), uyarı göster
  useEffect(() => {
    if (editing && !initial) {
      setError("Düzenleme için lütfen liste sayfasından 'Düzenle' ile gelin.");
    }
  }, [editing, initial]); // sadece editing veya initial değişirse çalışır

  // Form gönderildiğinde çalışır (Yeni kayıt veya güncelleme)
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();             // Formun sayfayı yenilemesini engeller
    setBusy(true);                  // Butonu devre dışı yap
    setError(null);                 // Önceki hataları temizle

    try {
      if (editing) {                // ✏️ Düzenleme modu
        const dto: PostUpdateRequest = { title, content, isPublished }; // Gönderilecek DTO
        await api.put(`/api/posts/${id}`, dto); // PUT isteği ile API'ye güncelleme gönder
        // slug değişmiş olabilir; yeni slug bilinmediği için detaya gitmek yerine ana sayfaya dön
        navigate("/");
      } else {                      // 🆕 Yeni yazı oluşturma modu
        const dto: PostCreateRequest = { title, content, isPublished }; // Yeni kayıt DTO'su
        const res = await api.post("/api/posts", dto); // POST isteği gönder
        // Backend CreatedAtAction ile yeni yazının slug’ını döner → detaya yönlendir
        navigate(`/posts/${res.data.slug}`);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {            // ❌ Hata durumunda
      // Backend tarafında message veya errors dizisi olabilir → hangisi varsa göster
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0] ||
          "İşlem başarısız."
      );
    } finally {
      setBusy(false);               // İstek tamamlanınca butonu tekrar aktif et
    }
  };

  // ------------------------------ JSX (UI kısmı) ------------------------------
 return (
        // Dış Konteyner
        <div className="flex items-start justify-center min-h-screen bg-gray-50 p-4 font-sans">
            
            {/* Daha Geniş Kart */}
            <div className="w-full max-w-4xl bg-white p-8 mt-10 mb-10 rounded-2xl shadow-2xl border border-gray-100">
                
                {/* Başlık ve Geri Link */}
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {editing ? "Yazıyı Düzenle" : "Yeni Yazı Yayınla"}
                    </h1>
                    <Link to="/" className="text-primary-600 hover:text-primary-800 transition-colors">
                        ← Tüm Yazılar
                    </Link>
                </div>

                {/* Hata Mesajı */}
                {error && (
                    <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg mb-6">{error}</div>
                )}

                <form onSubmit={onSubmit} className="space-y-6">
                    
                    {/* Başlık Input */}
                    <label className="block text-sm font-medium text-gray-700">Başlık
                        <input
                            type="text"
                            value={title} // 🔥 Eklendi: title state'ini input'a bağla
                            onChange={(e) => setTitle(e.target.value)} // 🔥 Eklendi: title state'ini güncelle
                            required
                            className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                            placeholder="Başlık giriniz"
                        />
                    </label>

                    {/* İçerik Textarea */}
                    <label className="block text-sm font-medium text-gray-700">İçerik
                        <textarea
                            value={content} // 🔥 Eklendi: content state'ini textarea'ya bağla
                            onChange={(e) => setContent(e.target.value)} // 🔥 Eklendi: content state'ini güncelle
                            required
                            rows={10}
                            className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                            placeholder="Yazı içeriğini buraya giriniz"
                        />
                    </label>

                    {/* Yayın Durumu Checkbox */}
                    <label className="flex items-center space-x-2 text-sm text-gray-700 pt-2">
                        <input
                            type="checkbox"
                            checked={isPublished} // 🔥 Eklendi: isPublished state'ini bağla
                            onChange={(e) => setIsPublished(e.target.checked)} // 🔥 Eklendi: state'i güncelle
                            className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span>Yayınla (Taslak için kapat)</span>
                    </label>

                    {/* Kaydet Butonu */}
                    <button
                        type="submit"
                        disabled={busy}
                        className="w-full py-3 mt-6 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition duration-150 disabled:bg-primary-400"
                    >
                        {busy ? "Kaydediliyor…" : editing ? "Güncelle" : "Yayınla"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PostEditPage; // Bileşeni dışa aktar, router'da kullanılacak