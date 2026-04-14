-- Drop tables if they exist (in correct order to respect foreign keys)
DROP TABLE IF EXISTS public.invoice_items CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.stock_audit CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- CREATE TABLES

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" varchar(100) NOT NULL,
    email varchar(150) NOT NULL,
    "password" varchar(255) NOT NULL,
    "role" varchar(20) NOT NULL,
    active bool DEFAULT true NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['ADMIN'::character varying, 'MANAGER'::character varying, 'CASHIER'::character varying])::text[])))
);
CREATE UNIQUE INDEX idx_users_email ON public.users USING btree (email);


CREATE TABLE public.customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" varchar(100) NOT NULL,
    email varchar(150) NOT NULL,
    phone varchar(20) NULL,
    address varchar(255) NULL,
    active bool DEFAULT true NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL,
    CONSTRAINT customers_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX idx_customers_email ON public.customers USING btree (email);


CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" varchar(100) NOT NULL,
    description varchar(500) NULL,
    active bool DEFAULT true NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL,
    CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX idx_categories_name ON public.categories USING btree (name);


CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" varchar(150) NOT NULL,
    sku varchar(50) NOT NULL,
    description varchar(500) NULL,
    price numeric(12, 2) NOT NULL,
    quantity int4 DEFAULT 0 NOT NULL,
    category_id uuid NOT NULL,
    active bool DEFAULT true NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL,
    CONSTRAINT products_pkey PRIMARY KEY (id),
    CONSTRAINT products_price_check CHECK ((price >= (0)::numeric)),
    CONSTRAINT products_quantity_check CHECK ((quantity >= 0)),
    CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE INDEX idx_products_category_id ON public.products USING btree (category_id);
CREATE UNIQUE INDEX idx_products_sku ON public.products USING btree (sku);


CREATE TABLE public.stock_audit (
    id uuid NOT NULL,
    product_id uuid NOT NULL,
    adjustment_type varchar(50) NOT NULL,
    quantity int4 NOT NULL,
    reason varchar(255) NOT NULL,
    performed_by uuid NOT NULL,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT stock_audit_pkey PRIMARY KEY (id),
    CONSTRAINT stock_audit_quantity_check CHECK ((quantity >= 0)),
    CONSTRAINT stock_audit_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES public.users(id),
    CONSTRAINT stock_audit_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE INDEX idx_stock_audit_product ON public.stock_audit USING btree (product_id);
CREATE INDEX idx_stock_audit_user ON public.stock_audit USING btree (performed_by);


CREATE TABLE public.invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_number varchar(50) NOT NULL,
    customer_id uuid NOT NULL,
    user_id uuid NOT NULL,
    status varchar(20) DEFAULT 'DRAFT'::character varying NOT NULL,
    subtotal numeric(12, 2) DEFAULT 0 NOT NULL,
    tax_percent numeric(5, 2) DEFAULT 0.00 NOT NULL,
    tax numeric(12, 2) DEFAULT 0 NOT NULL,
    discount numeric(12, 2) DEFAULT 0 NOT NULL,
    total numeric(12, 2) DEFAULT 0 NOT NULL,
    notes varchar(500) NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL,
    CONSTRAINT invoices_pkey PRIMARY KEY (id),
    CONSTRAINT chk_tax_percent CHECK (((tax_percent >= (0)::numeric) AND (tax_percent <= (100)::numeric))),
    CONSTRAINT invoices_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'ISSUED'::character varying, 'PAID'::character varying, 'CANCELLED'::character varying])::text[]))),
    CONSTRAINT invoices_subtotal_check CHECK ((subtotal >= (0)::numeric)),
    CONSTRAINT invoices_tax_check CHECK ((tax >= (0)::numeric)),
    CONSTRAINT invoices_discount_check CHECK ((discount >= (0)::numeric)),
    CONSTRAINT invoices_total_check CHECK ((total >= (0)::numeric)),
    CONSTRAINT invoices_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
    CONSTRAINT invoices_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE INDEX idx_invoices_customer_id ON public.invoices USING btree (customer_id);
CREATE UNIQUE INDEX idx_invoices_invoice_number ON public.invoices USING btree (invoice_number);
CREATE INDEX idx_invoices_user_id ON public.invoices USING btree (user_id);


CREATE TABLE public.invoice_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity int4 NOT NULL,
    unit_price numeric(12, 2) NOT NULL,
    total_price numeric(12, 2) NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL,
    CONSTRAINT invoice_items_pkey PRIMARY KEY (id),
    CONSTRAINT invoice_items_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT invoice_items_unit_price_check CHECK ((unit_price >= (0)::numeric)),
    CONSTRAINT invoice_items_total_price_check CHECK ((total_price >= (0)::numeric)),
    CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE,
    CONSTRAINT invoice_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE INDEX idx_invoice_items_invoice_id ON public.invoice_items USING btree (invoice_id);
CREATE INDEX idx_invoice_items_product_id ON public.invoice_items USING btree (product_id);

-- Apply Ownership and Permissions
ALTER TABLE public.users OWNER TO postgres;
GRANT ALL ON TABLE public.users TO postgres;

ALTER TABLE public.customers OWNER TO postgres;
GRANT ALL ON TABLE public.customers TO postgres;

ALTER TABLE public.categories OWNER TO postgres;
GRANT ALL ON TABLE public.categories TO postgres;

ALTER TABLE public.products OWNER TO postgres;
GRANT ALL ON TABLE public.products TO postgres;

ALTER TABLE public.stock_audit OWNER TO postgres;
GRANT ALL ON TABLE public.stock_audit TO postgres;

ALTER TABLE public.invoices OWNER TO postgres;
GRANT ALL ON TABLE public.invoices TO postgres;

ALTER TABLE public.invoice_items OWNER TO postgres;
GRANT ALL ON TABLE public.invoice_items TO postgres;
