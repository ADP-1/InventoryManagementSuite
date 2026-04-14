package com.inventory.app.module.billing.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import com.inventory.app.module.billing.entity.InvoiceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class InvoiceStatusUpdateRequest {

    @NotNull(message = "Status is required")
    @Schema(example = "PAID")
    private InvoiceStatus status;
}
