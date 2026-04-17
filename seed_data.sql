BEGIN;

DO $$
DECLARE
    d DATE;
    v_invoice_id UUID;
    v_cashier_id UUID;
    v_admin_id UUID;
    v_category_id UUID;
    v_daily_revenue NUMERIC;
    v_target_revenue NUMERIC;
    v_invoice_total NUMERIC;
    v_inv_seq INT;
    v_invoice_time TIMESTAMP;
BEGIN
    -- 1. Ensure we have an ADMIN user
    SELECT id INTO v_admin_id FROM users WHERE role = 'ADMIN' LIMIT 1;
    IF v_admin_id IS NULL THEN
        v_admin_id := gen_random_uuid();
        INSERT INTO users (id, name, email, password, role)
        VALUES (v_admin_id, 'System Admin', 'admin@example.com', 'password123', 'ADMIN');
    END IF;

    -- 2. Ensure we have a CASHIER user
    SELECT id INTO v_cashier_id FROM users WHERE role = 'CASHIER' LIMIT 1;
    IF v_cashier_id IS NULL THEN
        v_cashier_id := gen_random_uuid();
        INSERT INTO users (id, name, email, password, role)
        VALUES (v_cashier_id, 'Main Cashier', 'cashier@example.com', 'password123', 'CASHIER');
    END IF;

    -- 3. Ensure we have at least 5 customers
    IF (SELECT count(*) FROM customers) < 5 THEN
        INSERT INTO customers (name, email, phone, address) VALUES
        ('Acme Corp', 'contact@acme.com', '555-0101', '123 Business Rd'),
        ('Jane Doe', 'jane.doe@example.com', '555-0102', '456 Residential Ln'),
        ('John Smith', 'john.smith@example.com', '555-0103', '789 Commercial Blvd'),
        ('Tech Solutions', 'info@techsolutions.com', '555-0104', '321 Innovation Way'),
        ('Global Trade', 'sales@globaltrade.com', '555-0105', '654 Logistics Ave')
        ON CONFLICT (email) DO NOTHING;
    END IF;

    -- 4. Ensure we have a category and some products
    SELECT id INTO v_category_id FROM categories LIMIT 1;
    IF v_category_id IS NULL THEN
        v_category_id := gen_random_uuid();
        INSERT INTO categories (id, name, description) VALUES (v_category_id, 'General Electronics', 'Various electronic devices');
    END IF;

    IF (SELECT count(*) FROM products) < 5 THEN
        INSERT INTO products (name, sku, description, price, quantity, category_id) VALUES
        ('Wireless Mouse', 'WM-01', 'Ergonomic wireless mouse', 25.99, 100, v_category_id),
        ('Mechanical Keyboard', 'MK-01', 'RGB mechanical keyboard', 89.50, 50, v_category_id),
        ('USB-C Hub', 'UH-01', '7-in-1 USB-C hub', 45.00, 200, v_category_id),
        ('27-inch Monitor', 'MN-27', '4K Ultra HD monitor', 350.00, 30, v_category_id),
        ('Laptop Stand', 'LS-01', 'Aluminum adjustable laptop stand', 35.00, 150, v_category_id)
        ON CONFLICT (sku) DO NOTHING;
    END IF;

    -- Loop from November 1, 2025 to the current date
    FOR d IN SELECT generate_series('2025-11-01'::date, CURRENT_DATE, '1 day'::interval)::date LOOP

        v_daily_revenue := 0;
        v_inv_seq := 1; 
        v_target_revenue := 1000 + (RANDOM() * 9000); 

        -- STRICT CONTROL LOOP
        WHILE v_daily_revenue < v_target_revenue LOOP

            v_invoice_id := gen_random_uuid();
            v_invoice_time := d + (RANDOM() * interval '1 day'); 

            -- Create invoice header
            INSERT INTO invoices (
                id, invoice_number, customer_id, user_id,
                status, subtotal, tax_percent, tax, discount, total,
                notes, created_at, updated_at
            )
            VALUES (
                v_invoice_id,
                'INV-' || TO_CHAR(d, 'YYYYMMDD') || '-' || LPAD(v_inv_seq::text, 4, '0'),
                (SELECT id FROM customers ORDER BY RANDOM() LIMIT 1),
                v_cashier_id,
                'PAID',
                0, 18, 0, 0, 0,
                'Auto-generated seed data',
                v_invoice_time,
                v_invoice_time
            );

            -- Insert 2–4 items using the exact same timestamp as the header
            INSERT INTO invoice_items (
                id, invoice_id, product_id,
                quantity, unit_price, total_price,
                created_at, updated_at
            )
            SELECT
                gen_random_uuid(),
                v_invoice_id,
                p.id,
                qty,
                p.price,
                ROUND(qty * p.price, 2),
                v_invoice_time,
                v_invoice_time
            FROM (
                SELECT id, price, FLOOR(RANDOM()*3 + 1)::INT AS qty
                FROM products
                ORDER BY RANDOM()
                LIMIT FLOOR(RANDOM()*3 + 2)
            ) p;

            -- Update totals
            UPDATE invoices i
            SET
                subtotal = sub.total,
                tax = ROUND(sub.total * 0.18, 2),
                total = ROUND(sub.total * 1.18, 2)
            FROM (
                SELECT SUM(total_price) AS total
                FROM invoice_items
                WHERE invoice_id = v_invoice_id
            ) sub
            WHERE i.id = v_invoice_id;

            -- Accumulate revenue instead of re-summing the whole day
            SELECT total INTO v_invoice_total FROM invoices WHERE id = v_invoice_id;
            v_daily_revenue := v_daily_revenue + COALESCE(v_invoice_total, 0);

            v_inv_seq := v_inv_seq + 1;

        END LOOP;

    END LOOP;

    -- Add stock audit activity
    INSERT INTO stock_audit (
        id, product_id, adjustment_type, quantity,
        reason, performed_by, created_at
    )
    SELECT
        gen_random_uuid(),
        id,
        'ADD',
        (RANDOM()*40 + 10)::INT,
        'Restock',
        v_admin_id,
        CURRENT_DATE - (RANDOM()*10 * interval '1 day')
    FROM products
    ORDER BY RANDOM()
    LIMIT 40;

END $$;

COMMIT;