import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Score } from '@/types/score';
import {
  formatScore,
  getScoreBand,
} from '@/components/students/mappers/student-detail.mapper';

interface StudentRecentScoresCardProps {
  scores: Score[];
  isLoading: boolean;
  errorMessage: string | null;
  onRetry: () => void;
}

const BAND_COLORS: Record<string, string> = {
  'A+': 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  A: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  'B+': 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
  B: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
  'C+': 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200',
  C: 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200',
  'D+': 'bg-orange-100 text-orange-700 ring-1 ring-orange-200',
  D: 'bg-orange-100 text-orange-700 ring-1 ring-orange-200',
  F: 'bg-red-100 text-red-700 ring-1 ring-red-200',
};

export function StudentRecentScoresCard({
  scores,
  isLoading,
  errorMessage,
  onRetry,
}: StudentRecentScoresCardProps) {
  return (
    <Card className="border-slate-100 bg-white shadow-sm">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Star className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold tracking-tight text-slate-900">
              Kết quả học tập gần đây
            </h2>
          </div>
          <Button
            variant="ghost"
            className="px-0 text-xs font-semibold text-slate-400 hover:bg-transparent hover:text-slate-600"
            disabled
          >
            Xem tất cả →
          </Button>
        </div>

        {errorMessage ? (
          <ErrorState message={errorMessage} onRetry={onRetry} />
        ) : isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : scores.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
            <p className="text-sm text-slate-400">Chưa có kết quả học tập gần đây.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Tên học phần
                  </th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Số TC
                  </th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Giữa kỳ
                  </th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Cuối kỳ
                  </th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Tổng kết
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {scores.map((score, idx) => {
                  const band = getScoreBand(score.avg);
                  const bandColor = BAND_COLORS[band] ?? 'bg-slate-100 text-slate-600';

                  return (
                    <tr
                      key={score.score_id}
                      className="group hover:bg-blue-50/40 transition-colors"
                    >
                      <td className="px-4 py-3.5 font-medium text-slate-800 group-hover:text-slate-900">
                        {score.subject?.subject_name ?? `Môn #${score.subject_id}`}
                      </td>
                      <td className="px-4 py-3.5 text-center text-slate-500">
                        {(score.subject as any)?.credits ?? (score.subject as any)?.so_tin_chi ?? '-'}
                      </td>
                      <td className="px-4 py-3.5 text-center font-semibold text-slate-700">
                        {formatScore(score.midterm)}
                      </td>
                      <td className="px-4 py-3.5 text-center font-semibold text-slate-700">
                        {formatScore(score.final)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {band === 'Chưa có' ? (
                          <span className="text-xs text-slate-400">-</span>
                        ) : (
                          <span
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${bandColor}`}
                          >
                            {band}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
      <p>{message}</p>
      <Button
        variant="outline"
        size="sm"
        className="border-red-200 text-red-700 hover:bg-red-100"
        onClick={onRetry}
      >
        Thử lại
      </Button>
    </div>
  );
}
