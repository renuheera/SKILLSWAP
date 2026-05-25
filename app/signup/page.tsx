'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpenCheck, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function SignupPage() {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    const { error } = await signUp(formData.email, formData.password, formData.fullName);
    setLoading(false);
    if (error) {
      toast.error(error.message || 'Failed to create account');
    } else {
      toast.success('Account created! Please check your email to confirm.');
      router.push('/dashboard');
    }
  }

  const perks = [
    'Connect with 2,400+ skilled peers',
    'Exchange skills without paying',
    'Book live one-to-one sessions',
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left panel */}
        <div className="hidden lg:block">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpenCheck className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-800 text-base">SkillSwap</span>
          </Link>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Start learning for free</h2>
          <p className="text-slate-500 mb-8">Join a growing community of learners who exchange skills instead of paying for courses.</p>
          <div className="space-y-3">
            {perks.map((perk) => (
              <div key={perk} className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />
                <span className="text-sm text-slate-700">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white border border-slate-200 rounded-xl p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-5 lg:hidden">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpenCheck className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-slate-800">SkillSwap</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">Create your account</h1>
            <p className="text-sm text-slate-500 mt-1">It&apos;s free and always will be</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-sm font-medium text-slate-700">Full name</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Renu Sharma"
                value={formData.fullName}
                onChange={handleChange}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Confirm password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1.5"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs text-slate-400 bg-white px-3">or</div>
          </div>

          <Button variant="outline" className="w-full gap-2" type="button">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign up with Google
          </Button>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
