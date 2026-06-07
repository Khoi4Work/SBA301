import PersonalInfo from '@/components/PersonalInfo';
import { Sidebar } from "@/components/Sidebar.jsx";
import Footer from "@/components/Footer.jsx";
import { TopNav } from "@/components/TopNav.jsx";
import BackgroundTexture from "@/components/BackgroundTexture.jsx";
import ProfileHeader from "@/components/ProfileHeader.jsx";
import { useEffect, useState } from "react";
import apiClient from "@/services/apiClient.js";

export default function Profile() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem("user"));
                const userId = storedUser?.id;

                if (!userId) {
                    console.error("Không tìm thấy userId trong localStorage");
                    return;
                }

                const res = await apiClient.get(`/users/${userId}`);
                setUser(res.data.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchUser();
    }, []);

    return (
        <div className="min-h-screen bg-surface-dim text-on-surface font-body-md overflow-x-hidden selection:bg-secondary selection:text-on-secondary">
            <BackgroundTexture />

            <Sidebar />
            <TopNav />

            <main className="ml-64 pt-16 min-h-screen relative z-10 flex flex-col">
                <div className="max-w-container-max mx-auto px-margin-desktop socratic-void w-full flex-grow">
                    <ProfileHeader user={user} setUser={setUser} />

                    <div className="grid grid-cols-12 gap-gutter">
                        <PersonalInfo user={user} setUser={setUser} />
                    </div>
                </div>

                <Footer />
            </main>
        </div>
    );
}