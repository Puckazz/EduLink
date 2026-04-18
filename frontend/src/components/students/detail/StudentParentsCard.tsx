import { Mail, Phone, UserRound, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { StudentParentDetail } from '@/types/student';

interface StudentParentsCardProps {
  parents: StudentParentDetail[];
  isLoading: boolean;
  errorMessage: string | null;
  onRetry: () => void;
}

const RELATIONSHIP_LABEL: Record<string, string> = {
  CHA: 'CHA',
  ME: 'MẸ',
  NGUOI_GIAM_HO: 'GIÁM HỘ',
};

const RELATIONSHIP_COLOR: Record<string, string> = {
  CHA: 'bg-slate-800 text-white',
  ME: 'bg-pink-500 text-white',
  NGUOI_GIAM_HO: 'bg-purple-600 text-white',
};

export function StudentParentsCard({
  parents,
  isLoading,
  errorMessage,
  onRetry,
}: StudentParentsCardProps) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-600" />
          <h2 className="text-base font-bold tracking-tight text-slate-900">
            Thông tin phụ huynh
          </h2>
        </div>

        {errorMessage ? (
          <ErrorState message={errorMessage} onRetry={onRetry} />
        ) : isLoading ? (
          <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            Đang tải dữ liệu...
          </p>
        ) : parents.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            Chưa có phụ huynh liên kết.
          </p>
        ) : (
          <div className="space-y-3">
            {parents.map((parent) => {
              const relKey = parent.relationship as string;
              const relLabel = RELATIONSHIP_LABEL[relKey] ?? relKey;
              const relColor = RELATIONSHIP_COLOR[relKey] ?? 'bg-slate-600 text-white';

              return (
                <div
                  key={parent.parent_id}
                  className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 hover:bg-slate-50 transition-colors"
                >
                  {/* Avatar */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                    <UserRound className="h-4 w-4" />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <p className="font-semibold text-slate-900 text-sm">
                        {parent.full_name}
                      </p>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider ${relColor}`}
                      >
                        {relLabel}
                      </span>
                    </div>

                    <div className="space-y-1 text-[13px] text-slate-600">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{parent.phone}</span>
                      </div>
                      {parent.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{parent.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
