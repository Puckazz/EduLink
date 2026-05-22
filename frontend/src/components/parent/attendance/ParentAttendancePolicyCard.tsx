import { Info, CheckCircle2, XCircle } from 'lucide-react';

export function ParentAttendancePolicyCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between gap-4">
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Info className="h-5 w-5 text-foreground" />
          <h3 className="text-base font-bold text-foreground">Quy Định Chuyên Cần</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed font-medium">
          Sinh viên cần có mặt tối thiểu{' '}
          <strong className="text-slate-700">80%</strong> số buổi học để đủ điều
          kiện dự thi cuối kỳ. Khi tỷ lệ chuyên cần dưới ngưỡng cho phép, sinh
          viên sẽ bị cấm thi và nhận điểm&nbsp;F môn học đó.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" /> ≥ 80% — Đạt yêu cầu
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
          <XCircle className="h-3.5 w-3.5" /> &lt; 80% — Cấm thi
        </span>
      </div>
    </div>
  );
}
