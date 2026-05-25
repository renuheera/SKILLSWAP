'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth-context';
import { MOCK_USERS } from '@/lib/mock-data';
import { toast } from 'sonner';
import Link from 'next/link';

function BookingForm() {
  const searchParams = useSearchParams();
  const mentorId = searchParams.get('mentor');
  const { user } = useAuth();

  const mentor = MOCK_USERS.find((u) => u.id === mentorId) || MOCK_USERS[0];

  const [formData, setFormData] = useState({
    skill: mentor.skills_offered[0] || '',
    date: '',
    time: '',
    duration: '60',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.skill || !formData.date || !formData.time) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setBooked(true);
    toast.success('Session request sent!');
  }

  if (booked) {
    return (
      <div className="max-w-lg mx-auto text-center py-8">
        <div className="w-12 h-12 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
          <Calendar className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-base font-semibold text-slate-800 mb-2">Booking request sent!</h2>
        <p className="text-sm text-slate-500 mb-4">Your session request with {mentor.full_name} has been sent.</p>
        <div className="flex gap-2 justify-center">
          <Link href="/sessions">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">View Sessions</Button>
          </Link>
          <Button variant="outline" onClick={() => setBooked(false)}>Book Another</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="page-header">Book a Session</h1>

      {/* Mentor info */}
      <div className="card mb-4">
        <div className="flex items-center gap-3">
          <img src={mentor.avatar_url} alt={mentor.full_name} className="w-10 h-10 rounded-full object-cover" />
          <div>
            <p className="text-sm font-medium text-slate-800">{mentor.full_name}</p>
            <p className="text-xs text-slate-500">{mentor.location}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {mentor.skills_offered.slice(0, 3).map((s) => (
            <span key={s} className="skill-tag-blue">{s}</span>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card space-y-3">
        <h2 className="section-header">Session Details</h2>

        <div>
          <Label className="text-xs font-medium text-slate-700">Skill *</Label>
          <select
            name="skill"
            value={formData.skill}
            onChange={handleChange}
            className="input-field mt-1"
          >
            {mentor.skills_offered.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-medium text-slate-700">Date *</Label>
            <Input name="date" type="date" value={formData.date} onChange={handleChange} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs font-medium text-slate-700">Time *</Label>
            <Input name="time" type="time" value={formData.time} onChange={handleChange} className="mt-1" />
          </div>
        </div>

        <div>
          <Label className="text-xs font-medium text-slate-700">Duration</Label>
          <select name="duration" value={formData.duration} onChange={handleChange} className="input-field mt-1">
            <option value="30">30 min</option>
            <option value="45">45 min</option>
            <option value="60">60 min</option>
            <option value="90">90 min</option>
          </select>
        </div>

        <div>
          <Label className="text-xs font-medium text-slate-700">Notes</Label>
          <Textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="What do you want to learn?"
            rows={2}
            className="mt-1"
          />
        </div>

        <div className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded mb-2">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
          <p className="text-xs text-blue-700">A meeting link will be shared after the mentor accepts.</p>
        </div>

        <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          {loading ? 'Sending...' : 'Send Request'}
        </Button>
      </form>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-slate-500">Loading...</div>}>
      <BookingForm />
    </Suspense>
  );
}
