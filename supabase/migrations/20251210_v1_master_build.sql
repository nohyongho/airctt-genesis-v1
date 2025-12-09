-- AIRCTT v1 Master Schema
-- Based on the "First Love Letter" Design
-- Date: 2025-12-10

-- =========================================================
-- 0. Cleanup & Setup (Clean Slate logic carefully applied)
-- =========================================================

-- Note: We are not aggressively dropping everything to prevent accidental data loss in production,
-- but for a clean apply on a dev environment, you might want to reset.
-- This script uses CREATE TABLE IF NOT EXISTS and ALTER TABLE to ensure structure.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================
-- 1. Enum Definitions
-- =========================================================

DO $$ BEGIN
    CREATE TYPE public.media_owner_type AS ENUM ('store', 'product', 'coupon', 'cultural_event');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.media_file_type AS ENUM ('image', 'video', 'pdf');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.merchant_type AS ENUM ('restaurant', 'retail', 'culture', 'service', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.merchant_role AS ENUM ('owner', 'manager', 'staff');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.discount_type AS ENUM ('percent', 'amount');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.coupon_center_type AS ENUM ('store', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.issue_origin AS ENUM ('event', 'merchant', 'admin', 'table_order');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.event_type AS ENUM ('global', 'category', 'store');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.product_type AS ENUM ('menu', 'retail', 'ticket');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.order_type AS ENUM ('table_order', 'online_order', 'ticket');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.order_status AS ENUM ('pending', 'paid', 'preparing', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.payment_method AS ENUM ('card', 'cash', 'pg', 'etc');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.payment_status AS ENUM ('pending', 'approved', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.seat_status AS ENUM ('available', 'reserved', 'sold');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.ticket_status AS ENUM ('valid', 'used', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- =========================================================
-- 2. Common Tables (Users, Categories, Media)
-- =========================================================

-- 1-1) users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE,
    password_hash TEXT, -- nullable for social
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 1-2) categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES public.categories(id),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    level SMALLINT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1-3) media_assets
CREATE TABLE IF NOT EXISTS public.media_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_type public.media_owner_type,
    owner_id UUID, -- Polymorphic ID, no FK constraint
    url TEXT NOT NULL,
    type public.media_file_type NOT NULL DEFAULT 'image',
    title TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================
-- 3. Merchants & Stores
-- =========================================================

-- 2-1) merchants
CREATE TABLE IF NOT EXISTS public.merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type public.merchant_type NOT NULL,
    homepage_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;

-- 2-2) merchant_users
CREATE TABLE IF NOT EXISTS public.merchant_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role public.merchant_role NOT NULL DEFAULT 'staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2-3) stores
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    lat NUMERIC(9,6),
    lng NUMERIC(9,6),
    phone TEXT,
    opening_hours JSONB,
    homepage_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- 2-4) store_categories
CREATE TABLE IF NOT EXISTS public.store_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================
-- 4. Products & Table Ordering (Prerequisite for Orders)
-- =========================================================

-- 4-1) products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id),
    name TEXT NOT NULL,
    description TEXT,
    base_price NUMERIC NOT NULL DEFAULT 0,
    product_type public.product_type DEFAULT 'menu',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 4-2) product_media
CREATE TABLE IF NOT EXISTS public.product_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    media_asset_id UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5-1) store_tables
CREATE TABLE IF NOT EXISTS public.store_tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "Table 1"
    zone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5-2) table_qr_codes
CREATE TABLE IF NOT EXISTS public.table_qr_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_table_id UUID NOT NULL REFERENCES public.store_tables(id) ON DELETE CASCADE,
    qr_code_path TEXT,
    deep_link_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================
-- 5. Coupons, Events, Customer DB
-- =========================================================

-- 3-1) coupons
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    discount_type public.discount_type NOT NULL,
    discount_value NUMERIC NOT NULL,
    max_discount_amount NUMERIC,
    min_order_amount NUMERIC,
    category_id UUID REFERENCES public.categories(id),
    product_id UUID REFERENCES public.products(id),
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_to TIMESTAMP WITH TIME ZONE,
    total_issuable INTEGER,
    per_user_limit INTEGER,
    radius_km NUMERIC,
    center_type public.coupon_center_type DEFAULT 'store',
    center_lat NUMERIC(9,6),
    center_lng NUMERIC(9,6),
    image_asset_id UUID REFERENCES public.media_assets(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 3-2) coupon_issues (Pre-declaration, references orders which is created later? No, usually circular. 
-- We will create coupon_issues first with nullable used_order_id)
CREATE TABLE IF NOT EXISTS public.coupon_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    phone TEXT,
    issued_from public.issue_origin NOT NULL DEFAULT 'event',
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_order_id UUID, -- FK will be added after orders table
    used_at TIMESTAMP WITH TIME ZONE,
    is_used BOOLEAN DEFAULT false,
    upgraded_from_issue_id UUID REFERENCES public.coupon_issues(id), -- Self reference
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.coupon_issues ENABLE ROW LEVEL SECURITY;

-- 3-3) events
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES public.merchants(id),
    store_id UUID REFERENCES public.stores(id),
    category_id UUID REFERENCES public.categories(id),
    name TEXT NOT NULL,
    description TEXT,
    event_type public.event_type NOT NULL DEFAULT 'store',
    start_at TIMESTAMP WITH TIME ZONE,
    end_at TIMESTAMP WITH TIME ZONE,
    radius_km NUMERIC,
    center_lat NUMERIC(9,6),
    center_lng NUMERIC(9,6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3-4) event_participations
CREATE TABLE IF NOT EXISTS public.event_participations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    phone TEXT,
    current_step SMALLINT DEFAULT 0,
    is_success BOOLEAN DEFAULT false,
    success_issue_id UUID REFERENCES public.coupon_issues(id),
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3-5) merchant_customers
CREATE TABLE IF NOT EXISTS public.merchant_customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    phone TEXT,
    first_visit_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_visit_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    visit_count INTEGER DEFAULT 0,
    coupon_issue_count INTEGER DEFAULT 0,
    total_spent NUMERIC DEFAULT 0,
    first_visit_discount_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.merchant_customers ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- 6. Orders & Payments
-- =========================================================

-- 4-3) orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),
    phone TEXT,
    store_id UUID NOT NULL REFERENCES public.stores(id),
    order_type public.order_type NOT NULL DEFAULT 'table_order',
    table_id UUID REFERENCES public.store_tables(id),
    status public.order_status NOT NULL DEFAULT 'pending',
    total_amount NUMERIC NOT NULL DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    final_amount NUMERIC NOT NULL DEFAULT 0,
    used_coupon_issue_id UUID REFERENCES public.coupon_issues(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Add circular FK to coupon_issues
DO $$ BEGIN
    ALTER TABLE public.coupon_issues 
    ADD CONSTRAINT fk_coupon_issues_order 
    FOREIGN KEY (used_order_id) REFERENCES public.orders(id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4-4) order_items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL,
    discount_amount NUMERIC DEFAULT 0,
    final_price NUMERIC NOT NULL,
    meta JSONB, -- options selected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4-5) payments
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    method public.payment_method NOT NULL DEFAULT 'card',
    status public.payment_status NOT NULL DEFAULT 'pending',
    transaction_id TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================
-- 7. Cultural Events (Tickets)
-- =========================================================

-- 6-1) cultural_events
CREATE TABLE IF NOT EXISTS public.cultural_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id),
    store_id UUID NOT NULL REFERENCES public.stores(id),
    category_id UUID REFERENCES public.categories(id),
    title TEXT NOT NULL,
    description TEXT,
    age_limit SMALLINT,
    homepage_url TEXT,
    poster_asset_id UUID REFERENCES public.media_assets(id),
    teaser_asset_id UUID REFERENCES public.media_assets(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6-2) event_showtimes
CREATE TABLE IF NOT EXISTS public.event_showtimes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cultural_event_id UUID NOT NULL REFERENCES public.cultural_events(id) ON DELETE CASCADE,
    start_at TIMESTAMP WITH TIME ZONE NOT NULL,
    end_at TIMESTAMP WITH TIME ZONE,
    total_seats INTEGER,
    available_seats INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6-3) event_seat_maps
CREATE TABLE IF NOT EXISTS public.event_seat_maps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    layout_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6-4) event_seats
CREATE TABLE IF NOT EXISTS public.event_seats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_showtime_id UUID NOT NULL REFERENCES public.event_showtimes(id) ON DELETE CASCADE,
    seat_map_id UUID REFERENCES public.event_seat_maps(id),
    section TEXT,
    row TEXT,
    seat_number TEXT,
    seat_label TEXT,
    grade TEXT, -- VIP/R/S
    base_price NUMERIC,
    status public.seat_status DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6-5) tickets
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    event_showtime_id UUID NOT NULL REFERENCES public.event_showtimes(id),
    event_seat_id UUID REFERENCES public.event_seats(id),
    user_id UUID REFERENCES public.users(id),
    phone TEXT,
    qr_code TEXT,
    status public.ticket_status DEFAULT 'valid',
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================
-- 8. Final Touches (Triggers)
-- =========================================================

-- Auto-update updated_at timestamp helper
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at (Looping dynamically is hard in migration, manual listing)
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.columns WHERE column_name = 'updated_at' AND table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', t);
        EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at()', t);
    END LOOP;
END $$;

