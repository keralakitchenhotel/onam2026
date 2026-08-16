-- =====================================================================
-- KERALA KITCHEN ONAM SADYA - COMPLETE DATABASE SCHEMA & RLS POLICIES
-- PostgreSQL schema for Supabase Auth, Guest Bookings, Location & Delivery
--
-- Tables: profiles, bookings, saved_addresses, menu_items, coupons,
--         reviews, delivery_slots
-- Includes: indexes, triggers, seed data, RLS policies, Data API grants
--
-- This file mirrors the migrations applied to the hosted database
-- (project ref: mntdrrliioxetmkhtjmx). Run it with:
--   npm run db:setup   (requires DATABASE_URL in .env.local)
-- =====================================================================

-- 1. EXTENSIONS --------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. UPDATED_AT TRIGGER HELPER -----------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 3. PROFILES -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'staff', 'driver')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. BOOKINGS / ORDERS ---------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  booking_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_guest BOOLEAN NOT NULL DEFAULT TRUE,
  guest_name TEXT,
  guest_phone TEXT,
  guest_email TEXT,

  -- Sadya & Items
  fulfillment TEXT NOT NULL CHECK (fulfillment IN ('pickup', 'delivery')),
  booking_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  sadya_item_id TEXT NOT NULL,
  adults_count INTEGER NOT NULL DEFAULT 1,
  children_count INTEGER NOT NULL DEFAULT 0,
  extras_json JSONB DEFAULT '[]'::jsonb,

  -- Delivery & Location details
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location_accuracy DOUBLE PRECISION,
  delivery_address TEXT,
  landmark TEXT,
  pincode TEXT,
  delivery_instructions TEXT,
  delivery_otp VARCHAR(6),

  -- Financials & Status
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  delivery_charge NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  coupon_code TEXT,
  payment_method TEXT NOT NULL DEFAULT 'upi' CHECK (payment_method IN ('upi', 'card', 'netbanking', 'wallet', 'cash')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  order_status TEXT NOT NULL DEFAULT 'Booked' CHECK (order_status IN ('Booked', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled')),

  qr_code_url TEXT,
  token_number TEXT,
  estimated_wait_minutes INTEGER,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS bookings_set_updated_at ON public.bookings;
CREATE TRIGGER bookings_set_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. SAVED ADDRESSES -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL CHECK (label IN ('Home', 'Work', 'Other')),
  address TEXT NOT NULL,
  landmark TEXT,
  pincode TEXT,
  delivery_instructions TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS saved_addresses_set_updated_at ON public.saved_addresses;
CREATE TRIGGER saved_addresses_set_updated_at
  BEFORE UPDATE ON public.saved_addresses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. MENU ITEMS ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  malayalam_name TEXT,
  category TEXT NOT NULL CHECK (category IN ('Sadya Packages', 'Payasam', 'Savories & Chips', 'Extras & Curries', 'Corporate Bulk')),
  price NUMERIC(10, 2) NOT NULL,
  description TEXT,
  items_included JSONB DEFAULT '[]'::jsonb,
  item_count INTEGER,
  image_url TEXT,
  is_veg BOOLEAN NOT NULL DEFAULT TRUE,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  is_popular BOOLEAN NOT NULL DEFAULT FALSE,
  serving_pax TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS menu_items_set_updated_at ON public.menu_items;
CREATE TRIGGER menu_items_set_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7. COUPONS -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
  discount_value NUMERIC(10, 2) NOT NULL,
  min_order_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
  expiry_date DATE NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS coupons_set_updated_at ON public.coupons;
CREATE TRIGGER coupons_set_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 8. REVIEWS -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id TEXT REFERENCES public.bookings(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  location TEXT,
  avatar_url TEXT,
  verified_booking BOOLEAN NOT NULL DEFAULT FALSE,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. DELIVERY SLOTS ------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.delivery_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  time TEXT UNIQUE NOT NULL,
  max_orders INTEGER NOT NULL DEFAULT 50,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS delivery_slots_set_updated_at ON public.delivery_slots;
CREATE TRIGGER delivery_slots_set_updated_at
  BEFORE UPDATE ON public.delivery_slots
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 10. PRIVATE SCHEMA: STAFF/ADMIN CHECK HELPER ----------------------------
-- SECURITY DEFINER so RLS policies can check the caller's role without
-- recursive RLS. Lives in the non-exposed `private` schema so it cannot
-- be called via /rest/v1/rpc. Returns a boolean only (no data exposed).
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.is_admin_or_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  )
  OR COALESCE((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'staff'), FALSE);
$$;

-- RLS policy expressions are evaluated with the caller's privileges,
-- so anon/authenticated still need EXECUTE.
GRANT EXECUTE ON FUNCTION private.is_admin_or_staff() TO anon, authenticated;

-- 11. INDEXES FOR PERFORMANCE --------------------------------------------
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_phone ON public.bookings(guest_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_order_status ON public.bookings(order_status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_saved_addresses_user_id ON public.saved_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON public.menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON public.reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON public.reviews(booking_id);

-- 12. AUTO PROFILE CREATION ON AUTH SIGNUP --------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, auth_user_id, full_name, email, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Customer'),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    'customer'
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      avatar_url = EXCLUDED.avatar_url,
      updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger-only function: deny direct RPC invocation.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12b. ROLE ESCALATION GUARD -----------------------------------------------
-- Non staff/admin users cannot change their own role or auth_user_id,
-- even through the owner UPDATE policy (the trigger reverts the change).
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT private.is_admin_or_staff() THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      NEW.role := OLD.role;
    END IF;
    IF NEW.auth_user_id IS DISTINCT FROM OLD.auth_user_id THEN
      NEW.auth_user_id := OLD.auth_user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.prevent_role_escalation() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS prevent_role_escalation ON public.profiles;
CREATE TRIGGER prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();

-- 13. ROW LEVEL SECURITY (RLS) --------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_slots ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Profiles are viewable by owner or staff/admin" ON public.profiles;
CREATE POLICY "Profiles are viewable by owner or staff/admin"
  ON public.profiles FOR SELECT
  USING ((select auth.uid()) = id OR (SELECT private.is_admin_or_staff()));

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK ((select auth.uid()) = id AND role = 'customer');

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Saved Addresses Policies (owner only)
DROP POLICY IF EXISTS "Users can view their own saved addresses" ON public.saved_addresses;
CREATE POLICY "Users can view their own saved addresses"
  ON public.saved_addresses FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own saved addresses" ON public.saved_addresses;
CREATE POLICY "Users can insert their own saved addresses"
  ON public.saved_addresses FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own saved addresses" ON public.saved_addresses;
CREATE POLICY "Users can update their own saved addresses"
  ON public.saved_addresses FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own saved addresses" ON public.saved_addresses;
CREATE POLICY "Users can delete their own saved addresses"
  ON public.saved_addresses FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Bookings Policies
-- NOTE: Guest checkout + staff/admin/driver dashboards operate through the
-- anon client (all staff roles now sign in via Supabase Auth, but guest
-- checkout remains anonymous), so bookings stay readable/writable by all
-- roles in this demo build. Hardening: restrict SELECT/UPDATE/DELETE to
-- owners + private.is_admin_or_staff() when guest checkout is dropped.
DROP POLICY IF EXISTS "Bookings are viewable by all" ON public.bookings;
CREATE POLICY "Bookings are viewable by all"
  ON public.bookings FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Anyone can insert a booking" ON public.bookings;
CREATE POLICY "Anyone can insert a booking"
  ON public.bookings FOR INSERT
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Anyone can update a booking" ON public.bookings;
CREATE POLICY "Anyone can update a booking"
  ON public.bookings FOR UPDATE
  USING (TRUE)
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Staff and admins can delete bookings" ON public.bookings;
CREATE POLICY "Staff and admins can delete bookings"
  ON public.bookings FOR DELETE
  USING ((SELECT private.is_admin_or_staff()));

-- Menu Items Policies (public catalog, staff/admin write)
DROP POLICY IF EXISTS "Menu items are viewable by all" ON public.menu_items;
CREATE POLICY "Menu items are viewable by all"
  ON public.menu_items FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Staff and admins can modify menu items" ON public.menu_items;
CREATE POLICY "Staff and admins can modify menu items"
  ON public.menu_items FOR INSERT
  WITH CHECK ((SELECT private.is_admin_or_staff()));

DROP POLICY IF EXISTS "Staff and admins can update menu items" ON public.menu_items;
CREATE POLICY "Staff and admins can update menu items"
  ON public.menu_items FOR UPDATE
  USING ((SELECT private.is_admin_or_staff()))
  WITH CHECK ((SELECT private.is_admin_or_staff()));

DROP POLICY IF EXISTS "Staff and admins can delete menu items" ON public.menu_items;
CREATE POLICY "Staff and admins can delete menu items"
  ON public.menu_items FOR DELETE
  USING ((SELECT private.is_admin_or_staff()));

-- Coupons Policies (public read of active coupons, staff/admin write)
DROP POLICY IF EXISTS "Active coupons are viewable by all" ON public.coupons;
CREATE POLICY "Active coupons are viewable by all"
  ON public.coupons FOR SELECT
  USING (is_active = TRUE OR (SELECT private.is_admin_or_staff()));

DROP POLICY IF EXISTS "Staff and admins can modify coupons" ON public.coupons;
CREATE POLICY "Staff and admins can modify coupons"
  ON public.coupons FOR INSERT
  WITH CHECK ((SELECT private.is_admin_or_staff()));

DROP POLICY IF EXISTS "Staff and admins can update coupons" ON public.coupons;
CREATE POLICY "Staff and admins can update coupons"
  ON public.coupons FOR UPDATE
  USING ((SELECT private.is_admin_or_staff()))
  WITH CHECK ((SELECT private.is_admin_or_staff()));

DROP POLICY IF EXISTS "Staff and admins can delete coupons" ON public.coupons;
CREATE POLICY "Staff and admins can delete coupons"
  ON public.coupons FOR DELETE
  USING ((SELECT private.is_admin_or_staff()));

-- Reviews Policies (approved reviews public; guests can submit)
DROP POLICY IF EXISTS "Approved reviews are viewable by all" ON public.reviews;
CREATE POLICY "Approved reviews are viewable by all"
  ON public.reviews FOR SELECT
  USING (is_approved = TRUE OR (SELECT private.is_admin_or_staff()));

DROP POLICY IF EXISTS "Anyone can submit a review" ON public.reviews;
CREATE POLICY "Anyone can submit a review"
  ON public.reviews FOR INSERT
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Staff and admins can update reviews" ON public.reviews;
CREATE POLICY "Staff and admins can update reviews"
  ON public.reviews FOR UPDATE
  USING ((SELECT private.is_admin_or_staff()))
  WITH CHECK ((SELECT private.is_admin_or_staff()));

DROP POLICY IF EXISTS "Staff and admins can delete reviews" ON public.reviews;
CREATE POLICY "Staff and admins can delete reviews"
  ON public.reviews FOR DELETE
  USING ((SELECT private.is_admin_or_staff()));

-- Delivery Slots Policies (public read, staff/admin write)
DROP POLICY IF EXISTS "Delivery slots are viewable by all" ON public.delivery_slots;
CREATE POLICY "Delivery slots are viewable by all"
  ON public.delivery_slots FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Staff and admins can modify delivery slots" ON public.delivery_slots;
CREATE POLICY "Staff and admins can modify delivery slots"
  ON public.delivery_slots FOR INSERT
  WITH CHECK ((SELECT private.is_admin_or_staff()));

DROP POLICY IF EXISTS "Staff and admins can update delivery slots" ON public.delivery_slots;
CREATE POLICY "Staff and admins can update delivery slots"
  ON public.delivery_slots FOR UPDATE
  USING ((SELECT private.is_admin_or_staff()))
  WITH CHECK ((SELECT private.is_admin_or_staff()));

DROP POLICY IF EXISTS "Staff and admins can delete delivery slots" ON public.delivery_slots;
CREATE POLICY "Staff and admins can delete delivery slots"
  ON public.delivery_slots FOR DELETE
  USING ((SELECT private.is_admin_or_staff()));

-- 14. REALTIME (live order tracking) --------------------------------------
-- The app subscribes to postgres_changes on public.bookings.
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

-- 15. DATA API ACCESS (new tables are NOT auto-exposed since 2026-04) -----
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_addresses TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_items TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.delivery_slots TO anon, authenticated;

-- 16. SEED DATA -----------------------------------------------------------

-- Menu: Grand Onam Sadya (Dine-in) with all 23 delicacies
INSERT INTO public.menu_items
  (id, name, malayalam_name, category, price, description, items_included, item_count, image_url, is_veg, is_available, is_popular, serving_pax)
SELECT
  'sadya-regular',
  'Grand Onam Sadya (Dine-in)',
  'ഓണ സദ്യ (ഡൈനിംഗ്)',
  'Sadya Packages',
  220,
  'Authentic 23-item Kerala Onam Sadya served fresh on cut banana leaf at Kerala Kitchen, Valiyaparambu.',
  jsonb_agg(idx || '. ' || ml || ' (' || en || ')' ORDER BY idx),
  23,
  'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&q=80&w=1000',
  TRUE, TRUE, TRUE, '1 Person'
FROM (VALUES
  (1, 'സാമ്പാർ', 'Sambar'),
  (2, 'അവിയൽ', 'Avial'),
  (3, 'പൈനാപ്പിൾ പച്ചടി', 'Pineapple Pachadi'),
  (4, 'കിച്ചടി', 'Kichadi'),
  (5, 'ബീറ്റ്‌റൂട്ട് പച്ചടി', 'Beetroot Pachadi'),
  (6, 'പരിപ്പ് കറി', 'Parippu Curry'),
  (7, 'മോര് കറി', 'Mor Curry'),
  (8, 'പുളിഞ്ചി', 'Puli Inji'),
  (9, 'കായ വറുത്തത്', 'Kaya Varuthathu (Banana Chips)'),
  (10, 'ശർക്കര വരട്ടി', 'Sharkara Varatti'),
  (11, 'ഉപ്പ്', 'Uppu (Salt)'),
  (12, 'ഇല', 'Ela (Banana Leaf)'),
  (13, 'പായസം അട', 'Ada Payasam'),
  (14, 'തോരൻ', 'Thoran'),
  (15, 'ഓലൻ', 'Olan'),
  (16, 'കാളൻ', 'Kalan'),
  (17, 'പപ്പടം', 'Pappadam'),
  (18, 'മാങ്ങാ അച്ചാർ', 'Manga Achar (Mango Pickle)'),
  (19, 'പഴം', 'Pazham (Banana)'),
  (20, 'രസം', 'Rasam'),
  (21, 'ചോറ്', 'Choru (Rice)'),
  (22, 'പച്ചടി', 'Pachadi'),
  (23, 'കൂട്ടു കറി', 'Kootu Curry')
) AS t(idx, ml, en)
ON CONFLICT (id) DO NOTHING;

-- Menu: Family Sadya Pack (5 Pax)
INSERT INTO public.menu_items
  (id, name, malayalam_name, category, price, description, items_included, item_count, image_url, is_veg, is_available, is_popular, serving_pax)
VALUES (
  'sadya-family-5',
  'Family Sadya Pack (5 Pax)',
  'ഫാമിലി പാക്ക് (5 പേർക്ക്)',
  'Sadya Packages',
  1300,
  'Complete Onam Sadya feast for 5 persons. Includes 5 fresh plantain leaves and packed 23 delicacies.',
  '["All 23 Poster Delicacies for 5 Persons", "5 Cut Plantain Leaves", "Ada Payasam Portion", "Banana Chips & Sharkara Varatti"]'::jsonb,
  23,
  'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=1000',
  TRUE, TRUE, TRUE, '5 Persons'
)
ON CONFLICT (id) DO NOTHING;

-- Coupon: ONAM2026
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_value, expiry_date, description, is_active)
VALUES (
  'ONAM2026',
  'percentage',
  10,
  150,
  '2026-08-29',
  'Get 10% OFF on all Onam Sadya pre-bookings at Kerala Kitchen!',
  TRUE
)
ON CONFLICT (code) DO NOTHING;

-- Delivery Slots
INSERT INTO public.delivery_slots (time, max_orders, is_active) VALUES
  ('11:00 AM', 50, TRUE),
  ('12:00 PM', 60, TRUE),
  ('01:00 PM', 60, TRUE),
  ('02:00 PM', 40, TRUE),
  ('07:00 PM', 40, TRUE)
ON CONFLICT (time) DO NOTHING;

-- 17. DEMO ACCOUNTS (Supabase Auth) -----------------------------------------
-- Demo accounts displayed on the login forms. Emails are pre-confirmed and
-- passwords hashed with bcrypt cost 10 (GoTrue's minimum — cost-6 hashes
-- from gen_salt('bf') default are REJECTED at login with HTTP 500).
-- Rows replicate GoTrue's own signup output: token columns are '' (NOT NULL),
-- an auth.identities row exists per user, and 'confirmed_at' / identities.email
-- are generated columns and must NOT be inserted explicitly.
-- Role is stored in BOTH raw_app_meta_data (JWT app_metadata, RLS fallback)
-- and public.profiles (source of truth for the app).
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
  reauthentication_token, phone_change_token, phone_change, email_change_confirm_status,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous
)
SELECT gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  t.email, crypt(t.password, gen_salt('bf', 10)), NOW(),
  '', '', '', '', '', '', '', 0,
  jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email'), 'role', t.role),
  jsonb_build_object('name', t.full_name),
  NOW(), NOW(), FALSE, FALSE
FROM (VALUES
  ('admin@keralakitchen.com',    'admin@7736',    'Restaurant Admin', 'admin'),
  ('staff@keralakitchen.com',    'staff@7736',    'Kitchen Staff',    'staff'),
  ('driver@keralakitchen.com',   'driver@7736',   'Delivery Driver',  'driver'),
  ('customer@keralakitchen.com', 'customer@123',  'Onam Customer',    'customer')
) AS t(email, password, full_name, role)
ON CONFLICT DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider, provider_id, identity_data, last_sign_in_at, created_at, updated_at)
SELECT gen_random_uuid(), u.id, 'email', u.id::text,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', false, 'phone_verified', false),
  NOW(), NOW(), NOW()
FROM auth.users u
WHERE u.email IN ('admin@keralakitchen.com', 'staff@keralakitchen.com', 'driver@keralakitchen.com', 'customer@keralakitchen.com')
ON CONFLICT DO NOTHING;

-- Promote seeded profiles to their seeded roles (trigger creates them as 'customer').
-- The escalation guard would otherwise revert this maintenance update, so it is
-- temporarily disabled (requires superuser; apply_migration / psql as postgres).
ALTER TABLE public.profiles DISABLE TRIGGER prevent_role_escalation;

UPDATE public.profiles p
SET role = u.raw_app_meta_data ->> 'role',
    full_name = COALESCE(NULLIF(u.raw_user_meta_data ->> 'name', ''), 'Customer')
FROM auth.users u
WHERE u.id = p.id
  AND u.email IN ('admin@keralakitchen.com', 'staff@keralakitchen.com', 'driver@keralakitchen.com', 'customer@keralakitchen.com');

ALTER TABLE public.profiles ENABLE TRIGGER prevent_role_escalation;