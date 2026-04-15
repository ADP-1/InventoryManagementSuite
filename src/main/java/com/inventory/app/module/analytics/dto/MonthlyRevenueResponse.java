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
public class MonthlyRevenueResponse {
    private String month;
    private int year;
    private int monthNumber;
    private BigDecimal revenue;
    private BigDecimal prevYearRevenue;
}
