'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, ArrowRight, User } from 'lucide-react';
import { AttributeSlider } from '@/components/AttributeSlider';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { getAttributes, analyzeProfile, AttributeScores, getCurrentUser, logout } from '@/lib/api';
import Link from 'next/link';

const EXAM_GROUPS = [
  { id: 1, name: 'I Qrup — Riyaziyyat, Fizika', description: 'Kompüter elmləri · Mühəndislik' },
  { id: 2, name: 'II Qrup — Biologiya, Kimya', description: 'Tibb · Biologiya · Kimya' },
  { id: 3, name: 'III Qrup — Ədəbiyyat, Tarix', description: 'Filologiya · Tarix · Hüquq' },
  { id: 4, name: 'IV Qrup — Coğrafiya, İqtisadiyyat', description: 'İqtisadiyyat · Biznes' },
  { id: 5, name: 'V Qrup — İncəsənət, Bədən Tərbiyəsi', description: 'İncəsənət · Musiqi · İdman' },
];

const ATTRIBUTE_CATEGORIES = [
  {
    name: 'Ümumi və Yumşaq Bacarıqlar',
    hint: 'Düşüncə tərzi, ünsiyyət və şəxsi keyfiyyətlər',
    keywords: ['thinking', 'reasoning', 'problem', 'creativity', 'communication', 'teamwork', 'leadership', 'patience', 'attention', 'learning', 'empathy', 'speaking', 'awareness', 'adaptability', 'management', 'detail', 'habit', 'interaction', 'curiosity', 'logical', 'abstract']
  },
  {
    name: 'Elm və Riyaziyyat',
    hint: 'Məntiqi və təbiət elmləri ilə bağlı bacarıqlar',
    keywords: ['math', 'biology', 'chemistry', 'physics', 'science', 'scientific', 'laboratory', 'anatomy', 'medical', 'research', 'experiment', 'nature']
  },
  {
    name: 'Texnologiya və Mühəndislik',
    hint: 'Proqramlaşdırma, sistem və texniki maraqlar',
    keywords: ['programming', 'technology', 'coding', 'software', 'engineering', 'hardware', 'network', 'database', 'cybersecurity', 'ai', 'data', 'algorithm', 'system', 'debugging', 'machine']
  },
  {
    name: 'Biznes və Sosial Sahə',
    hint: 'İdarəetmə, maliyyə, hüquq və sosial yönümlü bacarıqlar',
    keywords: ['business', 'economic', 'entrepreneurship', 'finance', 'market', 'management', 'social', 'helping', 'child', 'psychology', 'sociology', 'history', 'law', 'diplomacy', 'teaching']
  },
  {
    name: 'İncəsənət, Dil və Coğrafiya',
    hint: 'Yaradıcı, dil və məkan düşüncəsi bacarıqları',
    keywords: ['art', 'creative', 'visual', 'design', 'music', 'rhythm', 'language', 'writing', 'reading', 'geography', 'environmental', 'travel', 'sports', 'physical']
  },
  {
    name: 'Digər Bacarıqlar',
    hint: 'Yuxarıdakı kateqoriyalara düşməyən əlavə xüsusiyyətlər',
    keywords: []
  }
];

const formatAttributeName = (attr: string) => {
  return attr.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

export default function HomePage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [attributes, setAttributes] = useState<string[]>([]);
  const [scores, setScores] = useState<AttributeScores>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{name: string, email: string} | null>(null);

  useEffect(() => {
    if (selectedGroup) {
      loadAttributes(selectedGroup);
    }
  }, [selectedGroup]);

  useEffect(() => {
    getCurrentUser().then(u => {
      if(u) setUser(u);
    });
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  const loadAttributes = async (groupId: number) => {
    try {
      const attrs = await getAttributes(groupId);
      setAttributes(attrs);
      setScores({});
    } catch (err) {
      setError('Xüsusiyyətlər yüklənərkən xəta baş verdi.');
      console.error(err);
    }
  };

  const handleScoreChange = (attribute: string, value: number) => {
    setScores(prev => ({ ...prev, [attribute]: value }));
  };

  const handleAddAttribute = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const attr = e.target.value;
    if (attr && !scores.hasOwnProperty(attr)) {
      setScores(prev => ({ ...prev, [attr]: 3 }));
    }
    e.target.value = ""; 
  };

  const handleRemoveAttribute = (attribute: string) => {
    setScores(prev => {
      const newScores = { ...prev };
      delete newScores[attribute];
      return newScores;
    });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!selectedGroup) {
        setError('Zəhmət olmasa, imtahan qrupunu seçin.');
        return;
      }
      
      if (Object.keys(scores).length === 0) {
        setError('Zəhmət olmasa ən azı bir xüsusiyyət seçin.');
        return;
      }

      sessionStorage.setItem('examGroup', selectedGroup.toString());
      sessionStorage.setItem('attributes', JSON.stringify(scores));

      const result = await analyzeProfile(selectedGroup, scores);
      sessionStorage.setItem('analysisResult', JSON.stringify(result));

      router.push('/results');
    } catch (err) {
      setError('Analiz zamanı xəta baş verdi.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetTest = () => {
    setStep(1);
    setSelectedGroup(null);
    setAttributes([]);
    setScores({});
    setError(null);
  };

  return (
    <div className="min-h-screen bg-navy text-text-body relative overflow-x-hidden font-sans">
      <div className="bg-glow-gold"></div>
      <div className="bg-glow-blue"></div>

      <header className="px-6 py-6 md:px-10 lg:px-12 border-b border-surface-border sticky top-0 bg-navy/80 backdrop-blur-md z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gold flex items-center justify-center rounded-[10px] shadow-lg shadow-gold/20">
              <span className="font-serif text-2xl font-bold text-navy">AI</span>
            </div>
            <div>
              <h1 className="text-[22px] font-serif text-white leading-tight">Abituriyent AI</h1>
              <p className="text-[10px] text-gold uppercase tracking-[0.10em] font-bold mt-0.5">Karyera Məsləhətçisi</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/profile" className="flex items-center gap-2 group transition-colors">
                  <span className="text-sm font-medium text-white/80 group-hover:text-gold hidden sm:block">{user.name}</span>
                  <div className="w-10 h-10 rounded-full border border-gold-border flex items-center justify-center bg-gold-surface text-gold shadow-[0_0_15px_rgba(212,175,55,0.1)] group-hover:bg-gold/20 transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center text-red-400 hover:text-red-300 text-[11px] uppercase tracking-widest font-bold transition-colors border-l border-white/10 pl-4 h-6"
                >
                   Çıxış
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-5">
                <Link href="/login" className="text-white/70 hover:text-white font-bold text-[11px] uppercase tracking-widest transition-colors">
                  Giriş
                </Link>
                <Link href="/register" className="bg-gold hover:bg-gold-600 text-navy px-5 py-2.5 rounded-lg font-bold text-[11px] uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                  Qeydiyyat
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-16">
        <div className="flex justify-center mb-20 relative">
          <div className="flex items-center justify-between w-64 relative z-10">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-500 ${step >= 1 ? 'bg-gold text-navy shadow-gold/20' : 'card-glass text-white/30'}`}>1</div>
              <span className={`text-[10px] uppercase tracking-[0.10em] font-bold ${step >= 1 ? 'text-gold' : 'text-white/30'}`}>Qrup</span>
            </div>

            <div className={`absolute top-5 left-10 right-[50%] h-[1px] -z-10 transition-colors duration-500 ${step >= 2 ? 'bg-gradient-to-r from-gold to-gold/50' : 'bg-white/10'}`}></div>
            <div className={`absolute top-5 left-[50%] right-10 h-[1px] -z-10 transition-colors duration-500 ${step >= 3 ? 'bg-gradient-to-r from-gold/50 to-gold' : 'bg-white/10'}`}></div>

            <div className="flex flex-col items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-500 ${step >= 2 ? 'bg-gold text-navy shadow-gold/20' : 'card-glass text-white/30'}`}>2</div>
              <span className={`text-[10px] uppercase tracking-[0.10em] font-bold ${step >= 2 ? 'text-gold' : 'text-white/30'}`}>Test</span>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-500 ${step >= 3 ? 'bg-gold text-navy shadow-gold/20' : 'card-glass text-white/30'}`}>3</div>
              <span className={`text-[10px] uppercase tracking-[0.10em] font-bold ${step >= 3 ? 'text-gold' : 'text-white/30'}`}>Nəticələr</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center text-sm font-medium backdrop-blur-sm">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-serif text-white mb-3 tracking-wide">İmtahan Qrupunu Seçin</h2>
              <p className="text-text-muted text-base">Hansı imtahan qrupunda iştirak edirsiniz?</p>
            </div>

            <div className="grid gap-5">
              {EXAM_GROUPS.map((group) => {
                const isActive = selectedGroup === group.id;
                return (
                  <button
                    key={group.id}
                    onClick={() => {
                      setSelectedGroup(group.id);
                      setTimeout(() => setStep(2), 200);
                    }}
                    className={`group w-full p-6 lg:p-7 rounded-xl border text-left transition-all duration-300 flex items-center justify-between ${
                      isActive
                        ? 'card-glass-active shadow-[0_10px_30px_rgba(212,175,55,0.05)]'
                        : 'card-glass hover:bg-surface-hover hover:border-gold/20'
                    }`}
                  >
                    <div>
                      <h3 className={`text-xl lg:text-2xl font-serif transition-colors mb-1 ${isActive ? 'text-white' : 'text-white/90 group-hover:text-white'}`}>
                        {group.name}
                      </h3>
                      <p className={`text-sm tracking-wide font-medium transition-colors ${isActive ? 'text-gold' : 'text-text-muted group-hover:text-white/50'}`}>
                        {group.description}
                      </p>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-gold text-navy' : 'bg-white/5 text-white/30 group-hover:bg-gold/20 group-hover:text-gold'}`}>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-16 text-center">
              <p className="text-[10px] text-gold/40 uppercase tracking-[0.15em] font-bold">Abituriyent AI — Dərin Analitik Sistem</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-serif text-white mb-3">Xüsusiyyətlər</h2>
              <p className="text-text-muted text-base">Xarakterinizə uyğun xüsusiyyətləri seçin və dəyərləndirin</p>
            </div>

            <div className="card-glass p-5 md:p-6 lg:p-8 rounded-2xl shadow-xl space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 p-4 rounded-xl border border-gold/20 bg-gold-surface">
                  <p className="text-[10px] font-bold text-gold uppercase tracking-[0.12em] mb-1">Addım 1</p>
                  <p className="text-sm text-white/90">Kateqoriyadan bir xüsusiyyət seçin.</p>
                </div>
                <div className="md:col-span-1 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                  <p className="text-[10px] font-bold text-gold uppercase tracking-[0.12em] mb-1">Addım 2</p>
                  <p className="text-sm text-white/90">Seçdiyiniz xüsusiyyət üçün 1-5 arası bal verin.</p>
                </div>
                <div className="md:col-span-1 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                  <p className="text-[10px] font-bold text-gold uppercase tracking-[0.12em] mb-1">Addım 3</p>
                  <p className="text-sm text-white/90">Bal verdikdən sonra nəticələrə keçin.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-serif text-white">Xüsusiyyət Əlavə Et</h3>
                    <span className="text-[10px] text-gold uppercase tracking-[0.10em] font-bold">Mövcud: {attributes.length}</span>
                  </div>

                  <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                    {ATTRIBUTE_CATEGORIES.map((category, index, array) => {
                      let categoryAttrs: string[];

                      if (index === array.length - 1) {
                        const previousKeywords = array.slice(0, index).flatMap(c => c.keywords);
                        categoryAttrs = attributes
                          .filter(attr => !previousKeywords.some(kw => attr.includes(kw)))
                          .filter(attr => !scores.hasOwnProperty(attr));
                      } else {
                        categoryAttrs = attributes
                          .filter(attr => category.keywords.some(kw => attr.includes(kw)))
                          .filter(attr => !scores.hasOwnProperty(attr));
                      }

                      if (categoryAttrs.length === 0) return null;

                      return (
                        <div key={category.name} className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
                          <div>
                            <p className="text-[10px] font-bold text-gold uppercase tracking-[0.10em]">{category.name}</p>
                            <p className="text-xs text-text-muted mt-1">{category.hint}</p>
                          </div>

                          <select
                            className="w-full p-3 bg-navy-dark border border-white/10 rounded-lg text-white text-sm focus:ring-1 focus:ring-gold focus:border-gold outline-none transition-colors appearance-none"
                            onChange={handleAddAttribute}
                            defaultValue=""
                          >
                            <option value="" disabled>Seçmək üçün toxunun</option>
                            {categoryAttrs.map(attr => (
                              <option key={attr} value={attr} className="bg-navy">
                                {formatAttributeName(attr)}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                    <div>
                      <h3 className="text-lg font-serif text-white">Seçilən Xüsusiyyətlər</h3>
                      <p className="text-xs text-text-muted mt-1">Nə qədər çox və düzgün qiymətləndirsəniz, analiz bir o qədər dəqiq olar.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-serif text-gold leading-none">{Object.keys(scores).length}</p>
                      <p className="text-[10px] text-white/50 uppercase tracking-[0.10em] font-bold mt-1">Seçim</p>
                    </div>
                  </div>

                  {Object.keys(scores).length === 0 ? (
                    <div className="text-center py-14 px-6 rounded-xl border border-dashed border-white/15 text-text-muted bg-white/[0.02]">
                      Hələ xüsusiyyət seçilməyib. Sol tərəfdəki kateqoriyalardan başlayın.
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {Object.keys(scores).map((attr) => (
                        <div key={attr} className="relative p-5 border border-white/10 rounded-xl bg-white/[0.02]">
                          <button
                            onClick={() => handleRemoveAttribute(attr)}
                            className="absolute top-4 right-4 text-white/20 hover:text-red-400 font-bold transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-400/10"
                            aria-label="Xüsusiyyəti sil"
                          >
                            ✕
                          </button>
                          <div className="pr-8">
                            <AttributeSlider
                              attribute={attr}
                              value={scores[attr] || 3}
                              onChange={(value) => handleScoreChange(attr, value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-10 items-center">
              <button
                onClick={() => setStep(1)}
                className="text-[11px] font-bold text-white/50 hover:text-white uppercase tracking-widest transition-colors"
              >
                ← Geri
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-8 py-4 bg-gold text-navy rounded-xl font-bold uppercase text-[11px] tracking-[0.10em] hover:bg-[#ebd281] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner message="" />
                    <span className="opacity-80">Analiz edilir...</span>
                  </>
                ) : (
                  <>
                    Nəticələrə Keçid
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            
             <div className="mt-12 text-center">
               <button
                 onClick={resetTest}
                 className="text-[10px] text-white/20 hover:text-white/50 transition-colors uppercase tracking-[0.15em] font-bold"
               >
                 Testi sıfırla
               </button>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
