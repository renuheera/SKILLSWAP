'use client';

import { useState } from 'react';
import { Bell, Calendar, Star, Users, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MOCK_NOTIFICATIONS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const notifIcon = (type: string) => {
    const map: Record<string, React.ReactNode> = {
      booking: <Calendar className="w-4 h-4 text-blue-600" />,
      session: <Calendar className="w-4 h-4 text-green-600" />,
      review: <Star className="w-4 h-4 text-amber-500" />,
      connection: <Users className="w-4 h-4 text-slate-500" />,
    };
    return map[type] || <Bell className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="page-header mb-0">Notifications</h1>
          <p className="text-xs text-slate-500">{unreadCount > 0 ? `${unreadCount} unread` : 'All read'}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>Mark all read</Button>
        )}
      </div>

      <div className="card p-0 divide-y divide-slate-100">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={cn(
              'p-3 flex items-start gap-2 cursor-pointer hover:bg-slate-50',
              !notif.is_read && 'bg-blue-50/30'
            )}
            onClick={() => markRead(notif.id)}
          >
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
              {notifIcon(notif.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={cn('text-xs', !notif.is_read ? 'font-medium text-slate-800' : 'text-slate-700')}>
                  {notif.title}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">{format(new Date(notif.created_at), 'MMM d')}</span>
                  {!notif.is_read && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                </div>
              </div>
              <p className="text-xs text-slate-500">{notif.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Preferences */}
      <div className="card mt-4">
        <h2 className="section-header">Preferences</h2>
        <div className="space-y-2">
          {[
            { label: 'Session reminders', enabled: true },
            { label: 'Booking alerts', enabled: true },
            { label: 'Review notifications', enabled: true },
            { label: 'Community updates', enabled: false },
          ].map((pref) => (
            <div key={pref.label} className="flex items-center justify-between py-1">
              <span className="text-xs text-slate-600">{pref.label}</span>
              <div className={cn(
                'w-8 h-4 rounded-full relative cursor-pointer transition-colors',
                pref.enabled ? 'bg-blue-600' : 'bg-slate-200'
              )}>
                <div className={cn(
                  'absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform',
                  pref.enabled ? 'translate-x-4' : 'translate-x-0.5'
                )} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
