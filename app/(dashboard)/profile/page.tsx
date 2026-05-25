'use client';

import Link from 'next/link';
import { MapPin, Star, Award, BookOpen, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { StarRating } from '@/components/star-rating';
import { MOCK_REVIEWS, BADGES_DATA } from '@/lib/mock-data';
import { format } from 'date-fns';

export default function ProfilePage() {
  const { profile } = useAuth();
  const displayProfile = profile || {
    full_name: 'Demo User',
    bio: 'This is a demo profile. Sign up to create your own profile.',
    location: 'Mumbai, India',
    avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=150&h=150&fit=crop',
    skills_offered: ['Web Development', 'Python'],
    skills_wanted: ['UI Design', 'Photography'],
    total_sessions: 12,
    avg_rating: 4.5,
    learning_streak: 7,
    review_count: 8,
    portfolio_links: ['https://github.com/demo'],
    is_verified: false,
  };

  const reviews = MOCK_REVIEWS.slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-header mb-0">My Profile</h1>
        <Link href="/profile/edit">
          <Button variant="outline" size="sm">Edit Profile</Button>
        </Link>
      </div>

      {/* Profile card */}
      <div className="card mb-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
            {displayProfile.avatar_url ? (
              <img src={displayProfile.avatar_url} alt={displayProfile.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xl font-bold">
                {displayProfile.full_name?.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-slate-800">{displayProfile.full_name}</h2>
            {displayProfile.location && (
              <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                <MapPin className="w-3 h-3" />
                {displayProfile.location}
              </div>
            )}
            <div className="flex items-center gap-2 mb-2">
              <StarRating rating={displayProfile.avg_rating || 0} />
              <span className="text-xs text-slate-600">{displayProfile.avg_rating || 0} ({displayProfile.review_count} reviews)</span>
            </div>
            <p className="text-sm text-slate-600">{displayProfile.bio}</p>
          </div>
          <div className="flex gap-3 text-center">
            {[
              { v: displayProfile.total_sessions, l: 'Sessions' },
              { v: displayProfile.avg_rating, l: 'Rating' },
              { v: displayProfile.learning_streak, l: 'Streak' },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-base font-bold text-slate-800">{s.v}</p>
                <p className="text-xs text-slate-500">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="card">
          <h3 className="section-header flex items-center gap-1">
            <BookOpen className="w-4 h-4 text-blue-600" />
            Skills Offered
          </h3>
          <div className="flex flex-wrap gap-1">
            {(displayProfile.skills_offered || []).map((skill) => (
              <span key={skill} className="skill-tag-blue">{skill}</span>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="section-header flex items-center gap-1">
            <Star className="w-4 h-4 text-teal-600" />
            Skills Wanted
          </h3>
          <div className="flex flex-wrap gap-1">
            {(displayProfile.skills_wanted || []).map((skill) => (
              <span key={skill} className="skill-tag-teal">{skill}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio */}
      {displayProfile.portfolio_links && displayProfile.portfolio_links.length > 0 && (
        <div className="card mb-4">
          <h3 className="section-header">Portfolio Links</h3>
          <div className="space-y-1">
            {displayProfile.portfolio_links.map((link) => (
              <a key={link} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                <ExternalLink className="w-3 h-3" />
                {link}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Badges */}
      <div className="card mb-4">
        <h3 className="section-header flex items-center gap-1">
          <Award className="w-4 h-4 text-amber-500" />
          Achievements
        </h3>
        <div className="flex gap-3">
          {BADGES_DATA.slice(0, 3).map((badge) => (
            <div key={badge.badge_type} className="text-center">
              <div className="w-8 h-8 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto mb-1">
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xs text-slate-600">{badge.badge_name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="section-header mb-0">Reviews Received</h3>
          <Link href="/reviews" className="text-xs text-blue-600 hover:underline">View all</Link>
        </div>
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-slate-100 pb-2 last:border-0">
              <div className="flex items-center gap-2 mb-1">
                <img src={review.reviewer.avatar_url} alt={review.reviewer.full_name} className="w-6 h-6 rounded-full object-cover" />
                <span className="text-xs font-medium text-slate-700">{review.reviewer.full_name}</span>
                <StarRating rating={review.rating} />
                <span className="text-xs text-slate-400 ml-auto">{format(new Date(review.created_at), 'MMM d, yyyy')}</span>
              </div>
              <p className="text-xs text-slate-600">{review.comment.substring(0, 100)}...</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
