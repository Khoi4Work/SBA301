import { Pen } from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import apiClient from "@/services/apiClient.js";

export default function ProfileHeader({ user, setUser }) {
    const fileInputRef = useRef(null);
    const fallbackAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuAPr_HnWKcvijj_O608atbbSwJ3WOe9UJG0OkAbvJhu31B0ugnn1U-cWrVH_-DP120u6Cl_abBaazaG9S8JMa0rqpRsHLnPd6omXNoQ4QNu6SDVe8x5_q7FuAR8eoqn2JjY_wEgKn9e4eX4lalHYp9S6t7F2DxJrWk_nErx26Iz5BuWzQ0JZQV1j629aW99M__r-UDZ07gI-ZrLHQ7dssSng1RaKBAGBZoec6G_S5_3tsVloFtCW44qLmYvL-zgzO3aa1USAY0ARmA";

    const handleFileChange = async (e) => {
        let localPreviewUrl = null;

        try {
            const file = e.target.files[0];
            const userId = user?.userId || user?.id;

            if (!file || !userId) return;

            localPreviewUrl = URL.createObjectURL(file);

            // Đổi ngay Profile + Sidebar bằng ảnh tạm
            setUser({
                ...user,
                avatarUrl: localPreviewUrl,
                avatarVersion: Date.now(),
                isAvatarPreview: true
            });

            const formData = new FormData();
            formData.append("file", file);

            const res = await apiClient.post(`/users/${userId}/avatar`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const updatedUser = res.data?.result || res.data?.data || res.data;

            // Đổi lại thành URL thật từ Cloudinary
            setUser({
                ...updatedUser,
                avatarVersion: Date.now(),
                isAvatarPreview: false
            });

            e.target.value = "";
        } catch (error) {
            console.error("Upload avatar failed:", error);
        } finally {
            if (localPreviewUrl) {
                setTimeout(() => URL.revokeObjectURL(localPreviewUrl), 1000);
            }
        }
    };

    return (
        <section className="flex flex-col md:flex-row items-end gap-8 mb-16">
            <div className="relative group">
                <div className="w-48 h-64 bg-surface-container-high ink-border overflow-hidden relative">
                    <img
                        key={`${user?.avatarUrl || "default"}-${user?.avatarVersion || ""}`}
                        alt="Avatar"
                        className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 transition-all duration-700"
                        src={user?.avatarUrl || fallbackAvatar}
                        onError={(e) => {
                            e.currentTarget.src = fallbackAvatar;
                        }}
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
                    {user?.fullName || user?.username || "Triết gia vô danh"}
                </h2>
            </div>
        </section>
    );
}