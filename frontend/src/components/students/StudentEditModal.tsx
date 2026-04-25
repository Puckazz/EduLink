'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useUpdateStudentMutation } from '@/components/students/hooks/useUpdateStudentMutation';
import {
  mapStudentToUpdateForm,
  mapUpdateStudentFormToDto,
} from '@/components/students/mappers/update-student.mapper';
import { useStudentEditModalStore } from '@/components/students/stores/useStudentEditModalStore';
import {
  updateStudentFormSchema,
  type UpdateStudentFormValues,
} from '@/components/students/utils/update-student-form.schema';
import { cn } from '@/lib/utils';
import type { Student, StudentStatusValue } from '@/types/student';
import { useMajors } from '@/components/students/hooks/useMajors';

interface StudentEditModalProps {
  student: Student | null;
}

const STATUS_OPTIONS: Array<{ label: string; value: StudentStatusValue }> = [
  { label: 'Đang học', value: 'DANG_HOC' },
  { label: 'Bảo lưu', value: 'BAO_LUU' },
  { label: 'Đình chỉ', value: 'DINH_CHI' },
];

function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Không thể cập nhật sinh viên. Vui lòng thử lại.';
  }

  const responseMessage = error.response?.data?.message;

  if (Array.isArray(responseMessage) && responseMessage.length > 0) {
    return responseMessage[0];
  }

  if (typeof responseMessage === 'string' && responseMessage.trim()) {
    return responseMessage;
  }

  return 'Không thể cập nhật sinh viên. Vui lòng thử lại.';
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-destructive">{message}</p>;
}

function parseDateString(value: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const parsedDate = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
}

function formatDateForApi(value: Date): string {
  return format(value, 'yyyy-MM-dd');
}

export function StudentEditModal({ student }: StudentEditModalProps) {
  const { data: majors = [], isLoading: isMajorsLoading } = useMajors();
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const { isOpen, setOpen, closeModal } = useStudentEditModalStore();

  const form = useForm<UpdateStudentFormValues>({
    resolver: zodResolver(updateStudentFormSchema),
    defaultValues: student ? mapStudentToUpdateForm(student) : undefined,
  });

  useEffect(() => {
    if (student && isOpen) {
      form.reset(mapStudentToUpdateForm(student));
    }
  }, [student, isOpen, form]);

  const updateStudentMutation = useUpdateStudentMutation(student?.student_id || 0, {
    onSuccess: () => {
      toast.success('Cập nhật hồ sơ sinh viên thành công.');
      closeModal();
    },
  });

  const handleSubmit = async (values: UpdateStudentFormValues) => {
    if (!student) return;
    try {
      await updateStudentMutation.mutateAsync(
        mapUpdateStudentFormToDto(values),
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setIsDatePopoverOpen(false);
      if (student) form.reset(mapStudentToUpdateForm(student));
    }
  };

  const isSubmitting = updateStudentMutation.isPending;
  const currentStatus = form.watch('status');
  const currentMajorId = form.watch('major_id');
  const currentDateOfBirth = form.watch('date_of_birth');
  const selectedDateOfBirth = parseDateString(currentDateOfBirth);

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa hồ sơ sinh viên</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin chi tiết của sinh viên.
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
            <Popover
              open={isDatePopoverOpen}
              onOpenChange={setIsDatePopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  id="date_of_birth"
                  type="button"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !selectedDateOfBirth && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDateOfBirth
                    ? format(selectedDateOfBirth, 'dd/MM/yyyy', { locale: vi })
                    : 'Chọn ngày sinh'}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={selectedDateOfBirth}
                  defaultMonth={selectedDateOfBirth}
                  onSelect={(date) => {
                    form.setValue(
                      'date_of_birth',
                      date ? formatDateForApi(date) : '',
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      },
                    );

                    setIsDatePopoverOpen(false);
                  }}
                  disabled={(date) => date > new Date()}
                  locale={vi}
                  captionLayout="dropdown"
                  fromYear={1950}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
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
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 gap-2">
              {isSubmitting && <Spinner className="size-4" />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
