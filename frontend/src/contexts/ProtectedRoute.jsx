import {Navigate, useLocation} from "react-router-dom";

function ProtectedRoute({ children }) {
    const location = useLocation();
    const token = localStorage.getItem('accessToken');

    if (!token) {
        return <Navigate to="/login" state={{from: location}} replace/>;
    }

    return children;
}

export default ProtectedRoute;