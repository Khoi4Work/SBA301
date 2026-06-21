import {Navigate, useLocation} from "react-router-dom";
import React, {useContext} from "react";
import {AuthContext} from "@/contexts/AuthContext.jsx";

const ProtectedRoute = ({ children, requireRole }) => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();

    // Lớp bảo vệ 1: Đợi load dữ liệu xong (tránh việc chớp nhoáng bị văng ra trang login)
    if (loading) {
        return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
    }

    // Lớp bảo vệ 2: Chưa đăng nhập -> Đẩy về trang /login
    if (!user) {
        // state={{ from: location }} giúp sau khi login xong, hệ thống biết đường quay lại trang đang xem dở
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Lớp bảo vệ 3: Có yêu cầu Role cụ thể nhưng User không đáp ứng -> Đẩy về trang chủ (hoặc trang 403)
    if (requireRole && user.role !== requireRole) {
        alert("Bạn không có quyền truy cập trang này!");
        return <Navigate to="/" replace />;
    }

    // Nếu qua hết các ải trên -> Cho phép hiển thị Component con
    return children;
};
export default ProtectedRoute;