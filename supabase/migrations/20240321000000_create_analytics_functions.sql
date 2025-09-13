-- Create functions for analytics

-- Function to increment quiz views
CREATE OR REPLACE FUNCTION increment_quiz_views(quiz_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE quizzes
  SET views = views + 1
  WHERE id = quiz_id;
END;
$$;

-- Function to track quiz start
CREATE OR REPLACE FUNCTION track_quiz_start(quiz_id UUID, device text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE quizzes
  SET starts = starts + 1
  WHERE id = quiz_id;
  
  -- Create initial quiz result record
  INSERT INTO quiz_results (quiz_id, device_type, score, max_score, answers)
  VALUES (quiz_id, device, 0, 0, '[]'::jsonb);
END;
$$;

-- Function to get total quiz views
CREATE OR REPLACE FUNCTION get_quiz_views(quiz_id UUID)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT views FROM quizzes WHERE id = quiz_id;
$$;

-- Function to get total quiz starts
CREATE OR REPLACE FUNCTION get_quiz_starts(quiz_id UUID)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT starts FROM quizzes WHERE id = quiz_id;
$$;

-- Function to get device type breakdown
CREATE OR REPLACE FUNCTION get_device_breakdown(quiz_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'desktop', COUNT(*) FILTER (WHERE device_type = 'desktop'),
    'mobile', COUNT(*) FILTER (WHERE device_type = 'mobile'),
    'tablet', COUNT(*) FILTER (WHERE device_type = 'tablet')
  )
  INTO result
  FROM quiz_results
  WHERE quiz_id = get_device_breakdown.quiz_id;
  
  RETURN result;
END;
$$;

-- Function to get abandonment points
CREATE OR REPLACE FUNCTION get_abandonment_points(quiz_id UUID)
RETURNS json[]
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  result json[];
BEGIN
  SELECT array_agg(
    json_build_object(
      'questionIndex', abandoned_at_question,
      'count', COUNT(*)
    )
  )
  INTO result
  FROM quiz_results
  WHERE quiz_id = get_abandonment_points.quiz_id
    AND abandoned_at_question IS NOT NULL
  GROUP BY abandoned_at_question
  ORDER BY abandoned_at_question;
  
  RETURN result;
END;
$$;

-- Add RLS policies for analytics functions
ALTER FUNCTION increment_quiz_views(UUID) SET ROLE authenticated;
ALTER FUNCTION track_quiz_start(UUID, text) SET ROLE authenticated;
ALTER FUNCTION get_quiz_views(UUID) SET ROLE authenticated;
ALTER FUNCTION get_quiz_starts(UUID) SET ROLE authenticated;
ALTER FUNCTION get_device_breakdown(UUID) SET ROLE authenticated;
ALTER FUNCTION get_abandonment_points(UUID) SET ROLE authenticated;