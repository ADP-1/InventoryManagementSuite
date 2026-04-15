package com.inventory.app.module.analytics.service;

import com.inventory.app.module.analytics.dto.*;
import com.inventory.app.module.analytics.repository.AnalyticsRepository;
import com.inventory.app.module.billing.dto.response.InvoiceResponse;
import com.inventory.app.module.billing.entity.Invoice;
import com.inventory.app.module.billing.mapper.InvoiceMapper;
import com.inventory.app.module.billing.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final AnalyticsRepository analyticsRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceMapper invoiceMapper;

    public SummaryResponse getSummary() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime firstDayThisMonth = now.with(TemporalAdjusters.firstDayOfMonth()).with(LocalTime.MIN);
        LocalDateTime firstDayLastMonth = firstDayThisMonth.minusMonths(1);
        LocalDateTime lastDayLastMonth = firstDayThisMonth.minusNanos(1);
        LocalDateTime firstDayThisWeek = now.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY)).with(LocalTime.MIN);

        BigDecimal totalRevenue = analyticsRepository.getTotalRevenue();
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        BigDecimal revenueThisMonth = analyticsRepository.getRevenueSince(firstDayThisMonth);
        if (revenueThisMonth == null) revenueThisMonth = BigDecimal.ZERO;

        BigDecimal revenueLastMonth = analyticsRepository.getRevenueBetween(firstDayLastMonth, lastDayLastMonth);
        if (revenueLastMonth == null) revenueLastMonth = BigDecimal.ZERO;

        double growthPercent = 0.0;
        if (revenueLastMonth.compareTo(BigDecimal.ZERO) > 0) {
            growthPercent = revenueThisMonth.subtract(revenueLastMonth)
                    .divide(revenueLastMonth, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        } else if (revenueThisMonth.compareTo(BigDecimal.ZERO) > 0) {
            growthPercent = 100.0;
        }

        return SummaryResponse.builder()
                .totalRevenue(totalRevenue)
                .revenueThisMonth(revenueThisMonth)
                .revenueLastMonth(revenueLastMonth)
                .revenueGrowthPercent(growthPercent)
                .totalInvoices(analyticsRepository.getTotalInvoicesCount())
                .invoicesThisWeek(analyticsRepository.getInvoicesCountSince(firstDayThisWeek))
                .totalCustomers(analyticsRepository.getTotalCustomersCount())
                .newCustomersThisMonth(analyticsRepository.getNewCustomersCountSince(firstDayThisMonth))
                .totalProducts(analyticsRepository.getTotalProductsCount())
                .activeProducts(analyticsRepository.getActiveProductsCount())
                .lowStockCount(analyticsRepository.getLowStockCount(10))
                .build();
    }

    public List<RevenueTrendProjection> getRevenueTrend(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days).with(LocalTime.MIN);
        return analyticsRepository.getRevenueTrend(startDate);
    }

    public List<StatusBreakdownResponse> getInvoiceStatusBreakdown() {
        List<StatusBreakdownProjection> projections = analyticsRepository.getInvoiceStatusBreakdown();
        long total = projections.stream().mapToLong(StatusBreakdownProjection::getCount).sum();

        return projections.stream().map(p -> StatusBreakdownResponse.builder()
                .status(p.getStatus())
                .count(p.getCount())
                .percentage(total > 0 ? (double) p.getCount() / total * 100 : 0.0)
                .build())
                .collect(Collectors.toList());
    }

    public List<TopProductProjection> getTopProducts(int limit) {
        List<TopProductProjection> all = analyticsRepository.getTopProducts();
        return all.stream().limit(limit).collect(Collectors.toList());
    }

    public List<MonthlyRevenueResponse> getMonthlyRevenue(int months) {
        LocalDateTime startDate = LocalDateTime.now().minusMonths(months + 12).with(TemporalAdjusters.firstDayOfMonth()).with(LocalTime.MIN);
        List<MonthlyRevenueProjection> allProjections = analyticsRepository.getMonthlyRevenueTrend(startDate);

        Map<String, BigDecimal> revenueMap = allProjections.stream()
                .collect(Collectors.toMap(
                        p -> p.getYearNumber() + "-" + p.getMonthNumber(),
                        MonthlyRevenueProjection::getRevenue,
                        (existing, replacement) -> existing
                ));

        List<MonthlyRevenueResponse> results = new ArrayList<>();
        LocalDate current = LocalDate.now();

        for (int i = 0; i < months; i++) {
            LocalDate targetDate = current.minusMonths(i);
            String currentKey = targetDate.getYear() + "-" + targetDate.getMonthValue();
            String prevYearKey = (targetDate.getYear() - 1) + "-" + targetDate.getMonthValue();

            results.add(MonthlyRevenueResponse.builder()
                    .month(targetDate.getMonth().name().substring(0, 3) + " " + targetDate.getYear())
                    .year(targetDate.getYear())
                    .monthNumber(targetDate.getMonthValue())
                    .revenue(revenueMap.getOrDefault(currentKey, BigDecimal.ZERO))
                    .prevYearRevenue(revenueMap.getOrDefault(prevYearKey, BigDecimal.ZERO))
                    .build());
        }

        return results;
    }

    public List<LowStockProjection> getLowStockItems(int threshold) {
        return analyticsRepository.getLowStockItems(threshold);
    }

    public List<InvoiceResponse> getRecentInvoices(int limit) {
        List<Invoice> invoices = invoiceRepository.findAll(
                PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent();
        return invoices.stream().map(invoiceMapper::toResponse).collect(Collectors.toList());
    }
}
