'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MOCK_USERS, SKILL_CATEGORIES } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function MarketplacePage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filtered = MOCK_USERS.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || u.full_name.toLowerCase().includes(q) || u.skills_offered.some((s) => s.toLowerCase().includes(q));
    const matchesCategory = selectedCategory === 'All' || u.skills_offered.some((s) => s.toLowerCase().includes(selectedCategory.split(' ')[0].toLowerCase()));
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="page-header">Skills Marketplace</h1>

      {/* Search */}
      <div className="card mb-4">
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search skills or users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-sm"
            />
          </div>
        </div>
        <div className="flex gap-1 flex-wrap">
          {SKILL_CATEGORIES.slice(0, 8).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-2 py-0.5 text-xs rounded border',
                selectedCategory === cat
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-slate-500 mb-3">{filtered.length} users found</p>

      {/* Users grid */}
      <div className="grid grid-cols-3 gap-3">
        {filtered.map((user) => (
          <div key={user.id} className="card">
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
              <div className="ml-auto flex items-center gap-0.5">
                <span className="text-xs text-slate-600">{user.avg_rating}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-2 line-clamp-2">{user.bio}</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {user.skills_offered.slice(0, 2).map((s) => (
                <span key={s} className="skill-tag-blue">{s}</span>
              ))}
              {user.skills_offered.length > 2 && (
                <span className="text-xs text-slate-400">+{user.skills_offered.length - 2}</span>
              )}
            </div>
            <div className="flex gap-2">
              <Link href={`/profile/${user.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs">View</Button>
              </Link>
              <Link href={`/booking?mentor=${user.id}`} className="flex-1">
                <Button size="sm" className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white">Book</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
