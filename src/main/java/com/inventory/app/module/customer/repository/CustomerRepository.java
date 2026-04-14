package com.inventory.app.module.customer.repository;

import com.inventory.app.module.customer.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {

    Optional<Customer> findByEmail(String email);

    boolean existsByEmail(String email);

    Page<Customer> findAllByActiveTrue(Pageable pageable);

    @Query("SELECT c FROM Customer c WHERE c.active = true AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.phone) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Customer> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // Check for active invoices before soft delete
    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.customer.id = :customerId " +
           "AND i.status IN ('DRAFT', 'ISSUED')")
    long countActiveInvoicesByCustomerId(@Param("customerId") UUID customerId);
}
