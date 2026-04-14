import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PublishConfirmDialogProps {
  open: boolean;
  targetCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export function PublishConfirmDialog({
  open,
  targetCount,
  onCancel,
  onConfirm,
}: PublishConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => (!value ? onCancel() : undefined)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận công bố bảng điểm</DialogTitle>
          <DialogDescription>
            Bạn sắp công bố điểm cho {targetCount} học sinh. Sau khi công bố,
            phụ huynh có thể nhìn thấy kết quả. Hãy kiểm tra kỹ trước khi xác
            nhận.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button onClick={onConfirm}>Xác nhận công bố</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
