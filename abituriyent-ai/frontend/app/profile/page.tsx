'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, ArrowLeft, Clock, Award, CheckCircle } from 'lucide-react';
import { getUserResults, getCurrentUser } from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{name: string, email: string} | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCurrentUser().then(u => {
      if (!u) {
        router.push('/login');
      } else {
        setUser(u);
        getUserResults().then(res => {
          setResults(res || []);
          setIsLoading(false);
        });
      }
    });
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy text-text-body relative overflow-x-hidden font-sans flex items-center justify-center">
        <div className="bg-glow-gold"></div>
        <div className="bg-glow-blue"></div>
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy text-text-body relative overflow-x-hidden font-sans">
      <div className="bg-glow-gold"></div>
      <div className="bg-glow-blue"></div>

      <header className="px-6 py-6 md:px-10 lg:px-12 border-b border-surface-border sticky top-0 bg-navy/80 backdrop-blur-md z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-white/50 group-hover:bg-gold/20 group-hover:text-gold transition-all duration-300">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-white/50 group-hover:text-white uppercase tracking-widest transition-colors">Ana Səhifə</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-white/80">{user?.name}</span>
            <div className="w-10 h-10 rounded-full border border-gold-border flex items-center justify-center bg-gold-surface text-gold shadow-[0_0_15px_rgba(212,175,55,0.1)]">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-10 text-center relative z-10">
          <h1 className="text-4xl font-serif text-white mb-3">Nəticələrim</h1>
          <p className="text-text-muted text-base">Əvvəlki analitik profilləşdirmə tarixçəniz</p>
        </div>

        {results.length === 0 ? (
          <div className="text-center card-glass relative z-10 p-12 rounded-2xl flex flex-col items-center justify-center">
            <Clock className="w-16 h-16 text-white/20 mb-4" />
            <h3 className="text-xl font-serif text-white mb-2">Hələ Nəticə Yoxdur</h3>
            <p className="text-text-muted mb-6">Siz hələ heç bir ixtisas analizi etməmisiniz.</p>
            <Link href="/" className="px-6 py-3 bg-gold hover:text-white text-navy rounded-xl font-bold uppercase text-[10px] tracking-[0.15em] hover:bg-[#ebd281] transition-colors shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              Təhlilə Başla
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 relative z-10">
            {results.map((res: any, index: number) => (
              <div key={index} className="card-glass p-6 lg:p-8 rounded-2xl border border-white/5 hover:border-gold/30 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <span className="text-[10px] font-bold text-gold uppercase tracking-[0.10em] px-3 py-1 bg-gold/10 rounded-md border border-gold/20">
                         Qrup {res.exam_group}
                       </span>
                       <span className="text-sm text-white/40 font-medium">
                         {new Date(res.created_at).toLocaleDateString('az-AZ', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                    <div className="mt-2">
                        <span className="text-xs font-bold text-white/50 uppercase tracking-widest block mb-1">Ən Uyğun İxtisas</span>
                        <h3 className="text-2xl font-serif text-white flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-gold" /> {res.top_major}
                        </h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-navy-dark p-4 rounded-xl border border-white/5 md:w-48 justify-between">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1 mx-auto block text-center">Uyğunluq</span>
                       <span className="text-xl font-bold text-gold mx-auto block text-center">{Number(res.match_percentage).toFixed(1)}%</span>
                    </div>
                    <Award className="w-8 h-8 text-gold opacity-50" />
                  </div>
                </div>
                
                <div className="mt-4 pt-6 border-t border-white/5">
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3">AI Ekspert Rəyi <span className="opacity-50 lowercase tracking-normal ml-1 border-l border-white/10 pl-2">qısa xülasə</span></p>
                  <p className="text-sm text-text-muted leading-relaxed line-clamp-4">
                    {res.ai_review}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}