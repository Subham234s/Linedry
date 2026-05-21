-- Create the saved_payment_methods table
CREATE TABLE IF NOT EXISTS public.saved_payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method_type TEXT NOT NULL CHECK (method_type IN ('UPI', 'Card', 'Wallet')),
  provider_name TEXT NOT NULL,
  masked_detail TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_saved_payment_methods_user_id 
  ON public.saved_payment_methods(user_id);

-- Enable RLS
ALTER TABLE public.saved_payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only manage their own payment methods
CREATE POLICY "Users can view own payment methods"
  ON public.saved_payment_methods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment methods"
  ON public.saved_payment_methods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment methods"
  ON public.saved_payment_methods FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment methods"
  ON public.saved_payment_methods FOR DELETE
  USING (auth.uid() = user_id);
