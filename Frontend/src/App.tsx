import type React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import PrivateRoute from "./auth/PrivateRoute";
import UserProfilePage from "./pages/UserProfilePage";
import PostEditPage from "./pages/PostEditPage";
import PostDetailPage from "./pages/PostDetailPage";



const App: React.FC = () => {
  return(
    <Routes>
      <Route path="/" element={<HomePage/>}></Route> 
      <Route path="/posts/:slug" element={<PostDetailPage/>}></Route>
      <Route path="/posts/new" element={<PrivateRoute><PostEditPage/></PrivateRoute>}></Route>
      <Route path="/posts/edit/:id" element={<PrivateRoute><PostEditPage/></PrivateRoute>}></Route>
      <Route path="/profile" element={<PrivateRoute> <UserProfilePage /></PrivateRoute>}></Route>
      <Route path="/login" element={<LoginPage/>}></Route>
      <Route path="/register" element={<RegisterPage/>}></Route>
      <Route path="*" element={<Navigate to="/" replace></Navigate>}></Route>
    </Routes>
  );
};
export default App;