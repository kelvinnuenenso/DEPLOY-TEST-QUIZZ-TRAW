-- Add analytics columns to quizzes table
ALTER TABLE quizzes
ADD COLUMN views integer NOT NULL DEFAULT 0,
ADD COLUMN starts integer NOT NULL DEFAULT 0;

-- Add analytics columns to quiz_results table
ALTER TABLE quiz_results
ADD COLUMN device_type text NOT NULL DEFAULT 'desktop',
ADD COLUMN time_spent_seconds integer NOT NULL DEFAULT 0,
ADD COLUMN abandoned_at_question integer,
ALTER COLUMN completed_at DROP NOT NULL;

-- Add check constraint for device_type
ALTER TABLE quiz_results
ADD CONSTRAINT quiz_results_device_type_check
CHECK (device_type IN ('desktop', 'mobile', 'tablet'));

-- Update questions table structure
ALTER TABLE questions
DROP COLUMN question_type,
DROP COLUMN correct_answer,
DROP COLUMN points,
DROP COLUMN updated_at,
RENAME COLUMN question_text TO text,
RENAME COLUMN order_number TO "order",
ADD COLUMN correct_option integer NOT NULL,
ADD COLUMN explanation text,
ALTER COLUMN options SET NOT NULL;

-- Add RLS policies for analytics
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quiz analytics"
ON quizzes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Quiz results can be created by anyone"
ON quiz_results
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Quiz results can be viewed by quiz owner"
ON quiz_results
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM quizzes
    WHERE quizzes.id = quiz_results.quiz_id
    AND quizzes.user_id = auth.uid()
  )
);