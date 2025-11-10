import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";


const RegisterPage: React.FC = () =>{
    const {login} = useAuth();
    const navigate = useNavigate();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const[fullName, setFullName]= useState("");
    const[email, setEmail]= useState("");
    const[password, setPassword]= useState("");
    const[loading,setLoading] = useState(false);
    const[error, setError] = useState<string | null>(null);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); 
        setError(null); 
        setLoading(true);
        
        try {
            
            const res = await api.post("/api/auth/register", {fullName,email,password});

            
            const {token, email: outEmail, fullName: outName,  avatarUrl, bio } = res.data;
            
            
            login(token, {email: outEmail, fullName:outName, avatarUrl, bio });

           
            navigate("/");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            
            setError(err.response?.data?.message || "Kayıt başarısız.");
        } finally {
            
            setLoading(false);
        }
    };

    return (
     <div className="relative flex min-h-screen w-full flex-col bg-background-light font-display">
        <main className="flex min-h-screen w-full items-center">
           <div className="grid w-full grid-cols-1 md:grid-cols-2">
             <div className="flex items-center justify-center p-8 sm:p-12">
                <div className="flex w-full max-w-md flex-col items-center justify-center gap-6" >
                    <div className="flex w-full flex-col gap-3 text-center">
                                <h1 className="text-[#111318] text-4xl font-black leading-tight tracking-[-0.033em]">
                                    Yaratıcı Topluluğumuza Katılın
                                </h1>
                                <p className="text-[#444e63] text-base font-light leading-normal">
                                    Portföyünüzü oluşturun ve çalışmalarınızı sergilemeye hemen başlayın.
                                </p>
                            </div>
                            <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
                                <label className="flex flex-col">
                                    <p className="text-[#111318] text-base font-medium leading-normal pb-2">Tam Adınız</p>
                                    <input 
                                        type="text" 
                                        value={fullName} 
                                        onChange={e => setFullName(e.target.value)} 
                                        required 
                                        placeholder="Örn: Sara Demir"
                                        // Input stili referans ile uyumlu
                                        className="form-input flex w-full h-14 p-[15px]
                                        bg-neutral-100 border border-[#888f9c] rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/50 text-base font-normal leading-normal outline-none transition-colors"
                                    />
                                </label>

                                <label className="flex flex-col">
                                    <p className="text-[#111318] text-base font-medium leading-normal pb-2">E-posta</p>
                                    <input 
                                        type="email" 
                                        value={email} 
                                        onChange={e => setEmail(e.target.value)} 
                                        required 
                                        placeholder="Örn: sara.demir@example.com"
                                        className="form-input flex w-full h-14 p-[15px] bg-neutral-100 border border-[#888f9c]  rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/50 text-base font-normal leading-normal outline-none transition-colors"
                                    />
                                </label>
                                <label className="flex flex-col">
                                    <p className="text-[#111318] text-base font-medium leading-normal pb-2">Şifre</p>
                                    <div className="relative flex w-full flex-1 items-stretch">
                                        <input 
                                            type="password" 
                                            value={password} 
                                            onChange={e => setPassword(e.target.value)} 
                                            required 
                                            placeholder="Şifrenizi Girin"
                                            className="form-input flex w-full h-14 p-[15px] bg-neutral-100 border border-[#888f9c] rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/50 text-base font-normal leading-normal outline-none transition-colors"
                                        />
                                        {/* Göz İkonu (Opsiyonel: Şifre Görünürlüğünü Değiştirme) */}
                                        <button aria-label="Şifre Görünürlüğünü Aç/Kapa" className="text-[#4869a5] absolute inset-y-0 right-0 flex items-center justify-center pr-4" type="button">
                                            <span className="material-symbols-outlined">visibility</span>
                                        </button>
                                    </div>
                                </label>
                                {error && (
                                    <div className="text-sm text-red-600 bg-red-100 p-3 rounded-lg border border-red-300">
                                        {error}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="mt-2 flex h-14 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-cyan-950 text-blue-50 text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors duration-200 disabled:bg-primary/50"
                                >
                                    <span className="truncate">{loading ? "Oluşturuluyor..." : "Hesap Oluştur"}</span>
                                </button>
                            </form>
                            <p className="text-[#444e63] text-sm font-normal">
                                Zaten bir hesabınız var mı?
                                <Link to="/login" className="font-semibold text-primary hover:underline ml-1">Giriş Yap</Link>
                            </p>
                </div>
             </div>
             <div className="relative hidden h-screen items-center justify-center md:flex">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent">
                        <img className="h-full w-full object-cover" src="./src/assets/register.jpg" alt="Yaratıcılığı ve tasarımı temsil eden mimari iç mekan görseli." />
                        </div>
                        
                    </div>
           </div>
        </main>

     </div>
    );
}


export default RegisterPage;