'use client';

import { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserCard } from '@/components/user-card';
import { MOCK_USERS } from '@/lib/mock-data';
import Link from 'next/link';

const POPULAR_SEARCHES = ['Python', 'UI Design', 'Guitar', 'Yoga', 'Bharatanatyam', 'Java', 'Figma', 'Photography'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<typeof MOCK_USERS>([]);
  const [searched, setSearched] = useState(false);

  function handleSearch(q: string = query) {
    const lq = q.toLowerCase();
    const found = MOCK_USERS.filter((u) =>
      u.full_name.toLowerCase().includes(lq) ||
      u.skills_offered.some((s) => s.toLowerCase().includes(lq)) ||
      u.bio.toLowerCase().includes(lq)
    );
    setResults(found);
    setSearched(true);
    setQuery(q);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Search</h1>
        <p className="text-sm text-slate-500 mt-1">Find users by skill, name, or keyword</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search skills or people..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button onClick={() => handleSearch()} className="bg-blue-600 hover:bg-blue-700 text-white">Search</Button>
        </div>

        {!searched && (
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500 mb-2">Popular searches</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSearch(s)}
                  className="text-xs px-3 py-1.5 border border-slate-200 rounded-full text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {searched && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-600">
              {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
            </p>
            <button onClick={() => { setSearched(false); setQuery(''); }} className="text-xs text-blue-600 hover:underline">Clear</button>
          </div>
          {results.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {results.map((u) => <UserCard key={u.id} user={u} />)}
            </div>
          ) : (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-lg">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No results found for &quot;{query}&quot;</p>
              <p className="text-sm text-slate-400 mt-1">Try a different keyword</p>
              <Link href="/marketplace">
                <Button variant="outline" size="sm" className="mt-4 gap-1.5">
                  Browse all <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {!searched && (
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="section-title mb-4">Suggested for you</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {MOCK_USERS.slice(0, 4).map((u) => <UserCard key={u.id} user={u} />)}
          </div>
        </div>
      )}
    </div>
  );
}
