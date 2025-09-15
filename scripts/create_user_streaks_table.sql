-- Create user_streaks table for tracking daily streaks
CREATE TABLE IF NOT EXISTS public.user_streaks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    streak_rewards_claimed JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own streaks" ON public.user_streaks
    FOR SELECT
    TO authenticated
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own streaks" ON public.user_streaks
    FOR UPDATE
    TO authenticated
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own streaks" ON public.user_streaks
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid()::text = user_id);

-- Service role access
CREATE POLICY "Service role full access to user_streaks" ON public.user_streaks
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON public.user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_last_activity ON public.user_streaks(last_activity_date);
