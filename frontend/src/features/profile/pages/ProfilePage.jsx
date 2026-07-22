import ProfileContent from '@/features/profile/components/ProfileContent.jsx';
import { Sidebar } from "@/components/Sidebar.jsx";
import Footer from "@/components/Footer.jsx";
import { TopNav } from "@/components/TopNav.jsx";
import BackgroundTexture from "@/features/profile/components/BackgroundTexture.jsx";
import { useContext, useEffect, useState } from "react";
import apiClient from "@/services/apiClient.js";
import {AuthContext} from "@/contexts/AuthContext.jsx";

export default function ProfilePage() {
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
        <div className="min-h-screen bg-surface-dim text-on-surface font-body-md overflow-x-hidden selection:bg-secondary selection:text-on-secondary">
            <BackgroundTexture />

            <Sidebar />
            <TopNav />

            <main className="ml-64 pt-16 min-h-screen flex flex-col">

                <ProfileContent
                    user={profileUser}
                    setUser={syncUser}
                />

                <Footer />
            </main>
        </div>
    );
}