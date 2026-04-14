package com.inventory.app.module.billing.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class InvoiceItemRequest {

    @NotNull(message = "Product ID is required")
    @Schema(example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID productId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Schema(example = "3")
    private Integer quantity;
}
