package com.inventory.app.module.inventory.repository;

import com.inventory.app.module.inventory.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    Optional<Product> findBySku(String sku);

    boolean existsBySku(String sku);

    Page<Product> findAllByActiveTrue(Pageable pageable);

    Page<Product> findByCategoryIdAndActiveTrue(UUID categoryId, Pageable pageable);

    Page<Product> findByNameContainingIgnoreCaseAndActiveTrue(String keyword, Pageable pageable);

    boolean existsByCategoryIdAndActiveTrue(UUID categoryId);

    Page<Product> findByQuantityLessThanEqualAndActiveTrue(Integer threshold, Pageable pageable);
}
