import Link from 'next/link';
import { BookOpen, Users, Calendar, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MOCK_USERS, SKILL_CATEGORIES } from '@/lib/mock-data';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Simple header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-slate-800">SkillSwap</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Introduction */}
        <section className="bg-white border border-slate-200 rounded-md p-6 mb-6">
          <h1 className="text-xl font-semibold text-slate-800 mb-2">
            Peer-to-Peer Skill Exchange Platform
          </h1>
          <p className="text-slate-600 text-sm mb-4">
            SkillSwap is a platform where users can exchange skills through mentorship and live sessions.
            Teach what you know, learn what you want - without paying for courses.
          </p>
          <div className="flex gap-2">
            <Link href="/signup">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Get Started</Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="outline">Browse Skills</Button>
            </Link>
          </div>
        </section>

        {/* Quick stats */}
        <section className="grid grid-cols-4 gap-3 mb-6">
          {[
            { value: '2,400+', label: 'Members' },
            { value: '180+', label: 'Skills' },
            { value: '8,500+', label: 'Sessions' },
            { value: '4.8', label: 'Avg Rating' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-slate-200 rounded-md p-3 text-center">
              <p className="text-lg font-bold text-slate-800">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* How it works */}
        <section className="bg-white border border-slate-200 rounded-md p-5 mb-6">
          <h2 className="section-header">How It Works</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Create Profile', desc: 'List skills you can teach and skills you want to learn' },
              { step: '2', title: 'Find Match', desc: 'Browse marketplace to find suitable learning partners' },
              { step: '3', title: 'Book Session', desc: 'Schedule video sessions and exchange knowledge' },
            ].map((item) => (
              <div key={item.step} className="border border-slate-200 rounded p-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded text-xs font-bold flex items-center justify-center mb-2">
                  {item.step}
                </div>
                <h3 className="text-sm font-medium text-slate-800 mb-1">{item.title}</h3>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="bg-white border border-slate-200 rounded-md p-5 mb-6">
          <h2 className="section-header">Platform Features</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <Calendar className="w-4 h-4" />, title: 'Session Booking', desc: 'Schedule one-to-one learning sessions' },
              { icon: <Star className="w-4 h-4" />, title: 'Reviews & Ratings', desc: 'Build trust through peer feedback' },
              { icon: <Users className="w-4 h-4" />, title: 'Skill Matching', desc: 'Find the right learning partner' },
              { icon: <CheckCircle className="w-4 h-4" />, title: 'Progress Tracking', desc: 'Track streaks and achievements' },
            ].map((feat) => (
              <div key={feat.title} className="flex items-start gap-2 p-2 border border-slate-200 rounded">
                <div className="text-slate-400 mt-0.5">{feat.icon}</div>
                <div>
                  <h3 className="text-sm font-medium text-slate-800">{feat.title}</h3>
                  <p className="text-xs text-slate-500">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sample users */}
        <section className="bg-white border border-slate-200 rounded-md p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-header mb-0">Sample Users</h2>
            <Link href="/marketplace" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {MOCK_USERS.slice(0, 3).map((user) => (
              <div key={user.id} className="border border-slate-200 rounded p-3">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{user.full_name}</p>
                    <p className="text-xs text-slate-500">{user.location}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {user.skills_offered.slice(0, 2).map((s) => (
                    <span key={s} className="skill-tag-blue">{s}</span>
                  ))}
                </div>
                <Link href={`/profile/${user.id}`}>
                  <Button variant="outline" size="sm" className="w-full text-xs">View Profile</Button>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Skill categories */}
        <section className="bg-white border border-slate-200 rounded-md p-5 mb-6">
          <h2 className="section-header">Skill Categories</h2>
          <div className="flex flex-wrap gap-2">
            {SKILL_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
              <span key={cat} className="skill-tag">{cat}</span>
            ))}
          </div>
        </section>

        {/* Project info - academic context */}
        <section className="bg-white border border-slate-200 rounded-md p-5">
          <h2 className="section-header">About This Project</h2>
          <p className="text-sm text-slate-600 mb-3">
            SkillSwap is a full-stack web application developed as an academic project demonstrating
            peer-to-peer learning concepts. Built with Next.js, Supabase, and modern web technologies.
          </p>
          <div className="text-xs text-slate-500">
            <p><strong>Tech Stack:</strong> Next.js, TypeScript, Tailwind CSS, Supabase</p>
            <p><strong>Features:</strong> Authentication, Real-time sessions, Reviews, Community forum</p>
          </div>
        </section>
      </main>

      {/* Simple footer */}
      <footer className="border-t border-slate-200 bg-white mt-8">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between text-xs text-slate-500">
          <p>2024 SkillSwap - Academic Project</p>
          <div className="flex gap-4">
            <Link href="/marketplace" className="hover:text-slate-700">Marketplace</Link>
            <Link href="/login" className="hover:text-slate-700">Login</Link>
            <Link href="/signup" className="hover:text-slate-700">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
