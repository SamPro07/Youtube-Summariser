-- Create summaries table
CREATE TABLE IF NOT EXISTS summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  youtube_url TEXT NOT NULL,
  video_title TEXT,
  summary_text TEXT NOT NULL,
  key_points JSONB,
  timestamps JSONB,
  main_takeaways JSONB,
  summary_format TEXT DEFAULT 'bullets',
  summary_length TEXT DEFAULT 'brief',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own summaries" ON summaries;
CREATE POLICY "Users can view their own summaries"
  ON summaries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own summaries" ON summaries;
CREATE POLICY "Users can insert their own summaries"
  ON summaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own summaries" ON summaries;
CREATE POLICY "Users can update their own summaries"
  ON summaries FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own summaries" ON summaries;
CREATE POLICY "Users can delete their own summaries"
  ON summaries FOR DELETE
  USING (auth.uid() = user_id);

-- Add to realtime
alter publication supabase_realtime add table summaries;
