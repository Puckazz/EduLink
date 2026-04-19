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
  action: 'PUBLISH' | 'UNPUBLISH';
  onCancel: () => void;
  onConfirm: () => void;
}

export function PublishConfirmDialog({
  open,
  targetCount,
  action,
  onCancel,
  onConfirm,
}: PublishConfirmDialogProps) {
  const isPublish = action === 'PUBLISH';

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => (!value ? onCancel() : undefined)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isPublish ? 'Xác nhận công bố' : 'Xác nhận hủy công bố'} bảng điểm
          </DialogTitle>
          <DialogDescription>
            Bạn sắp {isPublish ? 'công bố' : 'hủy công bố'} điểm cho {targetCount} bản ghi.{' '}
            {isPublish
              ? 'Sau khi công bố, phụ huynh có thể nhìn thấy kết quả. Hãy kiểm tra kỹ trước khi xác nhận.'
              : 'Sau khi hủy công bố, phụ huynh sẽ không còn nhìn thấy các điểm số này nữa.'}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button 
            variant={isPublish ? 'default' : 'destructive'} 
            onClick={onConfirm}
          >
            Xác nhận {isPublish ? 'công bố' : 'hủy công bố'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
