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
  ME: 'bg-rose-500 text-white',
  NGUOI_GIAM_HO: 'bg-violet-600 text-white',
};

const AVATAR_COLOR: Record<string, string> = {
  CHA: 'bg-slate-100 text-slate-600',
  ME: 'bg-rose-50 text-rose-500',
  NGUOI_GIAM_HO: 'bg-violet-50 text-violet-600',
};

export function StudentParentsCard({
  parents,
  isLoading,
  errorMessage,
  onRetry,
}: StudentParentsCardProps) {
  return (
    <Card className="border-slate-100 bg-white shadow-sm">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Users className="h-4 w-4" />
          </div>
          <h2 className="text-base font-bold tracking-tight text-slate-900">
            Thông tin phụ huynh
          </h2>
        </div>

        <div className="border-t border-slate-100" />

        {errorMessage ? (
          <ErrorState message={errorMessage} onRetry={onRetry} />
        ) : isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : parents.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
            Chưa có phụ huynh liên kết.
          </p>
        ) : (
          <div className="space-y-3">
            {parents.map((parent) => {
              const relKey = parent.relationship as string;
              const relLabel = RELATIONSHIP_LABEL[relKey] ?? relKey;
              const relColor = RELATIONSHIP_COLOR[relKey] ?? 'bg-slate-600 text-white';
              const avatarColor = AVATAR_COLOR[relKey] ?? 'bg-slate-100 text-slate-600';

              return (
                <div
                  key={parent.parent_id}
                  className="flex items-start gap-3.5 rounded-xl border border-slate-100 bg-slate-50/60 p-4 hover:border-slate-200 hover:bg-white transition-all duration-150"
                >
                  {/* Avatar */}
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${avatarColor}`}>
                    <UserRound className="h-4.5 w-4.5" />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <p className="font-semibold text-slate-900 text-sm">
                        {parent.full_name}
                      </p>
                      <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wider ${relColor}`}>
                        {relLabel}
                      </span>
                    </div>

                    <div className="space-y-1 text-[12.5px] text-slate-500">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium">{parent.phone}</span>
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
