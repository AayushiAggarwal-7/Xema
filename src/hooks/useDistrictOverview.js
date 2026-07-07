import { useEffect, useState, useCallback } from "react";
import { computeDistrictScores } from "../lib/scoring.js";

export function useDistrictOverview() {
    const [phcs, setPhcs] = useState([]);
    const [summary, setSummary] = useState({ total: 0, high: 0, medium: 0, healthy: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const compute = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const all = await computeDistrictScores();

            const counts = all.reduce(
                (acc, r) => {
                    if (r.tier === "High") acc.high += 1;
                    else if (r.tier === "Medium") acc.medium += 1;
                    else acc.healthy += 1;
                    return acc;
                },
                { high: 0, medium: 0, healthy: 0 }
            );

            setPhcs(all);
            setSummary({ total: all.length, ...counts });
        } catch (err) {
            console.error("useDistrictOverview error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        compute();
    }, [compute]);

    return { phcs, summary, loading, error, refresh: compute };
}