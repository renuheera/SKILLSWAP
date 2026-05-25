/*
  # SkillSwap Platform - Initial Database Schema

  ## Overview
  Creates the complete database schema for the SkillSwap peer-to-peer learning platform.

  ## New Tables

  1. **profiles** - User profiles with bio, skills, ratings
     - id (uuid, FK to auth.users)
     - full_name, avatar_url, bio, location
     - skills_offered (text[]), skills_wanted (text[])
     - portfolio_links (text[])
     - learning_streak (int), total_sessions (int)
     - avg_rating (numeric), is_verified (bool)
     - created_at, updated_at

  2. **skills** - Skill categories and skill entries
     - id, name, category, description

  3. **sessions** - Booked learning sessions between users
     - id, mentor_id, learner_id, skill
     - scheduled_at, duration_minutes, status
     - meeting_link, notes
     - created_at, updated_at

  4. **reviews** - Reviews and ratings after completed sessions
     - id, session_id, reviewer_id, reviewee_id
     - rating (1-5), comment
     - created_at

  5. **notifications** - In-app notifications for users
     - id, user_id, type, title, message
     - is_read, related_id
     - created_at

  6. **discussions** - Community discussion posts
     - id, author_id, title, content, category
     - likes, replies_count
     - created_at, updated_at

  7. **discussion_replies** - Replies to discussion posts
     - id, discussion_id, author_id, content, likes
     - created_at

  8. **badges** - Achievement badges
     - id, user_id, badge_type, badge_name, earned_at

  ## Security
  - RLS enabled on all tables
  - Policies: users can read public data, write only their own data
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  avatar_url text DEFAULT '',
  bio text DEFAULT '',
  location text DEFAULT '',
  skills_offered text[] DEFAULT '{}',
  skills_wanted text[] DEFAULT '{}',
  portfolio_links text[] DEFAULT '{}',
  learning_streak int DEFAULT 0,
  total_sessions int DEFAULT 0,
  avg_rating numeric(3,2) DEFAULT 0,
  review_count int DEFAULT 0,
  is_verified bool DEFAULT false,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Skills are viewable by authenticated users"
  ON skills FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can insert skills"
  ON skills FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  learner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill text NOT NULL,
  skill_category text DEFAULT '',
  scheduled_at timestamptz NOT NULL,
  duration_minutes int DEFAULT 60,
  status text DEFAULT 'pending',
  meeting_link text DEFAULT '',
  notes text DEFAULT '',
  mentor_notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = mentor_id OR auth.uid() = learner_id);

CREATE POLICY "Learners can create sessions"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = learner_id);

CREATE POLICY "Session participants can update sessions"
  ON sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = mentor_id OR auth.uid() = learner_id)
  WITH CHECK (auth.uid() = mentor_id OR auth.uid() = learner_id);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by authenticated users"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews for their sessions"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read bool DEFAULT false,
  related_id uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Discussions table
CREATE TABLE IF NOT EXISTS discussions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'general',
  likes int DEFAULT 0,
  replies_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Discussions are viewable by authenticated users"
  ON discussions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create discussions"
  ON discussions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own discussions"
  ON discussions FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Discussion replies table
CREATE TABLE IF NOT EXISTS discussion_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id uuid NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  likes int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Replies are viewable by authenticated users"
  ON discussion_replies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create replies"
  ON discussion_replies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_type text NOT NULL,
  badge_name text NOT NULL,
  badge_description text DEFAULT '',
  earned_at timestamptz DEFAULT now()
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges are viewable by authenticated users"
  ON badges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert badges"
  ON badges FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Seed skill categories and sample skills
INSERT INTO skills (name, category, description) VALUES
  ('Bharatanatyam', 'Dance & Arts', 'Classical Indian dance form'),
  ('Kathak', 'Dance & Arts', 'North Indian classical dance'),
  ('Drawing & Illustration', 'Design & Arts', 'Fundamentals of drawing'),
  ('UI/UX Design', 'Design & Arts', 'User interface and experience design'),
  ('Figma', 'Design & Arts', 'UI design tool'),
  ('Java Programming', 'Technology', 'Core Java and OOP concepts'),
  ('Python', 'Technology', 'Python programming language'),
  ('Web Development', 'Technology', 'HTML, CSS, JavaScript'),
  ('React.js', 'Technology', 'React frontend framework'),
  ('Node.js', 'Technology', 'Server-side JavaScript'),
  ('Machine Learning', 'Technology', 'ML fundamentals and applications'),
  ('Data Analysis', 'Technology', 'Data analysis and visualization'),
  ('Guitar', 'Music', 'Acoustic and electric guitar'),
  ('Piano', 'Music', 'Piano and keyboard'),
  ('Singing', 'Music', 'Vocal training and technique'),
  ('Photography', 'Creative', 'Digital photography basics'),
  ('Video Editing', 'Creative', 'Video post-production'),
  ('Content Writing', 'Communication', 'Writing articles and blogs'),
  ('Public Speaking', 'Communication', 'Presentation and speaking skills'),
  ('English Language', 'Language', 'English communication and grammar'),
  ('Spanish', 'Language', 'Spanish language basics'),
  ('Yoga', 'Health & Fitness', 'Yoga postures and breathing'),
  ('Meditation', 'Health & Fitness', 'Mindfulness and meditation'),
  ('Cooking', 'Lifestyle', 'Cooking techniques and recipes'),
  ('Mathematics', 'Academic', 'Algebra, calculus and more')
ON CONFLICT DO NOTHING;
