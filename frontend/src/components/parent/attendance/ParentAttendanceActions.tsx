import { MessageSquarePlus, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export function ParentAttendanceActions() {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4">
      <p className="mr-auto text-sm text-muted-foreground">
        Có câu hỏi về chuyên cần hoặc muốn giải trình vắng mặt?
      </p>
      <Link
        href="/parent/feedbacks/create"
        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-700 active:scale-95"
      >
        <MessageSquarePlus className="h-4 w-4" />
        Gửi phản hồi nhà trường
      </Link>
      <Link
        href="/parent/feedbacks"
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-muted active:scale-95"
      >
        <HelpCircle className="h-4 w-4" />
        Xem phản hồi cũ
      </Link>
    </div>
  );
}
