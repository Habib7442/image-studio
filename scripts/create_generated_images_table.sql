-- Create generated_images table for storing image metadata
-- This table stores metadata about generated images, not the actual image data

CREATE TABLE IF NOT EXISTS generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  prompt TEXT NOT NULL,
  style TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generated_images_user_id ON generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_expires_at ON generated_images(expires_at);
CREATE INDEX IF NOT EXISTS idx_generated_images_is_deleted ON generated_images(is_deleted);
CREATE INDEX IF NOT EXISTS idx_generated_images_created_at ON generated_images(created_at);

-- Create RLS policies
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own images
CREATE POLICY "Users can view their own images" ON generated_images
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own images
CREATE POLICY "Users can insert their own images" ON generated_images
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own images
CREATE POLICY "Users can update their own images" ON generated_images
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete their own images" ON generated_images
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON generated_images TO authenticated;
GRANT ALL ON generated_images TO service_role;
