-- Apply the use_credit function to the database
-- Run this script in your Supabase SQL editor or via migration

-- Atomic credit deduction function
CREATE OR REPLACE FUNCTION use_credit(p_user_id UUID)
RETURNS TABLE(
  credits_left INTEGER,
  total_credits_used INTEGER,
  success BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_credits INTEGER;
  current_used INTEGER;
BEGIN
  -- Lock the user row for update to prevent race conditions
  SELECT credits_left, total_credits_used 
  INTO current_credits, current_used
  FROM users 
  WHERE id = p_user_id 
  FOR UPDATE;
  
  -- Check if user exists and has credits
  IF current_credits IS NULL THEN
    RETURN QUERY SELECT 0, 0, FALSE;
    RETURN;
  END IF;
  
  IF current_credits <= 0 THEN
    RETURN QUERY SELECT current_credits, current_used, FALSE;
    RETURN;
  END IF;
  
  -- Atomically update credits
  UPDATE users 
  SET 
    credits_left = credits_left - 1,
    total_credits_used = total_credits_used + 1,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Return updated values
  RETURN QUERY SELECT 
    current_credits - 1 as credits_left,
    current_used + 1 as total_credits_used,
    TRUE as success;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION use_credit(UUID) TO authenticated;

-- Test the function (optional - remove in production)
-- SELECT * FROM use_credit('your-user-id-here');
