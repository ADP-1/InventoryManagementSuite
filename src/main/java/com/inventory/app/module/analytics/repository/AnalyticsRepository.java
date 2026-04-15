package com.inventory.app.module.analytics.repository;

import com.inventory.app.module.analytics.dto.*;
import com.inventory.app.module.billing.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AnalyticsRepository extends JpaRepository<Invoice, UUID> {

    @Query("SELECT SUM(i.total) FROM Invoice i WHERE i.status = 'PAID'")
    BigDecimal getTotalRevenue();

    @Query("SELECT SUM(i.total) FROM Invoice i WHERE i.status = 'PAID' AND i.createdAt >= :startDate")
    BigDecimal getRevenueSince(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT SUM(i.total) FROM Invoice i WHERE i.status = 'PAID' AND i.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal getRevenueBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(i) FROM Invoice i")
    long getTotalInvoicesCount();

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.createdAt >= :startDate")
    long getInvoicesCountSince(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT COUNT(c) FROM Customer c")
    long getTotalCustomersCount();

    @Query("SELECT COUNT(c) FROM Customer c WHERE c.createdAt >= :startDate")
    long getNewCustomersCountSince(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT COUNT(p) FROM Product p")
    long getTotalProductsCount();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.active = true")
    long getActiveProductsCount();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.quantity < :threshold")
    long getLowStockCount(@Param("threshold") int threshold);

    @Query(value = "SELECT TO_CHAR(i.created_at, 'YYYY-MM-DD') as date, SUM(i.total) as revenue " +
            "FROM invoices i WHERE i.status = 'PAID' AND i.created_at >= :startDate " +
            "GROUP BY TO_CHAR(i.created_at, 'YYYY-MM-DD') " +
            "ORDER BY date", nativeQuery = true)
    List<RevenueTrendProjection> getRevenueTrend(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT i.status as status, COUNT(i) as count FROM Invoice i GROUP BY i.status")
    List<StatusBreakdownProjection> getInvoiceStatusBreakdown();

    @Query("SELECT p.id as productId, p.name as productName, p.sku as productSku, " +
            "SUM(ii.quantity) as totalQuantitySold, SUM(ii.totalPrice) as totalRevenue " +
            "FROM InvoiceItem ii " +
            "JOIN ii.product p " +
            "JOIN ii.invoice i " +
            "WHERE i.status = 'PAID' " +
            "GROUP BY p.id, p.name, p.sku " +
            "ORDER BY totalRevenue DESC")
    List<TopProductProjection> getTopProducts();

    @Query(value = "SELECT TO_CHAR(i.created_at, 'Mon YYYY') as monthName, " +
            "EXTRACT(YEAR FROM i.created_at) as yearNumber, " +
            "EXTRACT(MONTH FROM i.created_at) as monthNumber, " +
            "SUM(i.total) as revenue " +
            "FROM invoices i " +
            "WHERE i.status = 'PAID' AND i.created_at >= :startDate " +
            "GROUP BY yearNumber, monthNumber, monthName " +
            "ORDER BY yearNumber DESC, monthNumber DESC", nativeQuery = true)
    List<MonthlyRevenueProjection> getMonthlyRevenueTrend(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT p.id as productId, p.name as productName, p.sku as sku, " +
            "p.quantity as currentQuantity, c.name as categoryName " +
            "FROM Product p " +
            "JOIN p.category c " +
            "WHERE p.quantity <= :threshold " +
            "ORDER BY p.quantity ASC")
    List<LowStockProjection> getLowStockItems(@Param("threshold") int threshold);
}
