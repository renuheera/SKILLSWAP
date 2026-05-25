'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { BadgeCheck, MapPin, Star, ExternalLink, Award, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/star-rating';
import { MOCK_USERS, MOCK_REVIEWS } from '@/lib/mock-data';
import { format } from 'date-fns';

export default function PublicProfilePage() {
  const { id } = useParams();
  const user = MOCK_USERS.find((u) => u.id === id) || MOCK_USERS[0];
  const userReviews = MOCK_REVIEWS.filter((r) => r.reviewee_id === user.id);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <h1 className="page-title">User Profile</h1>

      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="w-20 h-20 rounded-full bg-blue-100 overflow-hidden border-2 border-slate-200 flex-shrink-0">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                {user.full_name?.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{user.full_name}</h2>
              {user.is_verified && <BadgeCheck className="w-5 h-5 text-blue-500" />}
            </div>
            {user.location && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-sm text-slate-500">{user.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1 mt-1.5">
              <StarRating rating={user.avg_rating} />
              <span className="text-sm text-slate-600 ml-1">{user.avg_rating} ({user.review_count} reviews)</span>
            </div>
            <p className="text-sm text-slate-600 mt-3">{user.bio}</p>
            <div className="flex gap-4 mt-4 text-center">
              {[
                { v: user.total_sessions, l: 'Sessions' },
                { v: user.avg_rating, l: 'Rating' },
                { v: user.learning_streak + ' days', l: 'Streak' },
              ].map((s) => (
                <div key={s.l}>
                  <p className="text-lg font-bold text-slate-800">{s.v}</p>
                  <p className="text-xs text-slate-500">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="section-title mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            Skills offered
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {user.skills_offered.map((s) => <span key={s} className="skill-badge">{s}</span>)}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="section-title mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-teal-600" />
            Wants to learn
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {user.skills_wanted.map((s) => <span key={s} className="skill-badge-teal">{s}</span>)}
          </div>
        </div>
      </div>

      {user.portfolio_links.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="section-title mb-3">Portfolio</h3>
          <div className="space-y-1.5">
            {user.portfolio_links.map((l) => (
              <a key={l} href={l} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                <ExternalLink className="w-3.5 h-3.5" />
                {l}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h3 className="section-title mb-4">Reviews ({userReviews.length || 3})</h3>
        <div className="space-y-4">
          {(userReviews.length ? userReviews : MOCK_REVIEWS).slice(0, 3).map((rev) => (
            <div key={rev.id} className="border-b border-slate-100 pb-4 last:border-0">
              <div className="flex items-center gap-2 mb-1.5">
                <img src={rev.reviewer.avatar_url} alt={rev.reviewer.full_name} className="w-7 h-7 rounded-full object-cover" />
                <span className="text-sm font-medium text-slate-800">{rev.reviewer.full_name}</span>
                <StarRating rating={rev.rating} size="sm" />
                <span className="text-xs text-slate-400 ml-auto">{format(new Date(rev.created_at), 'MMM d, yyyy')}</span>
              </div>
              <p className="text-sm text-slate-600">{rev.comment}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pb-6">
        <Link href={`/booking?mentor=${user.id}`} className="flex-1">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Book a session</Button>
        </Link>
        <Button variant="outline" className="flex-1">Send message</Button>
      </div>
    </div>
  );
}
