-- V5: Create invoices table
CREATE TABLE invoices (
    id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50)    NOT NULL,
    customer_id    UUID           NOT NULL REFERENCES customers (id),
    user_id        UUID           NOT NULL REFERENCES users (id),
    status         VARCHAR(20)    NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ISSUED', 'PAID', 'CANCELLED')),
    subtotal       NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    tax            NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
    discount       NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
    total          NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total >= 0),
    created_at     TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_invoices_invoice_number ON invoices (invoice_number);
CREATE        INDEX idx_invoices_customer_id    ON invoices (customer_id);
CREATE        INDEX idx_invoices_user_id        ON invoices (user_id);
