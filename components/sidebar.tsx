'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  User,
  Search,
  Calendar,
  History,
  MessageSquare,
  Bell,
  Star,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Profile', href: '/profile', icon: User },
  { label: 'Marketplace', href: '/marketplace', icon: Search },
  { label: 'Book Session', href: '/booking', icon: Calendar },
  { label: 'Sessions', href: '/sessions', icon: History },
  { label: 'Community', href: '/community', icon: MessageSquare },
  { label: 'Reviews', href: '/reviews', icon: Star },
  { label: 'Notifications', href: '/notifications', icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-slate-200">
        <Link href="/dashboard" className="text-sm font-semibold text-slate-800">SkillSwap</Link>
      </div>

      {profile && (
        <div className="px-4 py-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-100 overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-medium">
                  {profile.full_name?.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-slate-800">{profile.full_name}</p>
              <p className="text-xs text-slate-500">{profile.location || 'No location'}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 px-2 py-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 pb-3 border-t border-slate-100 pt-2">
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        className="lg:hidden fixed top-2 left-2 z-50 bg-white border border-slate-200 rounded p-1.5"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'lg:hidden fixed left-0 top-0 h-full w-48 bg-white border-r border-slate-200 z-50 transition-transform',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>

      <aside className="hidden lg:flex flex-col w-48 bg-white border-r border-slate-200 min-h-screen fixed left-0 top-0 h-full">
        <SidebarContent />
      </aside>
    </>
  );
}
