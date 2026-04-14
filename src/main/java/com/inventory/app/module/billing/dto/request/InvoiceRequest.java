package com.inventory.app.module.billing.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class InvoiceRequest {

    @NotNull(message = "Customer ID is required")
    @Schema(example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID customerId;

    @NotNull(message = "Items list is required")
    @NotEmpty(message = "Invoice must contain at least one item")
    @Valid
    private List<InvoiceItemRequest> items;

    @NotNull(message = "Tax percent is required")
    @DecimalMin(value = "0.0", message = "Tax percent cannot be negative")
    @DecimalMax(value = "100.0", message = "Tax percent cannot exceed 100")
    @Schema(example = "18.0")
    private BigDecimal taxPercent = BigDecimal.ZERO;

    @NotNull(message = "Discount is required")
    @DecimalMin(value = "0.0", message = "Discount cannot be negative")
    @Schema(example = "500.00")
    private BigDecimal discount = BigDecimal.ZERO;

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    @Schema(example = "Bulk order discount applied")
    private String notes;
}
