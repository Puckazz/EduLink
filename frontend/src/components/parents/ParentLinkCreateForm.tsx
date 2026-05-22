'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useAssignParentMutation } from '@/hooks/mutations/useAssignParentMutation';
import { useStudents } from '@/components/students/hooks/useStudents';
import { useParents } from '@/components/parents/hooks/useParents';
import { useDebounce } from '@/hooks/useDebounce';
import {
  parentAssignSchema,
  defaultParentAssignValues,
  type ParentAssignFormValues,
} from '@/utils/parent-link-form.schema';
import type { Student } from '@/types/student';
import { Link2, Search, User, CheckCircle2, UserRound, UsersRound } from 'lucide-react';

const SEARCH_MIN_CHARS = 2;
const SEARCH_DEBOUNCE_MS = 400;

const RELATIONSHIP_OPTIONS = [
  { value: 'CHA', label: 'Cha', icon: User },
  { value: 'ME', label: 'Mẹ', icon: UserRound },
  { value: 'NGUOI_GIAM_HO', label: 'Giám hộ', icon: UsersRound },
];

export function ParentLinkCreateForm() {
  const [studentInputText, setStudentInputText] = useState('');
  const [parentInputText, setParentInputText] = useState('');

  const debouncedStudentSearch = useDebounce(studentInputText.trim(), SEARCH_DEBOUNCE_MS);
  const debouncedParentSearch  = useDebounce(parentInputText.trim(),  SEARCH_DEBOUNCE_MS);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedParent,  setSelectedParent]  = useState<{ parent_id: number; full_name: string; phone: string } | null>(null);

  const [relationship, setRelationship] = useState<'CHA' | 'ME' | 'NGUOI_GIAM_HO'>('CHA');
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const [isParentDropdownOpen,  setIsParentDropdownOpen]  = useState(false);

  const studentRef = useRef<HTMLDivElement>(null);
  const parentRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (studentRef.current && !studentRef.current.contains(event.target as Node)) {
        setIsStudentDropdownOpen(false);
      }
      if (parentRef.current && !parentRef.current.contains(event.target as Node)) {
        setIsParentDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const form = useForm<ParentAssignFormValues>({
    resolver: zodResolver(parentAssignSchema),
    defaultValues: defaultParentAssignValues,
  });

  const studentSearchEnabled = debouncedStudentSearch.length >= SEARCH_MIN_CHARS;
  const parentSearchEnabled  = debouncedParentSearch.length  >= SEARCH_MIN_CHARS;

  const { data: studentsData, isLoading: isStudentsLoading, isFetching: isStudentsFetching } = useStudents({
    currentPage: 1,
    pageSize: 10,
    search: studentSearchEnabled ? debouncedStudentSearch : '',
    majorId: '',
    status: '',
    sort: 'created_desc',
  });

  const { rows: parents, isLoading: isParentsLoading, isFetching: isParentsFetching } = useParents({
    currentPage: 1,
    pageSize: 10,
    search: parentSearchEnabled ? debouncedParentSearch : '',
    status: '',
    relationship: '',
    sort: 'created_desc',
  });

  const assignMutation = useAssignParentMutation({
    onSuccess: () => {
      form.reset(defaultParentAssignValues);
      setStudentInputText('');
      setParentInputText('');
      setSelectedStudent(null);
      setSelectedParent(null);
      setRelationship('CHA');
    },
  });

  const students = useMemo(() => studentsData?.data || [], [studentsData]);

  const onSubmit = async (values: ParentAssignFormValues) => {
    if (values.studentId && values.parentId) {
      assignMutation.mutate({
        studentId: values.studentId,
        parentId: values.parentId,
        relationship,
      });
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-xs">
      <div className="flex items-center gap-2.5 border-b border-border px-6 py-4">
        <Link2 className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Tạo liên kết mới</h3>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              1. Chọn Sinh viên
            </p>
            <div className="relative" ref={studentRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                {(isStudentsLoading || isStudentsFetching) && studentSearchEnabled && (
                  <Spinner className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" />
                )}
                <Input
                  type="text"
                  placeholder="Nhập ít nhất 2 ký tự..."
                  value={studentInputText}
                  onChange={(e) => {
                    setStudentInputText(e.target.value);
                    setIsStudentDropdownOpen(true);
                  }}
                  onFocus={() => setIsStudentDropdownOpen(true)}
                  className="pl-9 pr-9 bg-muted/40"
                />
              </div>

              {isStudentDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-lg shadow-md max-h-60 overflow-auto">
                  {!studentSearchEnabled ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Nhập ít nhất {SEARCH_MIN_CHARS} ký tự để tìm kiếm
                    </div>
                  ) : isStudentsLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Spinner className="h-4 w-4" />
                    </div>
                  ) : students.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Không tìm thấy sinh viên
                    </div>
                  ) : (
                    <ul className="py-1">
                      {students.map((student) => (
                        <li
                          key={student.student_id}
                          className="px-3 py-2.5 hover:bg-muted cursor-pointer text-sm"
                          onClick={() => {
                            form.setValue('studentId', student.student_id);
                            form.clearErrors('studentId');
                            setSelectedStudent(student);
                            setStudentInputText(student.full_name);
                            setIsStudentDropdownOpen(false);
                          }}
                        >
                          <div className="font-medium text-foreground">{student.full_name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{student.student_code}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {selectedStudent ? (
              <div className="rounded-lg border border-border bg-muted/30 p-3 flex gap-3">
                <div className="h-8 w-8 rounded-full bg-teal-100 flex-shrink-0 flex items-center justify-center">
                  <User className="h-4 w-4 text-teal-600" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-foreground text-sm truncate">
                    {selectedStudent.full_name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">
                    MSSV: {selectedStudent.student_code}
                    {selectedStudent.class ? ` • ${selectedStudent.class}` : ''}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 flex items-center justify-center h-[3.75rem] text-sm text-muted-foreground italic">
                Chưa chọn sinh viên...
              </div>
            )}

            {form.formState.errors.studentId && (
              <p className="text-xs text-destructive">
                {form.formState.errors.studentId.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              2. Chọn Phụ huynh
            </p>
            <div className="relative" ref={parentRef}>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                {(isParentsLoading || isParentsFetching) && parentSearchEnabled && (
                  <Spinner className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" />
                )}
                <Input
                  type="text"
                  placeholder="Nhập ít nhất 2 ký tự..."
                  value={parentInputText}
                  onChange={(e) => {
                    setParentInputText(e.target.value);
                    setIsParentDropdownOpen(true);
                  }}
                  onFocus={() => setIsParentDropdownOpen(true)}
                  className="pl-9 pr-9 bg-muted/40"
                />
              </div>

              {isParentDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-lg shadow-md max-h-60 overflow-auto">
                  {!parentSearchEnabled ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Nhập ít nhất {SEARCH_MIN_CHARS} ký tự để tìm kiếm
                    </div>
                  ) : isParentsLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Spinner className="h-4 w-4" />
                    </div>
                  ) : parents.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Không tìm thấy phụ huynh
                    </div>
                  ) : (
                    <ul className="py-1">
                      {parents.map((parent) => (
                        <li
                          key={parent.parent_id}
                          className="px-3 py-2.5 hover:bg-muted cursor-pointer text-sm"
                          onClick={() => {
                            form.setValue('parentId', parent.parent_id);
                            form.clearErrors('parentId');
                            setSelectedParent(parent);
                            setParentInputText(parent.full_name);
                            setIsParentDropdownOpen(false);
                          }}
                        >
                          <div className="font-medium text-foreground">{parent.full_name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{parent.phone}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {selectedParent ? (
              <div className="rounded-lg border border-border bg-muted/30 p-3 flex gap-3">
                <div className="h-8 w-8 rounded-full bg-sky-100 flex-shrink-0 flex items-center justify-center">
                  <User className="h-4 w-4 text-sky-600" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-foreground text-sm truncate">
                    {selectedParent.full_name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">
                    SĐT: {selectedParent.phone}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 flex items-center justify-center h-[3.75rem] text-sm text-muted-foreground italic">
                Chưa chọn phụ huynh...
              </div>
            )}

            {form.formState.errors.parentId && (
              <p className="text-xs text-destructive">
                {form.formState.errors.parentId.message}
              </p>
            )}
          </div>

          <div className="space-y-3 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                3. Xác nhận Quan hệ
              </p>
              <div className="grid grid-cols-3 gap-2">
                {RELATIONSHIP_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = relationship === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setRelationship(option.value as 'CHA' | 'ME' | 'NGUOI_GIAM_HO')
                      }
                      className={`flex flex-col items-center justify-center gap-1.5 h-[3.75rem] rounded-lg border-2 transition-all text-xs font-semibold ${
                        isSelected
                          ? 'border-primary bg-primary/5 text-primary shadow-sm'
                          : 'border-border bg-background hover:border-primary/40 hover:bg-muted/40 text-muted-foreground'
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}
                      />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={
                assignMutation.isPending ||
                !form.watch('studentId') ||
                !form.watch('parentId')
              }
            >
              {assignMutation.isPending ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Thiết lập liên kết ngay
            </Button>
          </div>
        </div>

        {assignMutation.isError && (
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive mt-4">
            Lỗi khi thiết lập liên kết. Vui lòng thử lại.
          </div>
        )}
      </form>
    </div>
  );
}
