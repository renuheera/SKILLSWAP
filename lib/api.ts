import { supabase } from './supabase';
import type { Profile, Session, Review, Notification, Discussion } from './supabase';

const FUNCTIONS_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

async function getAuthToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${FUNCTIONS_URL}/functions/v1${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Sessions API
export const sessionsApi = {
  async list(status?: string) {
    const query = status ? `?status=${status}` : '';
    return apiRequest(`/sessions${query}`);
  },

  async create(data: {
    mentor_id: string;
    skill: string;
    skill_category?: string;
    scheduled_at: string;
    duration_minutes?: number;
    notes?: string;
  }) {
    return apiRequest('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(sessionId: string, data: {
    status?: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
    meeting_link?: string;
    mentor_notes?: string;
  }) {
    return apiRequest(`/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async accept(sessionId: string) {
    return this.update(sessionId, { status: 'accepted' });
  },

  async reject(sessionId: string) {
    return this.update(sessionId, { status: 'rejected' });
  },

  async complete(sessionId: string, meetingLink?: string) {
    return this.update(sessionId, { status: 'completed', meeting_link: meetingLink });
  },
};

// Reviews API
export const reviewsApi = {
  async list(userId?: string, type?: 'received' | 'given') {
    const params = new URLSearchParams();
    if (userId) params.set('user_id', userId);
    if (type) params.set('type', type);
    const query = params.toString() ? `?${params}` : '';
    return apiRequest(`/reviews${query}`);
  },

  async create(data: {
    session_id: string;
    reviewee_id: string;
    rating: number;
    comment?: string;
  }) {
    return apiRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Users API
export const usersApi = {
  async list(filter?: { search?: string; skill?: string; limit?: number; offset?: number }) {
    const params = new URLSearchParams();
    if (filter?.search) params.set('search', filter.search);
    if (filter?.skill) params.set('skill', filter.skill);
    if (filter?.limit) params.set('limit', String(filter.limit));
    if (filter?.offset) params.set('offset', String(filter.offset));
    const query = params.toString() ? `?${params}` : '';
    return apiRequest(`/users${query}`);
  },

  async get(userId: string) {
    return apiRequest(`/users/${userId}`);
  },

  async updateMe(data: {
    full_name?: string;
    bio?: string;
    location?: string;
    avatar_url?: string;
    skills_offered?: string[];
    skills_wanted?: string[];
    portfolio_links?: string[];
  }) {
    return apiRequest('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Notifications API
export const notificationsApi = {
  async list(unreadOnly = false) {
    const query = unreadOnly ? '?unread=true' : '';
    return apiRequest(`/notifications${query}`);
  },

  async markRead(notificationId: string) {
    return apiRequest(`/notifications/${notificationId}/read`, { method: 'PUT' });
  },

  async markAllRead() {
    return apiRequest('/notifications/read-all', { method: 'PUT' });
  },
};

// Discussions API
export const discussionsApi = {
  async list(category?: string) {
    const query = category && category !== 'All' ? `?category=${category}` : '';
    return apiRequest(`/discussions${query}`);
  },

  async get(discussionId: string) {
    return apiRequest(`/discussions/${discussionId}`);
  },

  async create(data: { title: string; content: string; category?: string }) {
    return apiRequest('/discussions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async like(discussionId: string) {
    return apiRequest(`/discussions/${discussionId}/like`, { method: 'POST' });
  },

  async reply(discussionId: string, content: string) {
    return apiRequest(`/discussions/${discussionId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },
};

// Skills API (direct database queries)
export const skillsApi = {
  async list() {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  },

  async byCategory() {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('category, name');
    if (error) throw error;
    return data.reduce((acc: Record<string, typeof data>, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    }, {});
  },
};
