'use client';

import Link from 'next/link';
import { MapPin, BadgeCheck, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface UserCardProps {
  user: {
    id: string;
    full_name: string;
    avatar_url: string;
    bio: string;
    location: string;
    skills_offered: string[];
    skills_wanted: string[];
    avg_rating: number;
    review_count: number;
    total_sessions: number;
    is_verified: boolean;
  };
  showBookButton?: boolean;
}

export function UserCard({ user, showBookButton = true }: UserCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-blue-100 overflow-hidden flex-shrink-0">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-blue-600 font-semibold">
              {user.full_name?.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Link href={`/profile/${user.id}`} className="font-semibold text-slate-800 text-sm hover:text-blue-600">
              {user.full_name}
            </Link>
            {user.is_verified && (
              <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
            )}
          </div>
          {user.location && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500">{user.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-slate-700">{user.avg_rating.toFixed(1)}</span>
            <span className="text-xs text-slate-400">({user.review_count} reviews)</span>
            <span className="text-xs text-slate-400 ml-1">· {user.total_sessions} sessions</span>
          </div>
        </div>
      </div>

      {user.bio && (
        <p className="text-xs text-slate-600 mt-2.5 line-clamp-2">{user.bio}</p>
      )}

      {user.skills_offered.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-slate-500 mb-1.5">Offers</p>
          <div className="flex flex-wrap gap-1">
            {user.skills_offered.slice(0, 3).map((skill) => (
              <span key={skill} className="skill-badge">{skill}</span>
            ))}
            {user.skills_offered.length > 3 && (
              <span className="text-xs text-slate-400">+{user.skills_offered.length - 3} more</span>
            )}
          </div>
        </div>
      )}

      {user.skills_wanted.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-slate-500 mb-1.5">Wants to learn</p>
          <div className="flex flex-wrap gap-1">
            {user.skills_wanted.slice(0, 2).map((skill) => (
              <span key={skill} className="skill-badge-teal">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {showBookButton && (
        <div className="mt-3 flex gap-2">
          <Link href={`/profile/${user.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs">View Profile</Button>
          </Link>
          <Link href={`/booking?mentor=${user.id}`} className="flex-1">
            <Button size="sm" className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white">Book Session</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
