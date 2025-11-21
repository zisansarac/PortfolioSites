import type React from "react";
import { useAuth } from "../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../lib/api";
import "tailwindcss";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'



const LoginPage: React.FC = () =>{
    const {login} = useAuth();
    const navigate = useNavigate();

    const[email, setEmail] = useState("");
    const[password, setPassword] = useState("");
    const[loading, setLoading] = useState(false);
    const[error, setError] = useState<string | null>(null);
    const[showPassword, setShowPassword] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try{
            const res = await api.post("/api/auth/login", {email,password});

            const { token, email:outEmail, fullName, avatarUrl, bio } = res.data as {
                token: string; 
                email: string; 
                fullName?: string | null; 
                avatarUrl?: string | null; 
                bio?: string | null;      
            };

            login(token, {email: outEmail, fullName, avatarUrl, bio});

            setTimeout(() => {
    
        navigate("/");
    }, 500);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }catch(err: any){
            setError(err.response?.data?.message || "Log in unsuccessful.");
        }finally{
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
                                    Welcome Back!
                                </h1>
                                <p className="text-[#444e63] text-base font-light leading-normal">
                                    It's nice to see you again.
                                </p>
                            </div>
                            <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
                                <label className="flex flex-col">
                                    <p className="text-[#111318] text-base font-medium leading-normal pb-2">Email Address</p>
                                    <input 
                                        type="email" 
                                        value={email} 
                                        onChange={e => setEmail(e.target.value)} 
                                        required 
                                        placeholder="Enter your email address"
                                        className="form-input flex w-full h-14 p-[15px]
                                        bg-neutral-100 border border-[#888f9c] rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/50 text-base font-normal leading-normal outline-none transition-colors"
                                    />
                                </label>

                               
                                <label className="flex flex-col">
                                    <p className="text-[#111318] text-base font-custom font-medium leading-normal pb-2">Password</p>
                                    <div className="relative flex w-full flex-1 items-stretch">
                                        <input 
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={password} 
                                            onChange={e => setPassword(e.target.value)} 
                                            required 
                                            placeholder="Enter your password"
                                            className="form-input flex w-full h-14 p-[15px] bg-neutral-100 border border-[#888f9c] rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/50 text-base font-normal leading-normal outline-none transition-colors"
                                        />
                                        
                                        <button aria-label="Şifre Görünürlüğünü Aç/Kapa" className="text-[#4869a5] absolute inset-y-0 right-0 flex items-center justify-center pr-4" 
                                        onClick={() => setShowPassword(!showPassword)}

                                        type="button">
                                            <span 
                                            className="material-symbols-outlined">
                                                
                                        {showPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
                                    </span>
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
                                    className="mt-2 flex h-14 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-cyan-950 text-blue-50 text-base font-bold leading-normal tracking-[0.015em] hover:bg-cyan-700/90 transition-colors duration-200 disabled:bg-primary/50"
                                >
                                    <span className="truncate">{loading ? "Logging In..." : "Log In"}</span>
                                </button>
                            </form>
                            <p className="text-[#444e63] text-sm font-normal">
                            Do not have one?
                                <Link to="/register" className="font-semibold text-cyan-950 hover:underline hover:text-cyan-700 ml-1">Register</Link>
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
export default LoginPage;