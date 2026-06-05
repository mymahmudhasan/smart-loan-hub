-- Transaction type enum
CREATE TYPE public.transaction_type AS ENUM (
  'deposit', 'withdrawal', 'emi_payment', 'disbursement', 'adjustment'
);

-- Transactions ledger
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.transaction_type NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  method text,
  status text NOT NULL DEFAULT 'completed',
  reference text,
  note text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);

GRANT SELECT ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Members can read their own transactions; admins can read all.
CREATE POLICY "Read own or admin transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));