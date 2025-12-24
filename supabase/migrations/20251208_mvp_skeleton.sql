-- AIRCTT MVP Schema Skeleton (v1)
-- Prepared by: Antigravity (Enti) & Army
-- Date: 2025-12-08
-- Description: Core heart structure for AIRCTT (Users, Wallets, Merchants, Coupons, Games)
-- Optimized for Supabase (Auth Integration, RLS, Triggers)

-- =========================================================
-- 0. Utilities & Setup
-- =========================================================

-- Function to update 'updated_at' automatically
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- =========================================================
-- 1. Users & Roles (Authentication & Authorization)
-- =========================================================

-- Users: Links to Supabase Auth (auth.users)
-- Note: 'password_hash' removed as Supabase Auth handles security. 'id' references auth.users.
CREATE TABLE public.users (
  id               uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email            text UNIQUE NOT NULL, -- Synced from auth.users
  phone            text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  last_login_at    timestamptz,
  status           text NOT NULL DEFAULT 'active' -- active / suspended / deleted
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Auto-create public.user profile when Supabase Auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- User Roles
CREATE TABLE public.user_roles (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role       text NOT NULL, -- consumer / merchant_owner / merchant_staff / admin / org_operator
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

-- Consumers: User Profile Extension
CREATE TABLE public.consumers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  nickname      text,
  region        text,
  need_level    integer NOT NULL DEFAULT 0,
  trust_score   integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.consumers ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_consumers_user_id ON public.consumers(user_id);
CREATE INDEX idx_consumers_region ON public.consumers(region);

-- =========================================================
-- 2. Wallets (Economy Core)
-- =========================================================

-- Wallets
CREATE TABLE public.wallets (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id           uuid NOT NULL REFERENCES public.consumers(id) ON DELETE CASCADE,
  total_points          integer NOT NULL DEFAULT 0,
  total_coupon_count    integer NOT NULL DEFAULT 0,
  cloud_ticket_count    integer NOT NULL DEFAULT 0,
  updated_at            timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX idx_wallets_consumer_id ON public.wallets(consumer_id);
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Wallet Transactions
CREATE TABLE public.wallet_transactions (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id                uuid NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  tx_type                  text NOT NULL,
  amount_points            integer NOT NULL DEFAULT 0,
  amount_cloud_tickets     integer NOT NULL DEFAULT 0,
  related_coupon_issue_id  uuid, -- FK added later if needed
  related_game_session_id  uuid, -- FK added later if needed
  note                     text,
  created_at               timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_wallet_tx_wallet_id ON public.wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_tx_type ON public.wallet_transactions(tx_type);
CREATE INDEX idx_wallet_tx_created_at ON public.wallet_transactions(created_at);

-- =========================================================
-- 3. Merchants & Stores (Supply Side)
-- =========================================================

-- Merchants
CREATE TABLE public.merchants (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id   uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  name            text NOT NULL,
  business_no     text,
  category        text,
  region          text,
  contact_email   text,
  contact_phone   text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  status          text NOT NULL DEFAULT 'active'
);
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_merchants_owner_user_id ON public.merchants(owner_user_id);
CREATE INDEX idx_merchants_region ON public.merchants(region);

-- Stores
CREATE TABLE public.stores (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  name        text NOT NULL,
  address     text,
  lat         numeric,
  lng         numeric,
  open_hours  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  status      text NOT NULL DEFAULT 'active'
);
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_stores_merchant_id ON public.stores(merchant_id);
CREATE INDEX idx_stores_region_partial ON public.stores(address);

-- =========================================================
-- 4. Coupons (Value Unit)
-- =========================================================

-- Coupons (Templates)
CREATE TABLE public.coupons (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id      uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  store_id         uuid REFERENCES public.stores(id) ON DELETE SET NULL,
  title            text NOT NULL,
  description      text,
  discount_type    text NOT NULL,
  discount_value   numeric NOT NULL,
  stock_initial    integer NOT NULL DEFAULT 0,
  stock_remaining  integer NOT NULL DEFAULT 0,
  valid_from       timestamptz,
  valid_until      timestamptz,
  target_group     text NOT NULL DEFAULT 'ANY',
  created_at       timestamptz NOT NULL DEFAULT now(),
  status           text NOT NULL DEFAULT 'active'
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_coupons_merchant_id ON public.coupons(merchant_id);
CREATE INDEX idx_coupons_store_id ON public.coupons(store_id);
CREATE INDEX idx_coupons_valid_until ON public.coupons(valid_until);
CREATE INDEX idx_coupons_status ON public.coupons(status);

-- Coupon Issues (Instances)
CREATE TABLE public.coupon_issues (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id      uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  consumer_id    uuid NOT NULL REFERENCES public.consumers(id) ON DELETE CASCADE,
  issued_at      timestamptz NOT NULL DEFAULT now(),
  issued_reason  text NOT NULL,
  code           text UNIQUE,
  status         text NOT NULL DEFAULT 'ISSUED',
  used_at        timestamptz,
  used_store_id  uuid REFERENCES public.stores(id) ON DELETE SET NULL
);
ALTER TABLE public.coupon_issues ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_coupon_issues_coupon_id ON public.coupon_issues(coupon_id);
CREATE INDEX idx_coupon_issues_consumer_id ON public.coupon_issues(consumer_id);
CREATE INDEX idx_coupon_issues_status ON public.coupon_issues(status);

-- =========================================================
-- 5. Game Sessions (Engagement)
-- =========================================================

-- Game Sessions
CREATE TABLE public.game_sessions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id    uuid NOT NULL REFERENCES public.consumers(id) ON DELETE CASCADE,
  game_type      text NOT NULL,
  started_at     timestamptz NOT NULL DEFAULT now(),
  finished_at    timestamptz,
  steps_cleared  integer NOT NULL DEFAULT 0,
  success        boolean NOT NULL DEFAULT false,
  client_info    jsonb
);
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_game_sessions_consumer_id ON public.game_sessions(consumer_id);
CREATE INDEX idx_game_sessions_game_type ON public.game_sessions(game_type);

-- Game Rewards
CREATE TABLE public.game_rewards (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_session_id         uuid NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  reward_type             text NOT NULL,
  reward_value            integer,
  created_coupon_issue_id uuid,
  created_wallet_tx_id    uuid,
  created_at              timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.game_rewards ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_game_rewards_session_id ON public.game_rewards(game_session_id);

-- =========================================================
-- 6. Basic RLS Policies (Examples)
-- =========================================================

-- Public Read for Coupons (Catalog)
CREATE POLICY "Public coupons are viewable by everyone" ON public.coupons FOR SELECT USING (true);

-- Users can see their own data
CREATE POLICY "Users view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Consumers can see their own wallet
CREATE POLICY "Consumers view own wallet" ON public.wallets 
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.consumers WHERE id = consumer_id));

-- ... (Additional detailed policies can be added as needed)
