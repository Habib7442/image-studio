-- Add referral fields to users table if they don't exist
DO $$ 
BEGIN
    -- Add referral_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'referral_id') THEN
        ALTER TABLE public.users ADD COLUMN referral_id TEXT UNIQUE;
    END IF;

    -- Add referred_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'referred_by') THEN
        ALTER TABLE public.users ADD COLUMN referred_by TEXT;
    END IF;

    -- Add referral_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'referral_count') THEN
        ALTER TABLE public.users ADD COLUMN referral_count INTEGER DEFAULT 0;
    END IF;

    -- Add referral_credits_earned column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'referral_credits_earned') THEN
        ALTER TABLE public.users ADD COLUMN referral_credits_earned INTEGER DEFAULT 0;
    END IF;

    -- Add last_daily_bonus_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'last_daily_bonus_date') THEN
        ALTER TABLE public.users ADD COLUMN last_daily_bonus_date DATE;
    END IF;
END $$;

-- Generate referral_id for existing users who don't have one
UPDATE public.users 
SET referral_id = 'REF' || substr(md5(random()::text), 1, 8)
WHERE referral_id IS NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_referral_id ON public.users(referral_id);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON public.users(referred_by);
CREATE INDEX IF NOT EXISTS idx_users_last_daily_bonus ON public.users(last_daily_bonus_date);
