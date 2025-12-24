
-- Update Merchant Customers Table Schema (Step 9)
-- Check if table exists, if not create

CREATE TABLE IF NOT EXISTS public.merchant_customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    consumer_id UUID NOT NULL, -- Link to users table but keeping loose for MVP if needed
    visit_count INTEGER DEFAULT 1,
    total_spend NUMERIC DEFAULT 0,
    first_visit_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_visit_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source TEXT, -- 'GAME', 'ORDER', 'TICKET'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_merchant_customers_lookup ON public.merchant_customers(merchant_id, consumer_id);

-- RLS
ALTER TABLE public.merchant_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view their own customers" ON public.merchant_customers
  FOR ALL USING (merchant_id IN (SELECT id FROM merchants WHERE owner_user_id = auth.uid()));

