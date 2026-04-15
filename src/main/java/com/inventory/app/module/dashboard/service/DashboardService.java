package com.inventory.app.module.dashboard.service;

import com.inventory.app.module.billing.repository.InvoiceRepository;
import com.inventory.app.module.customer.repository.CustomerRepository;
import com.inventory.app.module.dashboard.dto.DashboardStatsResponse;
import com.inventory.app.module.dashboard.dto.MonthlyRevenueDto;
import com.inventory.app.module.inventory.repository.CategoryRepository;
import com.inventory.app.module.inventory.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats() {
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6).withDayOfMonth(1).withHour(0).withMinute(0);

        List<Object[]> monthlyRevenueData = invoiceRepository.getMonthlyRevenue(sixMonthsAgo);
        List<MonthlyRevenueDto> monthlyRevenue = monthlyRevenueData.stream()
                .map(data -> new MonthlyRevenueDto((String) data[0], (BigDecimal) data[1]))
                .collect(Collectors.toList());

        return DashboardStatsResponse.builder()
                .totalProducts(productRepository.countByActiveTrue())
                .totalCategories(categoryRepository.countByActiveTrue())
                .totalCustomers(customerRepository.countByActiveTrue())
                .totalInvoices(invoiceRepository.count())
                .totalRevenue(invoiceRepository.getTotalRevenue())
                .pendingInvoices(invoiceRepository.countPendingInvoices())
                .lowStockProducts(productRepository.countByActiveTrueAndQuantityLessThanEqual(10))
                .monthlyRevenue(monthlyRevenue)
                .build();
    }
}
