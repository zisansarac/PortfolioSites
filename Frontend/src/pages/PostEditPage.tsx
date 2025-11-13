/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom"; 
import api from "../lib/api"; 
import type { PostCreateRequest, PostItem, PostUpdateRequest } from "../type/post"; 

type NavState = { post?: PostItem }; 

const PostEditPage: React.FC = () => {
  const { id } = useParams(); 
  const { state } = useLocation() as { state: NavState }; 
  const navigate = useNavigate();

  const editing = !!id; 
  const initial = state?.post;
  const [title, setTitle] = useState(initial?.title ?? ""); 
  const [content, setContent] = useState(initial?.content ?? "");  
  const [isPublished, setIsPublished] = useState<boolean>(initial?.isPublished ?? true);
  const [busy, setBusy] = useState(false);  
  const [error, setError] = useState<string | null>(null); 

 
  useEffect(() => {
    if (editing && !initial) {
      setError("Düzenleme için lütfen liste sayfasından 'Düzenle' ile gelin.");
    }
  }, [editing, initial]);

  
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setBusy(true); 
    setError(null); 
    
    try {
      if (editing) { 
     
        const dto: PostUpdateRequest = { title, content, isPublished}; 
        await api.put(`/api/posts/${id}`, dto); 
        navigate("/");
      } else {                      
      
        const dto: PostCreateRequest = { title, content, isPublished};
        const res = await api.post("/api/posts", dto); 
        navigate(`/posts/${res.data.slug}`);
      }
    } catch (err: any) { 
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0] ||
          "İşlem başarısız."
      );
    } finally {
      setBusy(false);
    }
  };

 
 return (
        <div className="flex items-start justify-center min-h-screen bg-background p-4 font-sans">
            
            <div className="w-full max-w-4xl bg-white p-8 mt-10 mb-10 rounded-2xl shadow-2xl border border-gray-100">
                
                {/* Başlık ve Geri Link */}
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {editing ? "Update the current portfolio" : "Publish a new portfolio"}
                    </h1>
                    <Link to="/" className="text-primary-600 hover:text-primary-800 transition-colors">
                        ← All Portfolios
                    </Link>
                </div>

                {/* Hata Mesajı */}
                {error && (
                    <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg mb-6">{error}</div>
                )}

                <form onSubmit={onSubmit} className="space-y-6">
                    
                    {/* Başlık Input */}
                    <label className="block text-sm font-medium text-gray-700">Title
                        <input
                            type="text"
                            value={title} // 
                            onChange={(e) => setTitle(e.target.value)} 
                            required
                            className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                            placeholder="Enter the title"
                        />
                    </label>

                    {/* İçerik Textarea */}
                    <label className="block text-sm font-medium text-gray-700">Content
                        <textarea
                            value={content} // 
                            onChange={(e) => setContent(e.target.value)} 
                            required
                            rows={10}
                            className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                            placeholder="Enter the portfolio content"
                        />
                    </label>

                    {/* Yayın Durumu Checkbox */}
                    <label className="flex items-center space-x-2 text-sm text-gray-700 pt-2">
                    <input
                       type="checkbox"
                       checked={isPublished}
                       onChange={(e) => setIsPublished(e.target.checked)} 
                       className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                      <span>Uncheck to saving as draft</span>
                    </label>

                    {/* Kaydet Butonu */}
                    <button
                        type="submit"
                        disabled={busy}
                        className="w-full py-3 mt-6 bg-cyan-950 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-800 transition duration-150 disabled:bg-primary-400"
                    >
                        {busy ? "Saving…" : editing ? "Update" : "Publish"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PostEditPage; 