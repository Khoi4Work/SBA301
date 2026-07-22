import React, { useState } from "react";
import { useLearnerGrowth } from "@/features/admin/hooks/useLearnerGrowth.js";

const TABS = [
    { key: "daily",   label: "Ngày",   icon: "today" },
    { key: "weekly",  label: "Tuần",   icon: "date_range" },
    { key: "monthly", label: "Tháng",  icon: "calendar_month" },
    { key: "yearly",  label: "Năm",    icon: "calendar_today" },
];

function GrowthRateBadge({ value, label }) {
    const num = parseFloat(value);
    const isUp = num >= 0;
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
            isUp ? "bg-emerald-500/15 text-emerald-400" : "bg-error/15 text-error"
        }`}>
            <span className="material-symbols-outlined text-[13px]">
                {isUp ? "trending_up" : "trending_down"}
            </span>
            {isUp ? "+" : ""}{num}% {label}
        </span>
    );
}

function BarChart({ points }) {
    if (!points || points.length === 0) return (
        <div className="flex-1 flex items-center justify-center text-on-surface-variant/50 text-sm">
            Không có dữ liệu
        </div>
    );

    const max = Math.max(...points.map(p => p.count), 1);

    return (
        <div className="flex-1 flex items-end justify-between gap-1.5 px-2 pb-0 pt-4 overflow-x-auto min-h-[180px]">
            {points.map((p, i) => {
                const heightPct = Math.max((p.count / max) * 100, p.count > 0 ? 4 : 0);
                const isLast = i === points.length - 1;
                return (
                    <div key={i} className="flex flex-col items-center gap-1.5 flex-1 min-w-[32px] group relative">
                        {/* Tooltip */}
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-surface-container text-on-surface text-[11px] font-bold px-2 py-0.5 rounded border border-outline/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            {p.count}
                        </div>
                        {/* Bar */}
                        <div className="w-full relative flex flex-col justify-end" style={{ height: "160px" }}>
                            <div
                                className={`w-full rounded-t-sm transition-all duration-700 ease-out ${
                                    isLast
                                        ? "bg-secondary shadow-[0_0_12px_rgba(var(--secondary-rgb,120,80,200),0.4)]"
                                        : "bg-secondary/40 group-hover:bg-secondary/60"
                                }`}
                                style={{ height: `${heightPct}%` }}
                            />
                        </div>
                        <span className="text-[9px] uppercase tracking-tight text-on-surface-variant/70 text-center leading-tight">
                            {p.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

export default function LearnerGrowthChart() {
    const { data, loading, error } = useLearnerGrowth();
    const [activeTab, setActiveTab] = useState("daily");

    const pointsMap = {
        daily:   data?.dailyPoints,
        weekly:  data?.weeklyPoints,
        monthly: data?.monthlyPoints,
        yearly:  data?.yearlyPoints,
    };

    return (
        <div className="lg:col-span-2 folio-card bg-surface-container-low p-8 flex flex-col min-h-[440px]">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div>
                    <h3 className="font-display text-2xl font-semibold text-on-surface">Tăng trưởng Học giả</h3>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {/*{!loading && data && (*/}
                        {/*    <>*/}
                        {/*        <GrowthRateBadge value={data.growthRateWeek}  label="so tuần trước" />*/}
                        {/*        <GrowthRateBadge value={data.growthRateMonth} label="so tháng trước" />*/}
                        {/*    </>*/}
                        {/*)}*/}
                    </div>
                </div>

                {/* Tab switcher */}
                <div className="flex bg-surface-container-high border border-outline/20 rounded-lg p-0.5 shrink-0">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            title={tab.label}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                activeTab === tab.key
                                    ? "bg-surface text-secondary shadow-sm"
                                    : "text-on-surface-variant hover:text-on-surface"
                            }`}
                        >
                            <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/*/!* Summary strip *!/*/}
            {/*{!loading && data && (*/}
            {/*    <div className="grid grid-cols-4 gap-3 mb-6">*/}
            {/*        {[*/}
            {/*            { label: "Hôm nay",  value: data.newToday,     icon: "person_add" },*/}
            {/*            { label: "Tuần này", value: data.newThisWeek,  icon: "group_add" },*/}
            {/*            { label: "Tháng này",value: data.newThisMonth, icon: "calendar_month" },*/}
            {/*            { label: "Năm này",  value: data.newThisYear,  icon: "calendar_today" },*/}
            {/*        ].map(({ label, value, icon }) => (*/}
            {/*            <div key={label} className="bg-surface-container-high/50 border border-outline/10 rounded-lg px-3 py-2 text-center">*/}
            {/*                <span className="material-symbols-outlined text-secondary text-[18px]">{icon}</span>*/}
            {/*                <p className="text-xl font-display font-bold text-on-surface mt-0.5">{value}</p>*/}
            {/*                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{label}</p>*/}
            {/*            </div>*/}
            {/*        ))}*/}
            {/*    </div>*/}
            {/*)}*/}

            {/* Chart area */}
            {loading ? (
                <div className="flex-1 flex items-center justify-center text-on-surface-variant animate-pulse">
                    Đang tải dữ liệu...
                </div>
            ) : error ? (
                <div className="flex-1 flex items-center justify-center text-error/70 text-sm">
                    Lỗi tải dữ liệu tăng trưởng
                </div>
            ) : (
                <BarChart points={pointsMap[activeTab]} />
            )}
        </div>
    );
}
