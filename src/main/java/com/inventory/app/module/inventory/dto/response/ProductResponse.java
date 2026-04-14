package com.inventory.app.module.inventory.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Product with category info")
public class ProductResponse {

    @Schema(description = "Unique identifier of the product")
    private UUID id;
    @Schema(description = "Name of the product")
    private String name;
    @Schema(description = "Stock Keeping Unit")
    private String sku;
    @Schema(description = "Detailed description of the product")
    private String description;
    @Schema(description = "Price of the product")
    private BigDecimal price;
    private int quantity;
    private boolean active;
    
    private UUID categoryId;
    private String categoryName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
