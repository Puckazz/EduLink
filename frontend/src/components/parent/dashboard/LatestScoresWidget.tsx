import Link from 'next/link';
import { BookMarked, ChevronRight } from 'lucide-react';
import type { Score } from '@/types/score';

interface LatestScoresWidgetProps {
  scores: Score[];
  isLoading: boolean;
}

function ScoreBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-sm text-slate-400">—</span>;
  const color =
    value >= 8.5 ? 'bg-emerald-500' :
    value >= 7.0 ? 'bg-blue-500' :
    value >= 5.0 ? 'bg-yellow-500' :
    'bg-red-500';
  return (
    <span
      className={`inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-sm font-bold text-white ${color}`}
    >
      {value % 1 === 0 ? value.toFixed(1) : value}
    </span>
  );
}

export function LatestScoresWidget({ scores, isLoading }: LatestScoresWidgetProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-slate-50 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
            <BookMarked className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-bold text-slate-900">Điểm mới nhất</span>
        </div>
        <Link
          href="/parent/scores"
          className="flex items-center gap-0.5 text-xs font-medium text-slate-400 hover:text-blue-600 transition-colors"
        >
          Xem tất cả <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="flex-1 divide-y divide-slate-50 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : scores.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">Chưa có dữ liệu điểm.</p>
        ) : (
          scores.slice(0, 5).map((score) => (
            <div
              key={score.score_id}
              className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-slate-50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {score.subject?.subject_name ?? `Môn #${score.subject_id}`}
                </p>
                <p className="text-[11px] text-slate-400">
                  {score.term.name}
                </p>
              </div>
              <ScoreBadge value={score.avg} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
