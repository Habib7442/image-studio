-- Create deleted_users_blacklist table for preventing credit abuse
CREATE TABLE IF NOT EXISTS public.deleted_users_blacklist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    user_id TEXT,
    reason TEXT NOT NULL DEFAULT 'account_deletion',
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.deleted_users_blacklist ENABLE ROW LEVEL SECURITY;

-- Only service role can access blacklist
CREATE POLICY "Service role only access to blacklist" ON public.deleted_users_blacklist
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Deny all access to other roles
CREATE POLICY "No public access to blacklist" ON public.deleted_users_blacklist
    FOR ALL
    TO public, authenticated
    USING (false)
    WITH CHECK (false);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blacklist_email ON public.deleted_users_blacklist(email);
CREATE INDEX IF NOT EXISTS idx_blacklist_user_id ON public.deleted_users_blacklist(user_id);
CREATE INDEX IF NOT EXISTS idx_blacklist_deleted_at ON public.deleted_users_blacklist(deleted_at);
