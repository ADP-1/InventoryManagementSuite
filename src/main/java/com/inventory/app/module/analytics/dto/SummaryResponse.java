package com.inventory.app.module.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SummaryResponse {
    private BigDecimal totalRevenue;
    private BigDecimal revenueThisMonth;
    private BigDecimal revenueLastMonth;
    private Double revenueGrowthPercent;
    private long totalInvoices;
    private long invoicesThisWeek;
    private long totalCustomers;
    private long newCustomersThisMonth;
    private long totalProducts;
    private long activeProducts;
    private long lowStockCount;
}
