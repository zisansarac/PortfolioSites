import type React from "react";
import { useAuth } from "../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../lib/api";
import "tailwindcss";


const LoginPage: React.FC = () =>{
    const {login} = useAuth();
    const navigate = useNavigate();

    const[email, setEmail] = useState("");
    const[password, setPassword] = useState("");
    const[loading, setLoading] = useState(false);
    const[error, setError] = useState<string | null>(null);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try{
            const res = await api.post("/api/auth/login", {email,password});

            console.log("API Yanıtı:", res.data);

            const { token, email:outEmail, fullName, avatarUrl, bio } = res.data as {
                token: string; 
                email: string; 
                fullName?: string | null; 
                avatarUrl?: string | null; // <-- YENİ
                bio?: string | null;       // <-- YENİ
            };

            login(token, {email: outEmail, fullName, avatarUrl, bio});

            setTimeout(() => {
        console.log("Yönlendirme Öncesi LocalStorage:", localStorage.getItem("token"));
        navigate("/");
    }, 500);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }catch(err: any){
            setError(err.response?.data?.message || "Giriş başarısız.");
        }finally{
            setLoading(false);
        }
    };

    return (
        // 1. Dış Konteyner: Ekranı ortala
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            
            {/* 2. Kart (Card) Yapısı: Beyaz kutu, gölge, köşeler */}
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
                
                <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Giriş Yap</h1>
                
                <form onSubmit={onSubmit} className="space-y-4">
                    
                    {/* Input Stilleri */}
                    <label className="block text-sm font-medium text-gray-700">E-posta
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            required 
                            // w-full: Tam genişlik, p-3: padding, mt-1: margin-top, 
                            // border border-gray-300: ince gri kenarlık, rounded-lg: yuvarlak köşeler
                            className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none" 
                        />
                    </label>
                    
                    <label className="block text-sm font-medium text-gray-700">Şifre
                        <input 
                            type="password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            required 
                            className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none" 
                        />
                    </label>
                    
                    {error && <div className="text-sm text-red-600 mt-3">{error}</div>}
                    
                    {/* Buton Stili */}
                    <button
                        type="submit"
                        disabled={loading}
                        // bg-blue-600: Mavi arka plan, hover:bg-blue-700: Hover efekti
                        className="w-full py-3 mt-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150 disabled:bg-blue-400"
                    >
                        {loading ? "Gönderiliyor..." : "Giriş Yap"}
                    </button>
                </form>
                
                {/* Alt Link */}
                <p className="mt-6 text-center text-sm text-gray-600">
                    Hesabın Yok mu ? 
                    <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 ml-1">Kayıt Ol</Link>
                </p>
            </div>
        </div>
    );
}
export default LoginPage;