import { useContext } from 'react';
import { AuthContext} from "@/contexts/AuthContext.jsx";

export const useAuth = () => {
    // Sử dụng hook useContext của React để "hứng" sóng từ AuthContext
    const context = useContext(AuthContext);


    if (!context) {
        throw new Error("useAuth phải được sử dụng bên trong AuthProvider");
    }

    return context;
};