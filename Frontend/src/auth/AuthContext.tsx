import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

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
  updateUser: (updatedUser: User) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Helpers ---
function base64UrlDecode(input: string): string {
  const base = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base.length % 4 === 0 ? "" : "=".repeat(4 - (base.length % 4));
  // atob yalnızca browser'da vardır; SSR guard'ı:
  if (typeof atob === "undefined") throw new Error("atob unavailable (SSR)");
  return atob(base + pad);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function decodeJwtPayload<T = any>(token: string | null): T | null {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const json = base64UrlDecode(parts[1]);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

function getJwtSub(token: string | null): string | null {
  const payload = decodeJwtPayload<{ sub?: string }>(token);
  return typeof payload?.sub === "string" ? payload.sub : null;
}

function isJwtExpired(token: string | null): boolean {
  const payload = decodeJwtPayload<{ exp?: number }>(token);
  if (!payload?.exp) return false; // exp yoksa "bilmiyoruz" kabulü
  return payload.exp * 1000 <= Date.now();
}


// function decodeJwtSub(token: string | null): string | null {
//   try {
//     if (!token) return null; 
//     const payload = token.split(".")[1]; 
//     const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  
//     return typeof json?.sub === "string" ? json.sub : null;
//   } catch {
//     return null;
//   }
// }


export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // İlk yüklemede localStorage'dan oku (SSR guard)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (t) {
      // Süresi geçmişse temizle
      if (isJwtExpired(t)) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } else {
        setToken(t);
        if (u) setUser(JSON.parse(u));
      }
    }
    setIsLoading(false);
  }, []);

  // Sekmeler arası senkronizasyon
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === "token") {
        const t = localStorage.getItem("token");
        if (!t || isJwtExpired(t)) {
          setToken(null);
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        } else {
          setToken(t);
          const u = localStorage.getItem("user");
          setUser(u ? JSON.parse(u) : null);
        }
      }
      if (e.key === "user") {
        const u = localStorage.getItem("user");
        setUser(u ? JSON.parse(u) : null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Token değişince süresi dolmuşsa otomatik çıkış
  useEffect(() => {
    if (!token) return;
    if (isJwtExpired(token)) {
      setToken(null);
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, [token]);

  
  const userId = useMemo(() => getJwtSub(token), [token]);

  const updateUser = (updatedUser: User) => {
     setUser(updatedUser);
   if (typeof window !== "undefined") {
     localStorage.setItem("user", JSON.stringify(updatedUser));
    }
 };

 
  const login = (t: string, u: User) => {
    setToken(t);
    setUser(u);
    if (typeof window !== "undefined") {
      localStorage.setItem("token", t);
      localStorage.setItem("user", JSON.stringify(u));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  const isAuthenticated = !!token && !isJwtExpired(token);


 return (
    <AuthContext.Provider value={{ user, token, userId, login, logout, isAuthenticated, isLoading, updateUser}}>
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