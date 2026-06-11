'use client';

import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  Phone,
  Mail,
  User,
  ShieldCheck,
  GraduationCap,
  Building2,
  UserRound,
} from 'lucide-react';
import { ParentService } from '@/services/parent.service';

const STUDENT_STATUS_LABEL: Record<
  string,
  'Đang học' | 'Bảo lưu' | 'Đình chỉ'
> = {
  DANG_HOC: 'Đang học',
  BAO_LUU: 'Bảo lưu',
  DINH_CHI: 'Đình chỉ',
};

interface ParentDetailDialogProps {
  isOpen: boolean;
  parentId: number | null;
  onOpenChange: (open: boolean) => void;
}

function ParentDetailSkeleton() {
  return (
    <div className="space-y-6 pb-4">
      <div className="space-y-3">
        <Skeleton className="h-5 w-44" />
        <div className="grid gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:grid-cols-2">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex items-start gap-3">
              <Skeleton className="mt-0.5 size-4 shrink-0 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-36" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-5 w-48" />
        {Array.from({ length: 2 }, (_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="size-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Không thể tải chi tiết phụ huynh.';
  }

  const responseMessage = error.response?.data?.message;

  if (Array.isArray(responseMessage) && responseMessage.length > 0) {
    return responseMessage[0];
  }

  if (typeof responseMessage === 'string' && responseMessage.trim()) {
    return responseMessage;
  }

  return 'Không thể tải chi tiết phụ huynh.';
}

export function ParentDetailDialog({
  isOpen,
  parentId,
  onOpenChange,
}: ParentDetailDialogProps) {
  const parentDetailQuery = useQuery({
    queryKey: ['parent-detail', parentId],
    queryFn: () => ParentService.getById(parentId as number),
    enabled: isOpen && parentId != null,
  });

  const accountStatus = parentDetailQuery.data?.is_locked
    ? 'Đã khóa'
    : parentDetailQuery.data?.is_active
      ? 'Đã kích hoạt'
      : 'Chưa kích hoạt';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Chi tiết phụ huynh</DialogTitle>
          <DialogDescription>
            Thông tin tài khoản và danh sách học sinh đang liên kết.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-2">
          {parentDetailQuery.isPending ? (
            <ParentDetailSkeleton />
          ) : parentDetailQuery.error ? (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 py-8 text-center text-sm text-red-600">
              {getApiErrorMessage(parentDetailQuery.error)}
            </div>
          ) : parentDetailQuery.data ? (
            <div className="space-y-6 pb-4">
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
                  <UserRound className="size-4 text-primary" />
                  Thông tin cá nhân
                </h3>
                <div className="grid gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <User className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Họ tên
                      </p>
                      <p className="font-semibold text-foreground">
                        {parentDetailQuery.data.full_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Số điện thoại
                      </p>
                      <p className="font-semibold text-foreground">
                        {parentDetailQuery.data.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Email
                      </p>
                      <p
                        className="font-semibold text-foreground truncate max-w-[200px]"
                        title={parentDetailQuery.data.email ?? ''}
                      >
                        {parentDetailQuery.data.email ?? '-'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Tên đăng nhập
                      </p>
                      <p className="font-semibold text-foreground">
                        {parentDetailQuery.data.username ?? '-'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Trạng thái tài khoản
                      </p>
                      <StatusBadge status={accountStatus} />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
                  <GraduationCap className="size-4 text-primary" />
                  Sinh viên liên kết (
                  {parentDetailQuery.data.students?.length || 0})
                </h3>
                {parentDetailQuery.data.students &&
                parentDetailQuery.data.students.length > 0 ? (
                  <div className="space-y-3">
                    {parentDetailQuery.data.students.map((student) => (
                      <div
                        key={student.student_id}
                        className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <User className="size-5" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground">
                              {student.full_name}
                            </p>
                            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="font-medium">
                                {student.student_code}
                              </span>
                              {student.class && (
                                <>
                                  <span className="size-1 rounded-full bg-border" />
                                  <span className="flex items-center gap-1">
                                    <Building2 className="size-3" />
                                    {student.class}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <StatusBadge
                          status={
                            STUDENT_STATUS_LABEL[student.status] ||
                            'Đang học'
                          }
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-8">
                    <GraduationCap className="mb-2 size-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      Chưa có sinh viên nào được liên kết.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
