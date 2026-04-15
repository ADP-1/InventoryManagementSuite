package com.inventory.app.module.analytics.dto;

import java.math.BigDecimal;

public interface RevenueTrendProjection {
    String getDate();
    BigDecimal getRevenue();
}
