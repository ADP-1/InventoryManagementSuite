package com.inventory.app.module.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusBreakdownResponse {
    private String status;
    private long count;
    private Double percentage;
}
