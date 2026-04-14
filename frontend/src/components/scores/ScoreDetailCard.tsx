import { useEffect, useState } from 'react';
import { Edit3, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ScorebookRow } from '@/types/score';

interface DetailFormState {
  assignment: string;
  midterm: string;
  final: string;
  note: string;
}

interface ScoreDetailCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRow: ScorebookRow | null;
  onSave: (
    studentId: number,
    payload: {
      assignment: number | null;
      midterm: number | null;
      final: number | null;
      note: string;
    },
  ) => void;
}

function toInputValue(value: number | null): string {
  return value === null ? '' : String(value);
}

function parseScoreInput(value: string): number | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const numeric = Number(trimmed);

  if (Number.isNaN(numeric) || numeric < 0 || numeric > 10) {
    throw new Error('Điểm phải là số từ 0 đến 10.');
  }

  return Math.round(numeric * 100) / 100;
}

export function ScoreDetailCard({
  open,
  onOpenChange,
  selectedRow,
  onSave,
}: ScoreDetailCardProps) {
  const [formState, setFormState] = useState<DetailFormState>({
    assignment: '',
    midterm: '',
    final: '',
    note: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedRow) {
      setFormState({ assignment: '', midterm: '', final: '', note: '' });
      return;
    }

    setFormState({
      assignment: toInputValue(selectedRow.assignment),
      midterm: toInputValue(selectedRow.midterm),
      final: toInputValue(selectedRow.final),
      note: selectedRow.note,
    });
    setErrorMessage(null);
  }, [selectedRow]);

  if (!selectedRow) {
    return null;
  }

  const handleSave = () => {
    try {
      onSave(selectedRow.student_id, {
        assignment: parseScoreInput(formState.assignment),
        midterm: parseScoreInput(formState.midterm),
        final: parseScoreInput(formState.final),
        note: formState.note.trim(),
      });
      setErrorMessage(null);
      onOpenChange(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Dữ liệu điểm không hợp lệ.',
      );
    }
  };

  const fieldIdPrefix = `score-edit-${selectedRow.student_id}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Edit3 className="h-4 w-4" />
            Chỉnh sửa điểm: {selectedRow.student_name}
          </DialogTitle>
          <DialogDescription>
            {selectedRow.student_code} • {selectedRow.class_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor={`${fieldIdPrefix}-assignment`}>
                Điểm thường xuyên
              </Label>
              <Input
                id={`${fieldIdPrefix}-assignment`}
                value={formState.assignment}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    assignment: event.target.value,
                  }))
                }
                placeholder="0 - 10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${fieldIdPrefix}-midterm`}>Điểm giữa kỳ</Label>
              <Input
                id={`${fieldIdPrefix}-midterm`}
                value={formState.midterm}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    midterm: event.target.value,
                  }))
                }
                placeholder="0 - 10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${fieldIdPrefix}-final`}>Điểm cuối kỳ</Label>
              <Input
                id={`${fieldIdPrefix}-final`}
                value={formState.final}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    final: event.target.value,
                  }))
                }
                placeholder="0 - 10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${fieldIdPrefix}-note`}>Ghi chú</Label>
            <Input
              id={`${fieldIdPrefix}-note`}
              value={formState.note}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, note: event.target.value }))
              }
              placeholder="Ghi chú chỉnh sửa"
            />
          </div>

          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button className="gap-2" onClick={handleSave}>
              <Save className="h-4 w-4" />
              Lưu chỉnh sửa
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
