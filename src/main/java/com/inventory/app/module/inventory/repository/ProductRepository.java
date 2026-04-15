package com.inventory.app.module.inventory.repository;

import com.inventory.app.module.inventory.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    Optional<Product> findBySku(String sku);

    boolean existsBySku(String sku);

    long countByActiveTrue();

    @Query("SELECT p FROM Product p JOIN FETCH p.category WHERE p.active = true")
    Page<Product> findAllActiveWithCategory(Pageable pageable);

    Page<Product> findAllByActiveTrue(Pageable pageable);

    Page<Product> findByCategoryIdAndActiveTrue(UUID categoryId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.sku) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "CAST(p.price AS string) LIKE CONCAT('%', :keyword, '%'))")
    Page<Product> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    Page<Product> findByNameContainingIgnoreCaseAndActiveTrue(String keyword, Pageable pageable);

    boolean existsByCategoryIdAndActiveTrue(UUID categoryId);

    long countByActiveTrueAndQuantityLessThanEqual(Integer threshold);

    Page<Product> findByQuantityLessThanEqualAndActiveTrue(Integer threshold, Pageable pageable);
}
