package com.inventory.app.module.inventory.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class StockAdjustmentRequest {

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Adjustment quantity must be at least 1")
    private Integer quantity;

    @NotBlank(message = "Reason is required")
    @Size(max = 255, message = "Reason cannot exceed 255 characters")
    private String reason;
}
