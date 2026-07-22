import { useState, useEffect } from "react";
import { userService } from "@/services/userService.js";

/**
 * Hook fetching Learner Growth Statistics from /api/users/growth-stats
 */
export function useLearnerGrowth() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const result = await userService.getGrowthStats();
                setData(result);
            } catch (err) {
                console.error("Failed to load growth stats:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    return { data, loading, error };
}
