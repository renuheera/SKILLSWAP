'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { BookOpen, Bell, User, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password';
  const isDashboard = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/sessions') ||
    pathname.startsWith('/marketplace') ||
    pathname.startsWith('/search') ||
    pathname.startsWith('/booking') ||
    pathname.startsWith('/community') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/reviews');

  if (isAuthPage) return null;
  if (isDashboard && user) return null;

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-slate-800">SkillSwap</span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/marketplace" className="text-sm text-slate-600 hover:text-slate-900">Marketplace</Link>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link href="/notifications">
                  <Button variant="ghost" size="sm">
                    <Bell className="w-4 h-4" />
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <User className="w-4 h-4" />
                      <span className="text-sm">{profile?.full_name?.split(' ')[0] || 'Account'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">My Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-2 space-y-1">
          {user ? (
            <>
              <Link href="/dashboard" className="block py-2 text-sm text-slate-600">Dashboard</Link>
              <Link href="/profile" className="block py-2 text-sm text-slate-600">My Profile</Link>
              <button onClick={signOut} className="block py-2 text-sm text-red-600">Sign out</button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">Login</Button>
              </Link>
              <Link href="/signup" className="flex-1">
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
