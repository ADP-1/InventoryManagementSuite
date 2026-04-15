package com.inventory.app.module.analytics.controller;

import com.inventory.app.common.response.ApiResponse;
import com.inventory.app.module.analytics.dto.*;
import com.inventory.app.module.analytics.service.AnalyticsService;
import com.inventory.app.module.billing.dto.response.InvoiceResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<SummaryResponse>> getSummary() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getSummary()));
    }

    @GetMapping("/revenue-trend")
    public ResponseEntity<ApiResponse<List<RevenueTrendProjection>>> getRevenueTrend(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getRevenueTrend(days)));
    }

    @GetMapping("/invoice-status-breakdown")
    public ResponseEntity<ApiResponse<List<StatusBreakdownResponse>>> getInvoiceStatusBreakdown() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getInvoiceStatusBreakdown()));
    }

    @GetMapping("/top-products")
    public ResponseEntity<ApiResponse<List<TopProductProjection>>> getTopProducts(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getTopProducts(limit)));
    }

    @GetMapping("/monthly-revenue")
    public ResponseEntity<ApiResponse<List<MonthlyRevenueResponse>>> getMonthlyRevenue(
            @RequestParam(defaultValue = "6") int months) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getMonthlyRevenue(months)));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<LowStockProjection>>> getLowStockItems(
            @RequestParam(defaultValue = "10") int threshold) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getLowStockItems(threshold)));
    }

    @GetMapping("/recent-invoices")
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> getRecentInvoices(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getRecentInvoices(limit)));
    }
}
