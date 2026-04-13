package com.inventory.app.module.inventory.repository;

import com.inventory.app.module.inventory.entity.StockAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface StockAuditRepository extends JpaRepository<StockAudit, UUID> {
}
