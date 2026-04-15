package com.inventory.app.module.billing.repository;

import com.inventory.app.module.billing.entity.Invoice;
import com.inventory.app.module.billing.entity.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    boolean existsByInvoiceNumber(String invoiceNumber);

    @Query("SELECT i FROM Invoice i " +
           "JOIN FETCH i.customer " +
           "JOIN FETCH i.user " +
           "LEFT JOIN FETCH i.items it " +
           "JOIN FETCH it.product " +
           "WHERE i.id = :id")
    Optional<Invoice> findByIdWithDetails(@Param("id") UUID id);

    @Query(value = "SELECT DISTINCT i FROM Invoice i " +
           "JOIN FETCH i.customer " +
           "JOIN FETCH i.user " +
           "WHERE i.customer.id = :customerId",
           countQuery = "SELECT COUNT(i) FROM Invoice i WHERE i.customer.id = :customerId")
    Page<Invoice> findByCustomerIdWithDetails(@Param("customerId") UUID customerId, Pageable pageable);

    Page<Invoice> findByCustomerId(UUID customerId, Pageable pageable);

    Page<Invoice> findByStatus(InvoiceStatus status, Pageable pageable);

    @Query("SELECT COALESCE(SUM(i.total), 0) FROM Invoice i WHERE i.status = 'PAID'")
    BigDecimal getTotalRevenue();

    @Query("SELECT to_char(i.createdAt, 'Mon'), COALESCE(SUM(i.total), 0) " +
           "FROM Invoice i WHERE i.status = com.inventory.app.module.billing.entity.InvoiceStatus.PAID " +
           "AND i.createdAt >= :startDate " +
           "GROUP BY to_char(i.createdAt, 'Mon'), date_trunc('month', i.createdAt) " +
           "ORDER BY date_trunc('month', i.createdAt)")
    List<Object[]> getMonthlyRevenue(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.status IN (com.inventory.app.module.billing.entity.InvoiceStatus.DRAFT, com.inventory.app.module.billing.entity.InvoiceStatus.ISSUED)")
    long countPendingInvoices();
}
