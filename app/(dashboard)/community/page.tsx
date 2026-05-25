'use client';

import { useState } from 'react';
import { ThumbsUp, MessageSquare, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { MOCK_DISCUSSIONS, MOCK_USERS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

const CATEGORIES = ['All', 'General', 'Technology', 'Design', 'Resources', 'Stories'];

export default function CommunityPage() {
  const [discussions, setDiscussions] = useState(MOCK_DISCUSSIONS);
  const [selectedCat, setSelectedCat] = useState('All');
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General' });

  const filtered = discussions.filter((d) => selectedCat === 'All' || d.category === selectedCat);

  function handleNewPost() {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error('Please fill in title and content');
      return;
    }
    const post = {
      id: `new-${Date.now()}`,
      author_id: 'demo',
      title: newPost.title,
      content: newPost.content,
      category: newPost.category,
      likes: 0,
      replies_count: 0,
      author: MOCK_USERS[0],
      created_at: new Date().toISOString(),
    };
    setDiscussions([post, ...discussions]);
    setNewPost({ title: '', content: '', category: 'General' });
    setShowNewPost(false);
    toast.success('Post created');
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-header mb-0">Community Forum</h1>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1" onClick={() => setShowNewPost(!showNewPost)}>
          <Plus className="w-4 h-4" />
          New Post
        </Button>
      </div>

      {/* New post form */}
      {showNewPost && (
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-header mb-0">Create Post</h2>
            <button onClick={() => setShowNewPost(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            <Input
              placeholder="Title"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            />
            <select
              value={newPost.category}
              onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
              className="input-field"
            >
              {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <Textarea
              placeholder="Write your post..."
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              rows={3}
            />
            <div className="flex gap-2">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleNewPost}>Post</Button>
              <Button size="sm" variant="outline" onClick={() => setShowNewPost(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={cn(
              'px-2 py-0.5 text-xs rounded border',
              selectedCat === cat
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-2">
        {filtered.map((disc) => (
          <div key={disc.id} className="card">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs text-slate-400">{disc.category}</span>
            </div>
            <h3 className="text-sm font-medium text-slate-800 mb-1">{disc.title}</h3>
            <p className="text-xs text-slate-500 line-clamp-2 mb-2">{disc.content}</p>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <img src={disc.author.avatar_url} alt={disc.author.full_name} className="w-4 h-4 rounded-full object-cover" />
                <span>{disc.author.full_name}</span>
                <span>· {format(new Date(disc.created_at), 'MMM d')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-0.5">
                  <ThumbsUp className="w-3 h-3" />
                  {disc.likes}
                </span>
                <span className="flex items-center gap-0.5">
                  <MessageSquare className="w-3 h-3" />
                  {disc.replies_count}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
