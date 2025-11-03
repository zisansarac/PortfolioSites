import { createContext, useContext, useEffect, useMemo, useState } from "react";

type User = {
  email: string; 
  fullName?: string | null; 
  avatarUrl?: string | null; 
  bio?: string | null; 
};


type AuthContextType = {

  user: User | null; 
  token: string | null;
  userId: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);


function decodeJwtSub(token: string | null): string | null {
  try {
    if (!token) return null; 
    const payload = token.split(".")[1]; 
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  
    return typeof json?.sub === "string" ? json.sub : null;
  } catch {
    return null;
  }
}


export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  // State’ler: token ve kullanıcı bilgisi
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

 
  useEffect(() => {
    const t = localStorage.getItem("token"); 
    const u = localStorage.getItem("user");  
    if (t) setToken(t);
    if (u) setUser(JSON.parse(u));
  }, []); 

  
  const userId = useMemo(() => decodeJwtSub(token), [token]);

 
  const login = (t: string, u: User) => {
    console.log("LOGIN FONKSİYONU ÇALIŞTI. Token alınıyor:", t);
    setToken(t);                                  
    setUser(u);   

    localStorage.setItem("token", t);                
    localStorage.setItem("user", JSON.stringify(u)); 
    console.log("LocalStorage Kontrolü: ", localStorage.getItem("token")); 
  };

  
  const logout = () => {
    setToken(null);                  
    setUser(null);                   
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };


  return (
    <AuthContext.Provider
      value={{
        user,          
        token,        
        userId,         
        login,          
        logout,         
        isAuthenticated: !!token,
      }}
    >
      {children}       
    </AuthContext.Provider>
  );
};


// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext); 
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx; 
};