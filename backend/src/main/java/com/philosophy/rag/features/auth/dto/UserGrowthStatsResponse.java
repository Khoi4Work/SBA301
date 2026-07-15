package com.philosophy.rag.features.auth.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record UserGrowthStatsResponse(
        long totalUsers,
        long newToday,
        long newThisWeek,
        long newThisMonth,
        long newThisYear,
        double growthRateWeek,    // % so với tuần trước
        double growthRateMonth,   // % so với tháng trước
        List<DataPoint> dailyPoints,   // 7 ngày gần nhất
        List<DataPoint> weeklyPoints,  // 8 tuần gần nhất
        List<DataPoint> monthlyPoints, // 12 tháng gần nhất
        List<DataPoint> yearlyPoints   // 5 năm gần nhất
) {
    @Builder
    public record DataPoint(String label, long count) {}
}
