ALTER TABLE invoices ADD COLUMN tax_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00;
ALTER TABLE invoices ADD CONSTRAINT chk_tax_percent CHECK (tax_percent >= 0 AND tax_percent <= 100);
