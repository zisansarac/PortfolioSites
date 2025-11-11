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
    const [showPassword, setShowPassword] = useState(false);

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

    const primaryColorClasses = "text-primary hover:underline"; // Örneğin: text-blue-600 hover:underline
    const primaryBgClasses = "bg-primary hover:bg-primary/90 focus:ring-primary"; // Örneğin: bg-blue-600 hover:bg-blue-700 focus:ring-blue-600
    const inputFocusClasses = "focus:border-primary focus:ring-2 focus:ring-primary/20"; // Input odağı
    
    return (
        // Dış Konteyner: Tasarımın ortalanmasını sağlar (bg-gray-50 yerine bg-background-dark/80 vb. renkler kullanılabilir)
        <div className="flex items-center justify-center min-h-screen p-4 sm:p-6">

            {/* Kart (Card) Yapısı: Orijinal tasarımdaki w-full rounded-xl ... shadow-lg yapısı */}
            <main className="w-full max-w-md rounded-xl bg-sky-900 shadow-2xl backdrop-blur-sm p-8 sm:p-10 border border-b-blue-600 dark:border-b-blue-950">
                <div className="flex flex-col">
                    <h1 className="text-gray-900 dark:text-white text-3xl font-bold tracking-tight text-center">
                        Welcome Back
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-center text-base">
                        Enter your credentials to access your account.
                    </p>

                    <form onSubmit={onSubmit} className="flex flex-col gap-6 mt-8">

                        {/* E-posta Alanı */}
                        <div className="flex flex-col">
                            <label className="text-gray-800 dark:text-gray-200 text-base font-medium leading-normal pb-2" htmlFor="email">
                                Email Address
                            </label>
                            <input
                                className={`form-input flex w-full h-14 min-w-0 flex-1 rounded-lg text-gray-800 border border-gray-300 dark:border-gray-700 bg-white placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 py-3 text-base font-normal leading-normal outline-none transition-all duration-200 ${inputFocusClasses}`}
                                id="email"
                                placeholder="Enter your email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {/* Şifre Alanı */}
                        <div className="flex flex-col">
                            <div className="flex items-center justify-between pb-2">
                                <label className="text-gray-800 dark:text-gray-200 text-base font-medium leading-normal" htmlFor="password">
                                    Password
                                </label>
                                {/* Şifremi Unuttum Linki */}
                                <Link className={`text-sm font-medium text-gray-300 leading-normal`} to="#">
                                    Forgot password?
                                </Link>
                            </div>
                            
                            {/* Şifre Inputu ve Göz Simgesi */}
                            <div className="flex w-full flex-1 items-stretch rounded-lg">
                                <input
                                    className={`form-input flex w-full h-14 min-w-0 flex-1 rounded-l-lg text-gray-800 border border-gray-300 dark:border-gray-700 bg-white placeholder:text-gray-500 dark:placeholder:text-gray-400 p-4 rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal outline-none transition-all duration-200 ${inputFocusClasses} focus:z-10`}
                                    id="password"
                                    placeholder="Enter your password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                {/* Göz Simgesi Butonu */}
                                <button
                                    className="text-gray-500 dark:text-gray-400 flex border border-gray-300 dark:border-gray-700 bg-white items-center justify-center px-4 rounded-r-lg border-l-0 hover:bg-sky-200  focus:outline-none focus:ring-2 focus:ring-primary/20 focus:z-10 transition-colors duration-150"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <span className="material-symbols-outlined">
                                        {showPassword ? "visibility_off" : "visibility"}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Hata Mesajı */}
                        {error && <div className="text-sm text-red-600 mt-2">{error}</div>}

                        {/* Log In Butonu */}
                        <button
                            type="submit"
                            disabled={loading}
                            // Orijinal tasarımdaki düğme stili
                            className={`flex items-center justify-center bg-sky-950 whitespace-nowrap rounded-lg text-base font-medium transition-colors duration-150 h-14 px-8 text-white w-full mt-2 ${primaryBgClasses} focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:bg-primary/50 disabled:cursor-not-allowed`}
                        >
                            {loading ? "Logging In..." : "Log In"}
                        </button>
                    </form>

                    {/* Kayıt Ol Linki */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-200">
                            Don't have an account?
                            <Link className={`font-bold ml-1 ${primaryColorClasses}`} to="/register">
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
export default LoginPage;