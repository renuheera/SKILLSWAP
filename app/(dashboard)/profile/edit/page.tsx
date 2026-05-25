'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function EditProfilePage() {
  const { profile, user, refreshProfile } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    location: '',
    avatar_url: '',
  });
  const [skillsOffered, setSkillsOffered] = useState<string[]>([]);
  const [skillsWanted, setSkillsWanted] = useState<string[]>([]);
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>([]);
  const [newSkillOffered, setNewSkillOffered] = useState('');
  const [newSkillWanted, setNewSkillWanted] = useState('');
  const [newPortfolio, setNewPortfolio] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        avatar_url: profile.avatar_url || '',
      });
      setSkillsOffered(profile.skills_offered || []);
      setSkillsWanted(profile.skills_wanted || []);
      setPortfolioLinks(profile.portfolio_links || []);
    }
  }, [profile]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function addSkillOffered() {
    const s = newSkillOffered.trim();
    if (s && !skillsOffered.includes(s)) {
      setSkillsOffered([...skillsOffered, s]);
      setNewSkillOffered('');
    }
  }

  function addSkillWanted() {
    const s = newSkillWanted.trim();
    if (s && !skillsWanted.includes(s)) {
      setSkillsWanted([...skillsWanted, s]);
      setNewSkillWanted('');
    }
  }

  function addPortfolioLink() {
    const l = newPortfolio.trim();
    if (l && !portfolioLinks.includes(l)) {
      setPortfolioLinks([...portfolioLinks, l]);
      setNewPortfolio('');
    }
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      ...formData,
      skills_offered: skillsOffered,
      skills_wanted: skillsWanted,
      portfolio_links: portfolioLinks,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) {
      toast.error('Failed to save profile');
    } else {
      await refreshProfile();
      toast.success('Profile saved');
      router.push('/profile');
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Edit Profile</h1>
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5" size="sm">
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saving...' : 'Save changes'}
        </Button>
      </div>

      {/* Basic info */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <h2 className="section-title">Basic Information</h2>
        <div>
          <Label htmlFor="full_name" className="text-sm font-medium text-slate-700">Full name</Label>
          <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="location" className="text-sm font-medium text-slate-700">Location</Label>
          <Input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="City, State" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="avatar_url" className="text-sm font-medium text-slate-700">Avatar URL</Label>
          <Input id="avatar_url" name="avatar_url" value={formData.avatar_url} onChange={handleChange} placeholder="https://..." className="mt-1.5" />
          {formData.avatar_url && (
            <img src={formData.avatar_url} alt="Preview" className="w-12 h-12 rounded-full object-cover mt-2 border border-slate-200" />
          )}
        </div>
        <div>
          <Label htmlFor="bio" className="text-sm font-medium text-slate-700">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell others about yourself, your background and teaching style..."
            rows={4}
            className="mt-1.5"
          />
          <p className="text-xs text-slate-400 mt-1">{formData.bio.length}/500 characters</p>
        </div>
      </div>

      {/* Skills offered */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <h2 className="section-title">Skills I can teach</h2>
        <div className="flex gap-2">
          <Input
            value={newSkillOffered}
            onChange={(e) => setNewSkillOffered(e.target.value)}
            placeholder="e.g. Bharatanatyam, Python..."
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillOffered())}
          />
          <Button variant="outline" size="sm" onClick={addSkillOffered} className="flex-shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skillsOffered.map((skill) => (
            <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">
              {skill}
              <button onClick={() => setSkillsOffered(skillsOffered.filter((s) => s !== skill))}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Skills wanted */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <h2 className="section-title">Skills I want to learn</h2>
        <div className="flex gap-2">
          <Input
            value={newSkillWanted}
            onChange={(e) => setNewSkillWanted(e.target.value)}
            placeholder="e.g. Guitar, UI Design..."
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillWanted())}
          />
          <Button variant="outline" size="sm" onClick={addSkillWanted} className="flex-shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skillsWanted.map((skill) => (
            <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-xs font-medium">
              {skill}
              <button onClick={() => setSkillsWanted(skillsWanted.filter((s) => s !== skill))}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Portfolio links */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <h2 className="section-title">Portfolio & Links</h2>
        <div className="flex gap-2">
          <Input
            value={newPortfolio}
            onChange={(e) => setNewPortfolio(e.target.value)}
            placeholder="https://..."
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPortfolioLink())}
          />
          <Button variant="outline" size="sm" onClick={addPortfolioLink} className="flex-shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-1.5">
          {portfolioLinks.map((link) => (
            <div key={link} className="flex items-center justify-between text-sm bg-slate-50 px-3 py-2 rounded border border-slate-200">
              <span className="text-blue-600 truncate">{link}</span>
              <button onClick={() => setPortfolioLinks(portfolioLinks.filter((l) => l !== link))} className="text-slate-400 hover:text-red-500 ml-2">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pb-6">
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
          {saving ? 'Saving...' : 'Save changes'}
        </Button>
        <Button variant="outline" onClick={() => router.push('/profile')}>Cancel</Button>
      </div>
    </div>
  );
}
