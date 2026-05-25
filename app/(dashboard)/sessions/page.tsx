'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Clock, Check, X, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MOCK_SESSIONS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

type FilterType = 'all' | 'upcoming' | 'completed' | 'cancelled';

export default function SessionsPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sessions, setSessions] = useState(MOCK_SESSIONS);

  const filters: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Completed', value: 'completed' },
  ];

  const filtered = sessions.filter((s) => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return s.status === 'accepted' || s.status === 'pending';
    return s.status === filter;
  });

  function handleAccept(id: string) {
    setSessions((prev) => prev.map((s) => s.id === id ? { ...s, status: 'accepted' } : s));
    toast.success('Session accepted');
  }

  function handleReject(id: string) {
    setSessions((prev) => prev.map((s) => s.id === id ? { ...s, status: 'rejected' } : s));
    toast.success('Session rejected');
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'badge-warning',
      accepted: 'badge-success',
      completed: 'badge-info',
      rejected: 'bg-red-50 text-red-700 border border-red-200',
      cancelled: 'bg-slate-100 text-slate-600',
    };
    return map[status] || 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-header mb-0">Sessions</h1>
        <Link href="/booking">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Book Session</Button>
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded w-fit">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-3 py-1 text-xs font-medium rounded',
              filter === f.value ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Sessions table */}
      <div className="card p-0">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-500">
            <p>No sessions found</p>
            <Link href="/booking">
              <Button variant="outline" size="sm" className="mt-2">Book a session</Button>
            </Link>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="table-header">
              <tr>
                <th className="text-left py-2 px-3 font-medium text-slate-600">Skill</th>
                <th className="text-left py-2 px-3 font-medium text-slate-600">Partner</th>
                <th className="text-left py-2 px-3 font-medium text-slate-600">Date</th>
                <th className="text-left py-2 px-3 font-medium text-slate-600">Status</th>
                <th className="text-left py-2 px-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((session) => (
                <tr key={session.id} className="table-row">
                  <td className="py-2 px-3">
                    <p className="font-medium text-slate-800">{session.skill}</p>
                    <p className="text-slate-400">{session.skill_category}</p>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1.5">
                      <img src={session.mentor.avatar_url} alt={session.mentor.full_name} className="w-5 h-5 rounded-full object-cover" />
                      <span className="text-slate-700">{session.mentor.full_name}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Clock className="w-3 h-3" />
                      <span>{format(new Date(session.scheduled_at), 'MMM d, yyyy')}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <span className={cn('badge', statusBadge(session.status))}>{session.status}</span>
                  </td>
                  <td className="py-2 px-3">
                    {session.status === 'pending' && (
                      <div className="flex gap-1">
                        <Button size="sm" className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAccept(session.id)}>
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 px-2 text-xs text-red-600" onClick={() => handleReject(session.id)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                    {session.status === 'accepted' && (
                      <Button size="sm" className="h-6 px-2 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                        <Video className="w-3 h-3 mr-1" />
                        Join
                      </Button>
                    )}
                    {session.status === 'completed' && (
                      <Link href="/reviews">
                        <Button size="sm" variant="outline" className="h-6 px-2 text-xs">Review</Button>
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
