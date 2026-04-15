package com.inventory.app.module.analytics.dto;

import java.util.UUID;

public interface LowStockProjection {
    UUID getProductId();
    String getProductName();
    String getSku();
    Integer getCurrentQuantity();
    String getCategoryName();
}
