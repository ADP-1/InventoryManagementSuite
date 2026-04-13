CREATE TABLE stock_audit (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id),
    adjustment_type VARCHAR(50) NOT NULL,
    quantity INT NOT NULL CHECK (quantity >= 0),
    reason VARCHAR(255) NOT NULL,
    performed_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_audit_product ON stock_audit(product_id);
CREATE INDEX idx_stock_audit_user ON stock_audit(performed_by);
