import type React from "react";
import { useAuth } from "../auth/AuthContext";


const HomePage: React.FC = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {user, logout} = useAuth();

    return(
        <div style={{maxWidth: 720, margin:"40px auto"}}>
         <h1>Home</h1>
         <p>Hoş Geldin <b>{user?.fullName ?? user?.email}</b>!</p>
        </div>
    )
}

export default HomePage;