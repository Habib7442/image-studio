-- Credit refund function for failed operations
-- This function refunds credits if AI generation fails after deduction

CREATE OR REPLACE FUNCTION refund_credit(p_user_id UUID)
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
  -- Start transaction (implicit in function)
  BEGIN
    -- Lock the user row for update
    SELECT credits_left, total_credits_used 
    INTO current_credits, current_used
    FROM users 
    WHERE id = p_user_id 
    FOR UPDATE NOWAIT;
    
    -- Check if user exists
    IF current_credits IS NULL THEN
      RETURN QUERY SELECT 0, 0, FALSE;
      RETURN;
    END IF;
    
    -- Refund credit (add 1 to credits_left, subtract 1 from total_credits_used)
    UPDATE users 
    SET 
      credits_left = credits_left + 1,
      total_credits_used = GREATEST(total_credits_used - 1, 0), -- Don't go below 0
      updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Return updated values
    RETURN QUERY SELECT 
      current_credits + 1 as credits_left,
      GREATEST(current_used - 1, 0) as total_credits_used,
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
GRANT EXECUTE ON FUNCTION refund_credit(UUID) TO authenticated;
