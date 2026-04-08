'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Star, TrendingUp } from 'lucide-react';
import { ResultCard } from '@/components/ResultCard';
import ReactMarkdown from 'react-markdown';

interface AttributeBreakdown {
  [key: string]: {
    user_score: number;
    required_score: number;
    difference: number;
  };
}

interface MatchResult {
  major_name: string;
  match_percentage: number;
  attribute_breakdown: AttributeBreakdown;
}

interface AnalysisResult {
  matches: MatchResult[];
  ai_review: string;
}

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [examGroup, setExamGroup] = useState<number | null>(null);

  useEffect(() => {
    // Load results from sessionStorage
    const storedResult = sessionStorage.getItem('analysisResult');
    const storedGroup = sessionStorage.getItem('examGroup');

    if (storedResult) {
      setResult(JSON.parse(storedResult));
    } else {
      // No results, redirect to home
      router.push('/');
    }

    if (storedGroup) {
      setExamGroup(parseInt(storedGroup));
    }
  }, [router]);

  const handleRetake = () => {
    // Clear stored data
    sessionStorage.removeItem('analysisResult');
    sessionStorage.removeItem('examGroup');
    sessionStorage.removeItem('attributes');
    router.push('/');
  };

  const EXAM_GROUP_NAMES: Record<number, string> = {
    1: 'I Qrup - Riyaziyyat, Fizika',
    2: 'II Qrup - Biologiya, Kimya',
    3: 'III Qrup - Ədəbiyyat, Tarix',
    4: 'IV Qrup - Coğrafiya, İqtisadiyyat',
    5: 'V Qrup - İncəsənət, Bədən Tərbiyəsi',
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handleRetake}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Geri
            </button>
            <h1 className="text-xl font-bold text-gray-900">Nəticələr</h1>
            <button
              onClick={handleRetake}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
            >
              <RefreshCw className="w-4 h-4" />
              Yenidən
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Exam Group Info */}
        {examGroup && (
          <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-100">
            <div className="flex items-center gap-2 text-primary-700">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">{EXAM_GROUP_NAMES[examGroup]}</span>
            </div>
          </div>
        )}

        {/* Top Match Highlight */}
        {result.matches.length > 0 && (
          <div className="mb-8 p-6 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl text-white">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-6 h-6 fill-yellow-300 text-yellow-300" />
              <h2 className="text-lg font-medium opacity-90">Ən Yüksək Uyğunluq</h2>
            </div>
            <p className="text-3xl font-bold mb-2">
              {result.matches[0].major_name}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-white/20 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-1000"
                  style={{ width: `${result.matches[0].match_percentage}%` }}
                />
              </div>
              <span className="text-2xl font-bold">
                {result.matches[0].match_percentage}%
              </span>
            </div>
          </div>
        )}

        {/* AI Review */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BrainIcon />
            AI Məsləhəti
          </h2>
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="prose prose-sm max-w-none text-black prose-p:text-black prose-headings:text-black prose-strong:text-black">
              <ReactMarkdown>{result.ai_review}</ReactMarkdown>
            </div>
          </div>
        </div>

        {/* All Matches */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Bütün Tövsiyələr
          </h2>
          <div className="grid gap-4">
            {result.matches.map((match, index) => (
              <ResultCard
                key={match.major_name}
                match={match}
                rank={index + 1}
              />
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          <p className="font-medium mb-1">⚠️ Vacib Qeyd:</p>
          <p>
            Bu nəticələr psixometrik profilinizə əsasən hazırlanmış tövsiyələrdir.
            Yekun qərar verməzdən əvvəl universitetlərin tələblərini,
            ixtisaslar haqqında ətraflı məlumatı və şəxsi maraqlarınızı nəzərə alın.
          </p>
        </div>
        
        <div className="mt-8 flex gap-4 w-full">
            <Link
              href="/"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md flex items-center justify-center border-none uppercase text-sm tracking-wider"
            >
              YENİDƏN TƏHLİL ET
            </Link>
            <Link
              href="/profile"
              className="flex-1 bg-white text-gray-700 font-bold py-4 px-6 rounded-xl hover:bg-gray-50 hover:text-black transition-all flex items-center justify-center border border-gray-200 uppercase text-sm tracking-wider shadow-sm"
            >
              NƏTİCƏLƏRİM
            </Link>
         </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t bg-white">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>Abituriyent AI © 2026 - Azərbaycan universitetləri üçün karyera məsləhətçisi</p>
        </div>
      </footer>
    </div>
  );
}

function BrainIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  );
}
