package com.inventory.app.module.customer.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
public class CustomerStats {
    private long totalInvoices;
    private BigDecimal totalSpent;
    private LocalDateTime firstTransactionDate;

    public CustomerStats(Long totalInvoices, BigDecimal totalSpent, LocalDateTime firstTransactionDate) {
        this.totalInvoices = totalInvoices != null ? totalInvoices : 0L;
        this.totalSpent = totalSpent != null ? totalSpent : BigDecimal.ZERO;
        this.firstTransactionDate = firstTransactionDate;
    }
}
