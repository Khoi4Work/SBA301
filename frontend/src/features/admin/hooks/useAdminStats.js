import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext.jsx";
import { userService } from "@/services/userService.js";
import { philosopherService } from "@/services/philosopherService.js";
import { fetchDocuments } from "@/services/documentService.js";
import { extractResponse } from "@/features/admin/utils/extractResponse.js";

/**
 * Hook encapsulating all AdminDashboard state and data fetching.
 */
export function useAdminStats() {
    const { user } = useContext(AuthContext);
    const displayName = user?.fullName || user?.username || "Quản trị viên";

    const [userCount, setUserCount] = useState(0);
    const [philosopherCount, setPhilosopherCount] = useState(0);
    const [chapterCount, setChapterCount] = useState(0);
    const [statsLoading, setStatsLoading] = useState(false);

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                setStatsLoading(true);

                const [usersData, philosophersData, documentsData] = await Promise.all([
                    userService.getAllUsers(),
                    philosopherService.getAll(),
                    fetchDocuments(),
                ]);

                setUserCount(extractResponse(usersData).length);
                setPhilosopherCount(extractResponse(philosophersData).length);

                const docs = extractResponse(documentsData);
                const chaptersSet = new Set();
                docs.forEach((doc) => {
                    const name = doc.fileName || doc.title || '';
                    const chapterMatch = name.match(/Chương\s*(\d+)/i);
                    if (chapterMatch) {
                        chaptersSet.add(parseInt(chapterMatch[1], 10));
                    }
                });
                setChapterCount(chaptersSet.size);
            } catch (err) {
                console.error("Load dashboard stats failed:", err);
            } finally {
                setStatsLoading(false);
            }
        };

        fetchDashboardStats();
    }, []);

    return {
        displayName,
        userCount,
        philosopherCount,
        chapterCount,
        statsLoading,
    };
}
