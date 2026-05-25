'use client';

import { useState } from 'react';
import { Star, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/star-rating';
import { MOCK_REVIEWS, MOCK_SESSIONS } from '@/lib/mock-data';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({ session: '', rating: 0, comment: '' });
  const [activeTab, setActiveTab] = useState<'received' | 'given'>('received');

  function handleSubmitReview() {
    if (!newReview.session || newReview.rating === 0) {
      toast.error('Select a session and rating');
      return;
    }
    const review = {
      id: `new-${Date.now()}`,
      session_id: newReview.session,
      reviewer_id: 'demo',
      reviewee_id: 'demo',
      rating: newReview.rating,
      comment: newReview.comment,
      reviewer: MOCK_SESSIONS[0].learner,
      reviewee: MOCK_SESSIONS[0].mentor,
      created_at: new Date().toISOString(),
    };
    setReviews([review, ...reviews]);
    setNewReview({ session: '', rating: 0, comment: '' });
    setShowForm(false);
    toast.success('Review submitted');
  }

  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-header mb-0">Reviews</h1>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" />
          Write Review
        </Button>
      </div>

      {/* Write review form */}
      {showForm && (
        <div className="card mb-4">
          <h2 className="section-header">Write a Review</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-600">Session</label>
              <select
                value={newReview.session}
                onChange={(e) => setNewReview({ ...newReview, session: e.target.value })}
                className="input-field mt-1"
              >
                <option value="">Select session</option>
                {MOCK_SESSIONS.filter((s) => s.status === 'completed').map((s) => (
                  <option key={s.id} value={s.id}>{s.skill} with {s.mentor.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-600">Rating</label>
              <div className="mt-1">
                <StarRating rating={newReview.rating} interactive onRate={(r) => setNewReview({ ...newReview, rating: r })} />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-600">Comment</label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                className="input-field mt-1"
                rows={2}
                placeholder="Share your experience..."
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmitReview}>Submit</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded w-fit">
        {(['received', 'given'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-3 py-1 text-xs font-medium rounded',
              activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Rating summary */}
      <div className="card mb-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">{avgRating}</p>
            <StarRating rating={parseFloat(avgRating)} />
            <p className="text-xs text-slate-500">{reviews.length} reviews</p>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((n) => {
              const count = reviews.filter((r) => r.rating === n).length;
              const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
              return (
                <div key={n} className="flex items-center gap-1">
                  <span className="text-xs text-slate-500 w-3">{n}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-slate-400 w-6">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews list */}
      <div className="card p-0 divide-y divide-slate-100">
        {reviews.map((review) => (
          <div key={review.id} className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <img src={review.reviewer.avatar_url} alt={review.reviewer.full_name} className="w-6 h-6 rounded-full object-cover" />
              <span className="text-xs font-medium text-slate-700">{review.reviewer.full_name}</span>
              <StarRating rating={review.rating} />
              <span className="text-xs text-slate-400 ml-auto">{format(new Date(review.created_at), 'MMM d')}</span>
            </div>
            <p className="text-xs text-slate-600">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
