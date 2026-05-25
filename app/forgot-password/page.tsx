'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpenCheck, ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error('Failed to send reset email');
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-slate-200 rounded-xl p-8">
          <div className="text-center mb-7">
            <Link href="/" className="inline-flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpenCheck className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-slate-800">SkillSwap</span>
            </Link>
            {sent ? (
              <>
                <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-teal-600" />
                </div>
                <h1 className="text-xl font-bold text-slate-900">Check your inbox</h1>
                <p className="text-sm text-slate-500 mt-2">
                  We sent a password reset link to <strong>{email}</strong>
                </p>
              </>
            ) : (
              <>
                <h1 className="text-xl font-bold text-slate-900">Reset your password</h1>
                <p className="text-sm text-slate-500 mt-1">Enter your email to receive a reset link</p>
              </>
            )}
          </div>

          {!sent && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                {loading ? 'Sending...' : 'Send reset link'}
              </Button>
            </form>
          )}

          <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mt-6">
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
