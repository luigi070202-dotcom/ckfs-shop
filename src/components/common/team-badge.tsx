// src/components/common/team-badge.tsx
import React from 'react';
import { cn } from '@/lib/utils';

const TEAM_COLOR_PALETTE = [
  'bg-red-50 text-red-900 border-red-200',
  'bg-blue-50 text-blue-900 border-blue-200',
  'bg-emerald-50 text-emerald-900 border-emerald-200',
  'bg-amber-50 text-amber-950 border-amber-200',
  'bg-purple-50 text-purple-900 border-purple-200',
  'bg-sky-50 text-sky-950 border-sky-200',
  'bg-teal-50 text-teal-900 border-teal-200',
  'bg-indigo-50 text-indigo-900 border-indigo-200',
  'bg-rose-50 text-rose-900 border-rose-200',
  'bg-orange-50 text-orange-950 border-orange-200',
];

interface TeamBadgeProps {
  team: string;
  className?: string;
}

export function TeamBadge({ team, className }: TeamBadgeProps) {
  let hash = 0;
  for (let i = 0; i < team.length; i++) {
    hash = team.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % TEAM_COLOR_PALETTE.length;
  const colorClass = TEAM_COLOR_PALETTE[colorIndex];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors',
        colorClass,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {team}
    </span>
  );
}