package com.inventory.app.module.billing.dto.response;

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
public class InvoiceResponse {

    private UUID id;
    private String invoiceNumber;

    private UUID customerId;
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
