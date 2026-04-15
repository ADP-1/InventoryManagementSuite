package com.inventory.app.module.analytics.dto;

import java.math.BigDecimal;
import java.util.UUID;

public interface TopProductProjection {
    UUID getProductId();
    String getProductName();
    String getProductSku();
    Long getTotalQuantitySold();
    BigDecimal getTotalRevenue();
}
