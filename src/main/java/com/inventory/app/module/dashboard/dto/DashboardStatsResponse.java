package com.inventory.app.module.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalProducts;
    private long totalCategories;
    private long totalCustomers;
    private long totalInvoices;
    private BigDecimal totalRevenue;
    private long pendingInvoices;
    private long lowStockProducts;
    private List<MonthlyRevenueDto> monthlyRevenue;
}
