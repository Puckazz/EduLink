'use client';

import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useCreateStudentMutation } from '@/components/students/hooks/useCreateStudentMutation';
import { mapCreateStudentFormToDto } from '@/components/students/mappers/create-student.mapper';
import { useStudentCreateModalStore } from '@/components/students/stores/useStudentCreateModalStore';
import {
  createStudentFormSchema,
  defaultCreateStudentFormValues,
  type CreateStudentFormValues,
} from '@/components/students/utils/create-student-form.schema';
import type { Major } from '@/types/major';
import type { StudentStatusValue } from '@/types/student';

interface StudentCreateModalProps {
  majors: Major[];
  isMajorsLoading: boolean;
}

const STATUS_OPTIONS: Array<{ label: string; value: StudentStatusValue }> = [
  { label: 'Đang học', value: 'DANG_HOC' },
  { label: 'Bảo lưu', value: 'BAO_LUU' },
  { label: 'Đình chỉ', value: 'DINH_CHI' },
];

function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Không thể tạo sinh viên. Vui lòng thử lại.';
  }

  const responseMessage = error.response?.data?.message;

  if (Array.isArray(responseMessage) && responseMessage.length > 0) {
    return responseMessage[0];
  }

  if (typeof responseMessage === 'string' && responseMessage.trim()) {
    return responseMessage;
  }

  return 'Không thể tạo sinh viên. Vui lòng thử lại.';
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-destructive">{message}</p>;
}

export function StudentCreateModal({
  majors,
  isMajorsLoading,
}: StudentCreateModalProps) {
  const { isOpen, setOpen, closeModal } = useStudentCreateModalStore();

  const form = useForm<CreateStudentFormValues>({
    resolver: zodResolver(createStudentFormSchema),
    defaultValues: defaultCreateStudentFormValues,
  });

  const createStudentMutation = useCreateStudentMutation({
    onSuccess: () => {
      toast.success('Thêm sinh viên mới thành công.');
      form.reset(defaultCreateStudentFormValues);
      closeModal();
    },
  });

  const handleSubmit = async (values: CreateStudentFormValues) => {
    try {
      await createStudentMutation.mutateAsync(
        mapCreateStudentFormToDto(values),
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);

    if (!open) {
      form.reset(defaultCreateStudentFormValues);
    }
  };

  const isSubmitting = createStudentMutation.isPending;
  const currentStatus = form.watch('status');
  const currentMajorId = form.watch('major_id');

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm sinh viên mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin cơ bản để tạo hồ sơ sinh viên.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="grid gap-4 md:grid-cols-2"
        >
          <div className="space-y-2">
            <Label htmlFor="student_code">Mã sinh viên *</Label>
            <Input id="student_code" {...form.register('student_code')} />
            <FieldError message={form.formState.errors.student_code?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Họ và tên *</Label>
            <Input id="full_name" {...form.register('full_name')} />
            <FieldError message={form.formState.errors.full_name?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="student@edulink.edu.vn"
              {...form.register('email')}
            />
            <FieldError message={form.formState.errors.email?.message} />
          </div>

          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select
              value={currentStatus}
              onValueChange={(value) => {
                form.setValue('status', value as StudentStatusValue, {
                  shouldDirty: true,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={form.formState.errors.status?.message} />
          </div>

          <div className="space-y-2">
            <Label>Chuyên ngành</Label>
            <Select
              value={currentMajorId}
              onValueChange={(value) => {
                form.setValue('major_id', value, {
                  shouldDirty: true,
                });
              }}
              disabled={isMajorsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn chuyên ngành" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Chưa chọn</SelectItem>
                {majors.map((major) => (
                  <SelectItem
                    key={major.major_id}
                    value={String(major.major_id)}
                  >
                    {major.major_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={form.formState.errors.major_id?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Ngày sinh</Label>
            <Input
              id="date_of_birth"
              type="date"
              {...form.register('date_of_birth')}
            />
            <FieldError
              message={form.formState.errors.date_of_birth?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="class">Lớp</Label>
            <Input id="class" placeholder="12A1" {...form.register('class')} />
            <FieldError message={form.formState.errors.class?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="study_year">Năm học</Label>
            <Input
              id="study_year"
              placeholder="1 - 20"
              {...form.register('study_year')}
            />
            <FieldError message={form.formState.errors.study_year?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cohort">Khóa</Label>
            <Input id="cohort" placeholder="K20" {...form.register('cohort')} />
            <FieldError message={form.formState.errors.cohort?.message} />
          </div>

          <DialogFooter className="md:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Spinner className="size-4" />}
              Tạo sinh viên
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
