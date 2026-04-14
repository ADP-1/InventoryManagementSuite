package com.inventory.app.module.inventory.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class ProductRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 150, message = "Name must not exceed 150 characters")
    @Schema(example = "Laptop Pro 15")
    private String name;

    @NotBlank(message = "SKU is required")
    @Size(max = 100, message = "SKU must not exceed 100 characters")
    @Schema(example = "LAP-PRO-001")
    private String sku;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    @Schema(example = "A high-performance laptop")
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Price must be greater than or equal to 0")
    @Digits(integer = 10, fraction = 2, message = "Price format must be up to 10 digits and 2 decimals")
    @Schema(example = "79999.00")
    private BigDecimal price;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity cannot be less than 0")
    @Schema(example = "50")
    private Integer quantity;

    @NotNull(message = "Category ID is required")
    @Schema(example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID categoryId;
}
