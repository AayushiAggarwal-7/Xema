import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePHCReportDetail } from '../../hooks/usePHCReportDetail';
import DashboardHeader from '../../components/DashboardHeader';

const NAVY = '#1B2A4A';
const CREAM = '#FBF8F0';

export default function ReportDetail() {
    const { phcId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data, loading } = usePHCReportDetail(phcId);

    const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    if (loading || !data) {
        return <div style={styles.loadingScreen}>Loading report…</div>;
    }

    return (
        <div style={{ backgroundColor: CREAM, minHeight: '100vh' }}>
            <DashboardHeader accentColor={NAVY} />

            <div style={styles.page}>
                <div style={styles.topRow}>
                    <p style={styles.greeting}>🙂 Good Morning!!</p>
                    <div style={{ marginLeft: 'auto' }}><Bell size={20} color={NAVY} /></div>
                </div>
                <p style={styles.date}>{today}</p>

                <div style={styles.profileRow}>
                    <div style={styles.avatar} />
                    <div>
                        <p style={styles.nameLine}>Name of DHO : {user?.name || 'District Health Officer'}</p>
                        <p style={styles.districtLine}>District : {user?.district || 'District'}</p>
                    </div>
                    <span style={styles.recommendationPill}>Xema Recommendation</span>
                </div>

                <p style={styles.sectionLabel}>Submitted Report</p>

                {data.reportType === 'stock' && (
                    <div style={styles.reportCard}>
                        <p style={styles.reportLine}><b>Report type:</b> Stock Update</p>
                        <p style={styles.reportLine}><b>PHC:</b> {data.phcName}</p>
                        <p style={styles.reportLine}><b>Submitted by:</b> Pharmacist, {data.phcName?.replace('PHC ', '')}</p>
                        <br />
                        {data.lowStock.map((item) => (
                            <div key={item.id}>
                                <p style={styles.reportLine}><b>Medicine:</b> {item.medName}</p>
                                <p style={styles.reportLine}>Quantity in hand: {item.quantity} {item.unit}</p>
                                <p style={styles.reportLine}>Reorder threshold: {item.threshold} {item.unit}</p>
                                <p style={styles.reportLineWarn}>Status: Below threshold ⚠️</p>
                                <br />
                            </div>
                        ))}
                        <p style={styles.noteLine}>
                            NOTE: "{data.lowStock.length > 1 ? 'Multiple medicines' : 'This medicine is'} critically low.
                            Requesting urgent resupply or inter-PHC transfer."
                        </p>
                    </div>
                )}

                {data.reportType === 'disease' && data.diseaseTrend && (
                    <>
                        <div style={styles.reportCard}>
                            <p style={styles.reportLine}><b>Report type:</b> Daily Patient &amp; Disease Log</p>
                            <p style={styles.reportLine}><b>PHC:</b> {data.phcName}</p>
                            <p style={styles.reportLine}><b>Total patients seen today:</b> {data.latestReport?.patient_count ?? '—'}</p>
                            <p style={styles.reportLine}><b>{data.diseaseTrend.name} cases:</b> {data.diseaseTrend.values.at(-1)}</p>
                            <p style={styles.reportLine}><b>Doctor status:</b> {data.latestReport?.doctor_present ? 'Present, full day' : 'Absent'}</p>
                        </div>
                        <div style={{ ...styles.reportCard, borderColor: '#F3A6A6' }}>
                            <p style={styles.trendTitle}>Trend Note:</p>
                            <p style={styles.reportLine}>
                                {data.diseaseTrend.name} cases have risen over the past week ({data.diseaseTrend.values.join(' → ')})
                            </p>
                            <p style={styles.reportLine}>Suspect possible outbreak. Requesting district review.</p>
                        </div>
                    </>
                )}

                {data.reportType === 'general' && (
                    <div style={styles.reportCard}>
                        <p style={styles.reportLine}>No active alerts for this PHC — all metrics within normal range.</p>
                    </div>
                )}

                <div style={styles.backLink} onClick={() => navigate('/dho/ai-priorities')}>← Back</div>
            </div>
        </div>
    );
}

const styles = {
    loadingScreen: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: CREAM, color: NAVY },
    page: { maxWidth: '700px', margin: '0 auto', padding: '20px 24px 40px' },
    topRow: { display: 'flex', alignItems: 'center' },
    greeting: { fontSize: '14px', color: '#E0A72E', fontWeight: 600, margin: 0 },
    date: { textAlign: 'center', fontSize: '18px', color: NAVY, fontWeight: 700, margin: '0 0 20px' },

    profileRow: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' },
    avatar: { width: '56px', height: '56px', borderRadius: '10px', backgroundColor: '#5EC5D6' },
    nameLine: { fontSize: '15px', fontWeight: 700, color: NAVY, margin: 0 },
    districtLine: { fontSize: '13px', color: '#5B5A52', margin: '2px 0 0' },
    recommendationPill: { marginLeft: 'auto', backgroundColor: '#8FE0A8', color: NAVY, fontWeight: 700, fontSize: '13px', padding: '8px 16px', borderRadius: '999px' },

    sectionLabel: { fontSize: '15px', fontWeight: 700, color: NAVY, marginBottom: '8px' },

    reportCard: { backgroundColor: '#FDF0EF', border: '1.5px solid #F3D6D6', borderRadius: '16px', padding: '18px 22px', marginBottom: '16px' },
    reportLine: { fontSize: '14px', color: NAVY, margin: '4px 0' },
    reportLineWarn: { fontSize: '14px', color: '#B5541F', fontWeight: 700, margin: '4px 0' },
    noteLine: { fontSize: '14px', fontWeight: 700, color: NAVY, marginTop: '10px' },
    trendTitle: { fontSize: '15px', fontWeight: 800, color: NAVY, margin: '0 0 6px' },

    backLink: { fontSize: '14px', color: '#6B6A63', fontWeight: 600, cursor: 'pointer', marginTop: '12px' },
};