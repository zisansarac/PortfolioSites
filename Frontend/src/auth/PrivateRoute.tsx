import type React from "react";
import { useAuth } from "./AuthContext"
import { Navigate } from "react-router-dom";


const PrivateRoute: React.FC<React.PropsWithChildren> = ({children}) => {
    const {isAuthenticated, isLoading} = useAuth();
    if(isLoading) {
      // Auth kontrolü bitene kadar null veya basit bir yükleme div'i döndürmek,
      // yönlendirmeyi tetiklemez.
      return <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>Oturum Kontrol Ediliyor...</div>;
    }
    if(!isAuthenticated) {
      return <Navigate to="/login" replace/>
    }
    
    return<>{children}</>
}

export default PrivateRoute;