'use client';

import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@/components/ui/spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ParentService } from '@/services/parent.service';

const RELATIONSHIP_LABEL: Record<
  'CHA' | 'ME' | 'NGUOI_GIAM_HO',
  'Cha' | 'Mẹ' | 'Người giám hộ'
> = {
  CHA: 'Cha',
  ME: 'Mẹ',
  NGUOI_GIAM_HO: 'Người giám hộ',
};

interface ParentDetailDialogProps {
  isOpen: boolean;
  parentId: number | null;
  onOpenChange: (open: boolean) => void;
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chi tiết phụ huynh</DialogTitle>
          <DialogDescription>
            Thông tin tài khoản và danh sách học sinh đang liên kết.
          </DialogDescription>
        </DialogHeader>

        {parentDetailQuery.isPending ? (
          <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
            <Spinner className="size-4" />
            Đang tải dữ liệu...
          </div>
        ) : parentDetailQuery.error ? (
          <p className="py-4 text-sm text-destructive">
            {getApiErrorMessage(parentDetailQuery.error)}
          </p>
        ) : parentDetailQuery.data ? (
          <div className="space-y-4 text-sm">
            <div className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Họ tên
                </p>
                <p className="font-medium text-foreground">
                  {parentDetailQuery.data.full_name}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Số điện thoại
                </p>
                <p className="font-medium text-foreground">
                  {parentDetailQuery.data.phone}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Email
                </p>
                <p className="font-medium text-foreground">
                  {parentDetailQuery.data.email ?? '-'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Tên đăng nhập
                </p>
                <p className="font-medium text-foreground">
                  {parentDetailQuery.data.username ?? '-'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Mối quan hệ
                </p>
                <p className="font-medium text-foreground">
                  {RELATIONSHIP_LABEL[parentDetailQuery.data.relationship]}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Học sinh liên kết
              </p>
              {parentDetailQuery.data.students &&
              parentDetailQuery.data.students.length > 0 ? (
                <div className="space-y-2 rounded-lg border border-border p-3">
                  {parentDetailQuery.data.students.map((student) => (
                    <div
                      key={student.student_id}
                      className="flex items-center justify-between gap-2 rounded-md bg-muted/30 px-3 py-2"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {student.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {student.student_code}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {student.status}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-border px-3 py-4 text-muted-foreground">
                  Chưa có học sinh liên kết.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
