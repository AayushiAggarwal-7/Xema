import { useEffect, useState, useCallback } from "react";
import { computeDistrictScores } from "../lib/scoring.js";

export function usePriorityAlerts() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generatedAt, setGeneratedAt] = useState(null);
    const [error, setError] = useState(null);

    const compute = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const all = await computeDistrictScores();
            setAlerts(all.filter((a) => a.tier !== "Healthy"));
            setGeneratedAt(new Date());
        } catch (err) {
            console.error("usePriorityAlerts error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        compute();
    }, [compute]);

    return { alerts, loading, generatedAt, error, refresh: compute };
}