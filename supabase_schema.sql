-- ============================================================
-- FABSTORY BY FASNA — SUPABASE DATABASE SCHEMA
-- Execute this SQL script in your Supabase SQL Editor:
-- https://cwrcmppwattowaxcjkdf.supabase.co / SQL Editor
-- ============================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    display_order INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    compare_at_price NUMERIC(10, 2),
    type TEXT NOT NULL DEFAULT 'CUSTOM', -- 'CUSTOM', 'READY_STOCK', 'FABRIC'
    status TEXT NOT NULL DEFAULT 'PUBLISHED', -- 'PUBLISHED', 'DRAFT'
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    images JSONB DEFAULT '[]'::jsonb,
    sizes JSONB DEFAULT '["S", "M", "L", "XL", "Custom"]'::jsonb,
    fabrics JSONB DEFAULT '[]'::jsonb,
    is_featured BOOLEAN DEFAULT FALSE,
    stock INT DEFAULT 50,
    care_instructions TEXT,
    estimated_delivery TEXT DEFAULT '7-10 business days',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Fabrics Table
CREATE TABLE IF NOT EXISTS public.fabrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price_per_meter NUMERIC(10, 2) NOT NULL,
    material TEXT NOT NULL,
    color TEXT,
    color_hex TEXT,
    stock INT DEFAULT 100,
    images JSONB DEFAULT '[]'::jsonb,
    care_instructions TEXT,
    status TEXT NOT NULL DEFAULT 'PUBLISHED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    shipping_address JSONB NOT NULL,
    items JSONB NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'
    payment_status TEXT NOT NULL DEFAULT 'UNPAID', -- 'UNPAID', 'PAID', 'REFUNDED'
    payment_method TEXT DEFAULT 'Razorpay',
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Custom Design Requests Table
CREATE TABLE IF NOT EXISTS public.custom_design_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    outfit_type TEXT NOT NULL,
    fabric_preference TEXT,
    measurements JSONB DEFAULT '{}'::jsonb,
    reference_images JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'QUOTED', 'APPROVED', 'IN_PRODUCTION', 'COMPLETED'
    estimated_price NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS & Public Access Policies for Client Direct Fetching
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fabrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_design_requests ENABLE ROW LEVEL SECURITY;

-- Allow Public Read Access
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public read fabrics" ON public.fabrics FOR SELECT USING (true);

-- Allow Public Insert for Orders & Custom Requests
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert custom requests" ON public.custom_design_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read custom requests" ON public.custom_design_requests FOR SELECT USING (true);

-- Allow Public Insert/Update for Admin Management
CREATE POLICY "Allow admin write categories" ON public.categories FOR ALL USING (true);
CREATE POLICY "Allow admin write products" ON public.products FOR ALL USING (true);
CREATE POLICY "Allow admin write fabrics" ON public.fabrics FOR ALL USING (true);
CREATE POLICY "Allow admin write orders" ON public.orders FOR ALL USING (true);
CREATE POLICY "Allow admin write custom requests" ON public.custom_design_requests FOR ALL USING (true);

-- Storage Bucket Setup for Product & Reference Image Uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('fabstory-assets', 'fabstory-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public storage upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'fabstory-assets');
CREATE POLICY "Allow public storage select" ON storage.objects FOR SELECT USING (bucket_id = 'fabstory-assets');
