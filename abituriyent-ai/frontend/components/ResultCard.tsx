'use client';

import React from 'react';

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

interface ResultCardProps {
  match: MatchResult;
  rank: number;
}

export function ResultCard({ match, rank }: ResultCardProps) {
  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-bold">
            {rank}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {match.major_name}
            </h3>
            <p className="text-sm text-gray-500">İxtisas üzrə uyğunluq</p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-full font-bold ${getMatchColor(match.match_percentage)}`}>
          {match.match_percentage}%
        </div>
      </div>

      {/* Match percentage bar */}
      <div className="mb-4">
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${getBarColor(match.match_percentage)} match-bar`}
            style={{ width: `${match.match_percentage}%` }}
          />
        </div>
      </div>

      {/* Attribute breakdown */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Xüsusiyyətlər üzrə uyğunluq:</h4>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {Object.entries(match.attribute_breakdown).slice(0, 10).map(([attr, scores]) => (
            <div
              key={attr}
              className={`flex justify-between items-center text-sm p-2 rounded ${
                scores.difference === 0 ? 'bg-green-50' :
                scores.difference <= 1 ? 'bg-yellow-50' :
                'bg-red-50'
              }`}
            >
              <span className="text-gray-600 capitalize truncate" title={attr.replace(/_/g, ' ')}>
                {attr.replace(/_/g, ' ')}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{scores.user_score}</span>
                <span className="text-gray-400">/</span>
                <span className="text-gray-500">{scores.required_score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
