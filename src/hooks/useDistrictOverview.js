import { useState, useEffect } from "react";
import { computeDistrictScores } from "../lib/scoring"; // adjust if your scoring.js lives elsewhere

export function useDistrictOverview() {
    const [phcs, setPhcs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                const results = await computeDistrictScores();
                if (!cancelled) {
                    setPhcs(results);
                    setError(null);
                }
            } catch (err) {
                if (!cancelled) setError(err.message || String(err));
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    // Derived summary counts, computed fresh from phcs on every render —
    // this is the piece CommandCenter.jsx needs and the previous version
    // of this hook never actually returned.
    const summary = {
        total: phcs.length,
        high: phcs.filter((p) => p.tier === "High").length,
        medium: phcs.filter((p) => p.tier === "Medium").length,
        healthy: phcs.filter((p) => p.tier === "Healthy").length,
    };

    return { phcs, summary, loading, error };
}