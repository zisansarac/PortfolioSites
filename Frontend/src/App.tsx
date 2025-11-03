import type React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";



const App: React.FC = () => {
  return(
    <Routes>
      {/* <Route path="/" element={<PrivateRoute><BlogListPage/></PrivateRoute>}></Route> */}
      {/* <Route path="/posts/:slug" element={<PrivateRoute><BlogDetailPage/></PrivateRoute>}></Route> */}
      {/* <Route path="/posts/new" element={<PrivateRoute><BlogEditPage/></PrivateRoute>}></Route>
      <Route path="/posts/edit/:id" element={<PrivateRoute><BlogEditPage/></PrivateRoute>}></Route> */}
      <Route path="/login" element={<LoginPage/>}></Route>
      <Route path="/register" element={<RegisterPage/>}></Route>
      <Route path="*" element={<Navigate to="/" replace></Navigate>}></Route>
    </Routes>
  );
};
export default App;