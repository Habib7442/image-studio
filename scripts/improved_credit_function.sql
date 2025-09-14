-- Improved atomic credit deduction function with transaction safety
-- This function atomically decrements credits_left and increments total_credits_used
-- Returns the updated values or current values if insufficient credits
-- Uses optimistic locking and proper error handling

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
  updated_credits INTEGER;
  updated_used INTEGER;
BEGIN
  -- Start transaction (implicit in function)
  BEGIN
    -- Lock the user row for update to prevent race conditions
    SELECT credits_left, total_credits_used 
    INTO current_credits, current_used
    FROM users 
    WHERE id = p_user_id 
    FOR UPDATE NOWAIT; -- Fail immediately if row is locked
    
    -- Check if user exists
    IF current_credits IS NULL THEN
      RETURN QUERY SELECT 0, 0, FALSE;
      RETURN;
    END IF;
    
    -- Check if user has sufficient credits
    IF current_credits <= 0 THEN
      RETURN QUERY SELECT current_credits, current_used, FALSE;
      RETURN;
    END IF;
    
    -- Atomically update credits with optimistic locking
    UPDATE users 
    SET 
      credits_left = credits_left - 1,
      total_credits_used = total_credits_used + 1,
      updated_at = NOW()
    WHERE id = p_user_id
      AND credits_left = current_credits; -- Optimistic lock: only update if credits haven't changed
    
    -- Check if update was successful
    IF NOT FOUND THEN
      -- Credits were changed by another transaction, return current values
      SELECT credits_left, total_credits_used 
      INTO updated_credits, updated_used
      FROM users 
      WHERE id = p_user_id;
      
      RETURN QUERY SELECT updated_credits, updated_used, FALSE;
      RETURN;
    END IF;
    
    -- Return updated values
    RETURN QUERY SELECT 
      current_credits - 1 as credits_left,
      current_used + 1 as total_credits_used,
      TRUE as success;
      
  EXCEPTION
    WHEN lock_not_available THEN
      -- Row is locked by another transaction
      RETURN QUERY SELECT 0, 0, FALSE;
      RETURN;
    WHEN OTHERS THEN
      -- Any other error
      RETURN QUERY SELECT 0, 0, FALSE;
      RETURN;
  END;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION use_credit(UUID) TO authenticated;

-- Test the function (optional - remove in production)
-- SELECT * FROM use_credit('your-user-id-here');
