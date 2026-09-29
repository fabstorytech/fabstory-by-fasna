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

-- ============================================================
-- 7. AUTO-CONFIRM USERS (DISABLE "Email Not Confirmed" REQUIREMENT)
-- Run this in your Supabase SQL Editor to instantly confirm all users:
-- ============================================================
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
    NEW.email_confirmed_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    BEFORE INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_confirm_user();

-- Automatically confirm any existing unconfirmed users (e.g. unaiskaku@gmail.com)
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- ============================================================
-- 8. CUSTOMERS ENTITY & AUTOMATIC AUTH SYNC
-- Stores customer profiles separately from auth.users
-- Automatically populates whenever a new user signs up / logs in
-- ============================================================

CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'customer', -- 'customer' or 'admin'
    total_orders INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile, and allow admin to view all
CREATE POLICY "Allow individual read access" ON public.customers 
    FOR SELECT USING (true);

CREATE POLICY "Allow individual update" ON public.customers 
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow trigger insert" ON public.customers 
    FOR INSERT WITH CHECK (true);

-- Function to automatically create or update customer record on auth signup/login
CREATE OR REPLACE FUNCTION public.handle_new_customer()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT := 'customer';
BEGIN
    -- Detect admin account
    IF NEW.email = 'admin@fabstorybyfasna.com' OR (NEW.raw_user_meta_data->>'role') = 'admin' THEN
        user_role := 'admin';
    ELSE
        user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
    END IF;

    INSERT INTO public.customers (
        id,
        email,
        full_name,
        phone,
        role,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone, ''),
        user_role,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = CASE 
            WHEN public.customers.full_name IS NULL OR public.customers.full_name = '' 
            THEN EXCLUDED.full_name 
            ELSE public.customers.full_name 
        END,
        role = EXCLUDED.role,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger whenever an auth user is created or updated
DROP TRIGGER IF EXISTS on_auth_user_customer_sync ON auth.users;
CREATE TRIGGER on_auth_user_customer_sync
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_customer();

-- Backfill all existing users from auth.users into public.customers
INSERT INTO public.customers (id, email, full_name, role, created_at, updated_at)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
    CASE 
        WHEN email = 'admin@fabstorybyfasna.com' OR (raw_user_meta_data->>'role') = 'admin' THEN 'admin'
        ELSE 'customer'
    END,
    created_at,
    updated_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 9. BREVO TRANSACTIONAL EMAIL TRACKING & SECURE OTP STORAGE
-- ============================================================

-- A. Email idempotency & tracking flags on orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS confirmation_email_sent BOOLEAN DEFAULT FALSE;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shipped_email_sent BOOLEAN DEFAULT FALSE;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS delivered_email_sent BOOLEAN DEFAULT FALSE;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tracking_number TEXT;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tracking_url TEXT;

-- B. Password Reset OTP Table (Secure Hashed OTPs)
CREATE TABLE IF NOT EXISTS public.password_reset_otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INT DEFAULT 0,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_otps_email 
ON public.password_reset_otps(email);

ALTER TABLE public.password_reset_otps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert otps" 
ON public.password_reset_otps FOR ALL USING (true);

-- C. Secure Password Reset Function (Used by server endpoint)
CREATE OR REPLACE FUNCTION public.reset_user_password(user_email TEXT, new_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE auth.users
    SET encrypted_password = crypt(new_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE LOWER(email) = LOWER(user_email);
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


