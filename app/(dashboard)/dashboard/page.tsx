'use client';

import Link from 'next/link';
import { Calendar, BookOpen, Star, Flame, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { MOCK_SESSIONS, MOCK_USERS } from '@/lib/mock-data';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { profile, user } = useAuth();
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  const upcomingSessions = MOCK_SESSIONS.filter((s) => s.status === 'accepted' || s.status === 'pending');

  const stats = [
    { label: 'Sessions', value: profile?.total_sessions ?? 15, icon: <CheckCircle className="w-4 h-4 text-green-600" /> },
    { label: 'Rating', value: profile?.avg_rating ? `${profile.avg_rating}` : '4.8', icon: <Star className="w-4 h-4 text-amber-500" /> },
    { label: 'Streak', value: `${profile?.learning_streak ?? 12}d`, icon: <Flame className="w-4 h-4 text-orange-500" /> },
    { label: 'Skills', value: profile?.skills_offered?.length ?? 3, icon: <BookOpen className="w-4 h-4 text-blue-600" /> },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-header mb-0">Dashboard</h1>
        <Link href="/marketplace">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Find Skills</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center gap-2 mb-1">
              {stat.icon}
              <span className="text-lg font-bold text-slate-800">{stat.value}</span>
            </div>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Upcoming sessions */}
        <div className="col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-header mb-0">Upcoming Sessions</h2>
              <Link href="/sessions" className="text-xs text-blue-600 hover:underline">View all</Link>
            </div>
            {upcomingSessions.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-500">
                <p>No upcoming sessions</p>
                <Link href="/booking">
                  <Button variant="outline" size="sm" className="mt-2">Book a session</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded border border-slate-100">
                    <img
                      src={session.mentor.avatar_url}
                      alt={session.mentor.full_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{session.skill}</p>
                      <p className="text-xs text-slate-500">with {session.mentor.full_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-600">
                        {format(new Date(session.scheduled_at), 'MMM d')}
                      </p>
                      <span className={`badge text-xs ${
                        session.status === 'accepted' ? 'badge-success' :
                        session.status === 'pending' ? 'badge-warning' : 'badge-info'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div className="card mt-4">
            <h2 className="section-header">Recent Activity</h2>
            <div className="space-y-2">
              {[
                { text: 'Completed UI/UX Design session with Priya', time: '1 day ago' },
                { text: 'Left a review for Renu Sharma', time: '2 days ago' },
                { text: 'Updated your profile skills', time: '3 days ago' },
              ].map((item, i) => (
                <div key={i} className="text-xs text-slate-600 flex justify-between py-1 border-b border-slate-100 last:border-0">
                  <span>{item.text}</span>
                  <span className="text-slate-400">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="card">
            <h2 className="section-header">Suggested Mentors</h2>
            <div className="space-y-2">
              {MOCK_USERS.slice(0, 3).map((u) => (
                <div key={u.id} className="flex items-center gap-2">
                  <img src={u.avatar_url} alt={u.full_name} className="w-7 h-7 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">{u.full_name}</p>
                    <p className="text-xs text-slate-400">{u.skills_offered[0]}</p>
                  </div>
                  <Link href={`/booking?mentor=${u.id}`}>
                    <Button variant="outline" size="sm" className="text-xs px-2 py-0.5 h-6">Book</Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="section-header">Quick Links</h2>
            <div className="space-y-1">
              <Link href="/profile/edit" className="block text-xs text-blue-600 hover:underline py-1">Edit Profile</Link>
              <Link href="/marketplace" className="block text-xs text-blue-600 hover:underline py-1">Browse Skills</Link>
              <Link href="/community" className="block text-xs text-blue-600 hover:underline py-1">Community Forum</Link>
            </div>
          </div>

          <div className="card bg-slate-50">
            <p className="text-xs text-slate-600 mb-2">Welcome, {displayName.split(' ')[0]}!</p>
            <p className="text-xs text-slate-500">
              Complete your profile to get better skill matches.
            </p>
            <Link href="/profile/edit">
              <Button variant="outline" size="sm" className="w-full mt-2 text-xs">Edit Profile</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
