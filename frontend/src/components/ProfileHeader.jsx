import { Pen } from 'lucide-react';
import { useRef } from 'react';
import apiClient from "@/services/apiClient.js";

export default function ProfileHeader({ user, setUser }) {
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !user?.id) return;

        const formData = new FormData();
        formData.append("file", file);

        const res = await apiClient.post(`/users/${user.id}/avatar`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        setUser(res.data.data);
    };

    return (
        <section className="flex flex-col md:flex-row items-end gap-8 mb-16">
            <div className="relative group">
                <div className="w-48 h-64 bg-surface-container-high ink-border overflow-hidden relative">
                    <img
                        alt="Avatar"
                        className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 transition-all duration-700"
                        src={user?.avatarUrl || "/default-avatar.png"}
                    />
                    <div className="absolute inset-0 border-[0.5px] border-secondary/20"></div>
                </div>

                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                />

                <button
                    onClick={() => fileInputRef.current.click()}
                    className="absolute -bottom-2 -right-2 bg-secondary p-2 ink-border cursor-pointer hover:bg-secondary/90 transition-colors"
                >
                    <Pen className="text-on-secondary" size={16} />
                </button>
            </div>

            <div className="flex-grow pb-4">
                <h2 className="font-display-lg text-display-lg text-on-surface mb-2">
                    {user?.fullName || "Đang tải..."}
                </h2>
            </div>
        </section>
    );
}