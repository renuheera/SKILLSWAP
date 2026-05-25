import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  location: string;
  skills_offered: string[];
  skills_wanted: string[];
  portfolio_links: string[];
  learning_streak: number;
  total_sessions: number;
  avg_rating: number;
  review_count: number;
  is_verified: boolean;
  role: string;
  created_at: string;
  updated_at: string;
};

export type Session = {
  id: string;
  mentor_id: string;
  learner_id: string;
  skill: string;
  skill_category: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  meeting_link: string;
  notes: string;
  mentor_notes: string;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: string;
  session_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  related_id: string | null;
  created_at: string;
};

export type Discussion = {
  id: string;
  author_id: string;
  title: string;
  content: string;
  category: string;
  likes: number;
  replies_count: number;
  created_at: string;
  updated_at: string;
};

export type Badge = {
  id: string;
  user_id: string;
  badge_type: string;
  badge_name: string;
  badge_description: string;
  earned_at: string;
};
