-- Invoices: most queried columns
CREATE INDEX IF NOT EXISTS idx_invoices_status_created
    ON invoices (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_total
    ON invoices (total DESC);

-- Products: search optimization
CREATE INDEX IF NOT EXISTS idx_products_name_lower
    ON products (LOWER(name));
CREATE INDEX IF NOT EXISTS idx_products_active_quantity
    ON products (active, quantity);

-- Stock audit: time-range queries
CREATE INDEX IF NOT EXISTS idx_stock_audit_created_at
    ON stock_audit (created_at DESC);

-- Customers: search optimization
CREATE INDEX IF NOT EXISTS idx_customers_name_lower
    ON customers (LOWER(name));
