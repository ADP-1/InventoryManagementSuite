package com.inventory.app.module.billing.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import com.inventory.app.module.billing.entity.InvoiceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Full invoice with line items")
public class InvoiceResponse {

    @Schema(description = "Unique identifier of the invoice")
    private UUID id;
    @Schema(description = "Human-readable invoice number")
    private String invoiceNumber;

    @Schema(description = "ID of the customer associated with the invoice")
    private UUID customerId;
    @Schema(description = "Name of the customer")
    private String customerName;
    private String customerEmail;

    private UUID createdById;
    private String createdByName;

    private InvoiceStatus status;

    private BigDecimal subtotal;
    private BigDecimal taxPercent;
    private BigDecimal tax;
    private BigDecimal discount;
    private BigDecimal total;

    private String notes;

    private List<InvoiceItemResponse> items;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
