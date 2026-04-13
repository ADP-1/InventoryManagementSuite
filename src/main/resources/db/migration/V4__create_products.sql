-- V4: Create products table
CREATE TABLE products (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(150)    NOT NULL,
    sku         VARCHAR(50)     NOT NULL,
    description VARCHAR(500),
    price       NUMERIC(12, 2)  NOT NULL CHECK (price >= 0),
    quantity    INT             NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    category_id UUID            NOT NULL REFERENCES categories (id),
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_products_sku         ON products (sku);
CREATE        INDEX idx_products_category_id ON products (category_id);
