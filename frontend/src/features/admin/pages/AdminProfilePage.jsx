import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/contexts/AuthContext.jsx";
import apiClient from "@/services/apiClient.js";

import Footer from "@/components/Footer.jsx";
import ProfileContent from "@/features/profile/components/ProfileContent.jsx";

export default function AdminProfilePage() {

    const { user: authUser, updateUser } = useContext(AuthContext);
    const [profileUser, setProfileUser] = useState(authUser);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem("user"));

                const userId =
                    authUser?.userId ||
                    authUser?.id ||
                    storedUser?.userId ||
                    storedUser?.id;

                if (!userId) {
                    console.error("Không tìm thấy userId");
                    return;
                }

                const res = await apiClient.get(`/users/${userId}`);

                console.log("GET USER RESPONSE:", res.data);

                const userData = res.data?.result || res.data?.data || res.data;

                console.log("USER DATA:", userData);

                const normalizedUser = {
                    ...authUser,
                    ...userData,
                    id: userData?.id || userData?.userId || authUser?.id,
                    userId: userData?.userId || userData?.id || authUser?.userId
                };

                setProfileUser(normalizedUser);
                updateUser(normalizedUser);
            } catch (error) {
                console.error(error);
            }
        };

        fetchUser();
    }, []);

    const syncUser = (updatedUser) => {
        setProfileUser(prev => {
            const mergedUser = {
                ...prev,
                ...updatedUser,
                id: updatedUser?.id || updatedUser?.userId || prev?.id,
                userId: updatedUser?.userId || updatedUser?.id || prev?.userId
            };

            updateUser(mergedUser);
            return mergedUser;
        });
    };

    return (
        <div className="flex-1 flex flex-col">

            <ProfileContent
                user={profileUser}
                setUser={syncUser}
            />
        </div>
    );
}