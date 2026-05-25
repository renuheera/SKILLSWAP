/*
  # SkillSwap - Database Functions and Sample Data

  ## Overview
  Creates helper functions for session counting, ratings, and seeds sample data
  using auth.users that exist in the database.

  ## Functions
  - increment_session_count: Updates profile session and streak counts
  - increment_discussion_likes: Increments like count on discussions
  - update_user_rating: Recalculates average rating for a user
*/

-- Helper functions
CREATE OR REPLACE FUNCTION increment_session_count(user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET total_sessions = total_sessions + 1,
      learning_streak = learning_streak + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_discussion_likes(disc_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE discussions SET likes = likes + 1 WHERE id = disc_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_user_rating(target_user_id uuid)
RETURNS void AS $$
DECLARE
  avg_rat numeric;
  cnt int;
BEGIN
  SELECT AVG(rating), COUNT(*) INTO avg_rat, cnt
  FROM reviews WHERE reviewee_id = target_user_id;
  
  UPDATE profiles
  SET avg_rating = COALESCE(avg_rat, 0),
      review_count = COALESCE(cnt, 0)
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create sample user profile
CREATE OR REPLACE FUNCTION create_sample_profile(
  p_email text,
  p_full_name text,
  p_avatar_url text,
  p_bio text,
  p_location text,
  p_skills_offered text[],
  p_skills_wanted text[],
  p_portfolio_links text[],
  p_learning_streak int DEFAULT 0,
  p_total_sessions int DEFAULT 0,
  p_avg_rating numeric DEFAULT 0,
  p_review_count int DEFAULT 0,
  p_is_verified boolean DEFAULT false
)
RETURNS uuid AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Try to sign up user (will fail if exists, which is fine)
  BEGIN
    INSERT INTO auth.users (id, instance_id, email, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, email_confirmed_at)
    VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000'::uuid,
      p_email,
      'authenticated',
      'authenticated',
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', p_full_name),
      NOW(),
      NOW(),
      NOW()
    ) RETURNING id INTO new_user_id;

    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      new_user_id,
      p_email,
      jsonb_build_object('email', p_email, 'sub', new_user_id::text),
      'email',
      NOW(),
      NOW(),
      NOW()
    );
  EXCEPTION WHEN OTHERS THEN
    -- User might already exist, try to get their ID
    SELECT id INTO new_user_id FROM auth.users WHERE email = p_email LIMIT 1;
    IF new_user_id IS NULL THEN
      RAISE EXCEPTION 'Could not create or find user';
    END IF;
  END;

  -- Create or update profile
  INSERT INTO profiles (id, full_name, avatar_url, bio, location, skills_offered, skills_wanted, portfolio_links, learning_streak, total_sessions, avg_rating, review_count, is_verified)
  VALUES (new_user_id, p_full_name, p_avatar_url, p_bio, p_location, p_skills_offered, p_skills_wanted, p_portfolio_links, p_learning_streak, p_total_sessions, p_avg_rating, p_review_count, p_is_verified)
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    bio = EXCLUDED.bio,
    location = EXCLUDED.location,
    skills_offered = EXCLUDED.skills_offered,
    skills_wanted = EXCLUDED.skills_wanted,
    portfolio_links = EXCLUDED.portfolio_links,
    learning_streak = EXCLUDED.learning_streak,
    total_sessions = EXCLUDED.total_sessions,
    avg_rating = EXCLUDED.avg_rating,
    review_count = EXCLUDED.review_count,
    is_verified = EXCLUDED.is_verified;

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample data will be created when users sign up through the app
-- The mock data in the frontend provides a complete preview
