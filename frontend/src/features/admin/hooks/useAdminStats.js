import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext.jsx";
import { userService } from "@/services/userService.js";
import { philosopherService } from "@/services/philosopherService.js";
import { extractResponse } from "@/features/admin/utils/extractResponse.js";

/**
 * Hook encapsulating all AdminDashboard state and data fetching.
 */
export function useAdminStats() {
    const { user } = useContext(AuthContext);
    const displayName = user?.fullName || user?.username || "Quản trị viên";

    const [userCount, setUserCount] = useState(0);
    const [philosopherCount, setPhilosopherCount] = useState(0);
    const [statsLoading, setStatsLoading] = useState(false);

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                setStatsLoading(true);

                const [usersData, philosophersData] = await Promise.all([
                    userService.getAllUsers(),
                    philosopherService.getAll(),
                ]);

                setUserCount(extractResponse(usersData).length);
                setPhilosopherCount(extractResponse(philosophersData).length);
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
        statsLoading,
    };
}
