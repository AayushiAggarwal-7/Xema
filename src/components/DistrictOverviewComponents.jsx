import React from "react";
import { useNavigate } from "react-router-dom";
import { useDistrictOverview } from "../hooks/useDistrictOverview"; // now points to the real hook file

export function DistrictOverviewComponent() {
    const { data, loading, error } = useDistrictOverview();
    const navigate = useNavigate();

    if (loading) return <div>Loading district data...</div>;
    if (error) return <div>Couldn't load data: {error.message}</div>;

    const phcs = data || [];
    const summary = {
        total: phcs.length,
        high: phcs.filter((p) => p.tier === "High").length,
        medium: phcs.filter((p) => p.tier === "Medium").length,
        healthy: phcs.filter((p) => p.tier === "Healthy").length,
    };

    const styles = {
        phcCard: { padding: "16px", border: "1px solid #ccc", margin: "8px 0", cursor: "pointer" },
    };

    return (
        <div>
            <h2>District Summary</h2>
            <p>Total PHCs: {summary.total} (High: {summary.high}, Medium: {summary.medium}, Healthy: {summary.healthy})</p>
            <hr />
            <h2>Primary Health Centers</h2>
            <div className="phc-list">
                {phcs.map((phc) => (
                    <div
                        key={phc.phcId}
                        style={styles.phcCard}
                        onClick={() => navigate(`/dho/phc/${phc.phcId}`)}
                        className="xema-nav-clickable"
                    >
                        <h3>{phc.phcName}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
}