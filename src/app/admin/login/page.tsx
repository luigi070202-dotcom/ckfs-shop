// src/app/admin/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Lock, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Invalid credentials');
      }

      router.push('/admin/inventory');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-white">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="relative w-12 h-12 mx-auto overflow-hidden rounded">
            <Image
              src="/ckfs-logo.jpg"
              alt="CKFS Logo"
              fill
              sizes="48px"
              className="object-contain"
            />
          </div>
          <h1 className="text-lg font-black uppercase tracking-tight">
            CKFS Admin Portal
          </h1>
          <p className="text-xs text-zinc-400 font-mono">
            Restricted inventory & orders management
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-lg text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-300">Authorized Email</Label>
            <Input
              type="email"
              required
              placeholder="owner@ckfs.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-zinc-950 border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus-visible:ring-zinc-700"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-300">Password</Label>
            <Input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-zinc-950 border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus-visible:ring-zinc-700"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold uppercase tracking-wider h-10 mt-2"
          >
            <Lock className="w-3.5 h-3.5 mr-1.5" />
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </Button>
        </form>
      </div>
    </div>
  );
}