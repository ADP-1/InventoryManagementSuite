package com.inventory.app.module.analytics.dto;

import java.math.BigDecimal;

public interface MonthlyRevenueProjection {
    String getMonthName();
    Integer getYearNumber();
    Integer getMonthNumber();
    BigDecimal getRevenue();
}
