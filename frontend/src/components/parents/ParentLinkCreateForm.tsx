'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useAssignParentMutation } from '@/hooks/mutations/useAssignParentMutation';
import { useStudents } from '@/components/students/hooks/useStudents';
import { useParents } from '@/components/parents/hooks/useParents';
import {
  parentAssignSchema,
  defaultParentAssignValues,
  type ParentAssignFormValues,
} from '@/utils/parent-link-form.schema';
import { Link2, Search, User, CheckCircle2, UserRound, UsersRound } from 'lucide-react';

const RELATIONSHIP_OPTIONS = [
  { value: 'CHA', label: 'Cha', icon: User },
  { value: 'ME', label: 'Mẹ', icon: UserRound },
  { value: 'NGUOI_GIAM_HO', label: 'Giám hộ', icon: UsersRound },
];

export function ParentLinkCreateForm() {
  const [studentSearch, setStudentSearch] = useState('');
  const [parentSearch, setParentSearch] = useState('');
  const [relationship, setRelationship] = useState<'CHA' | 'ME' | 'NGUOI_GIAM_HO'>('CHA');
  
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false);

  const studentRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click - simplified inline implementation
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

  const { data: studentsData, isLoading: isStudentsLoading } = useStudents({
    currentPage: 1,
    pageSize: 100,
    search: studentSearch,
    majorId: '',
    status: '',
    sort: 'created_desc',
  });

  const { rows: parents, isLoading: isParentsLoading } = useParents({
    currentPage: 1,
    pageSize: 100,
    search: parentSearch,
    status: '',
    relationship: '',
    sort: 'created_desc',
  });

  const assignMutation = useAssignParentMutation({
    onSuccess: () => {
      form.reset(defaultParentAssignValues);
      setStudentSearch('');
      setParentSearch('');
      setRelationship('CHA');
    },
  });

  const students = useMemo(() => studentsData?.data || [], [studentsData]);

  const selectedStudent = students.find(
    (s) => s.student_id === form.watch('studentId'),
  );
  const selectedParent = parents.find(
    (p) => p.parent_id === form.watch('parentId'),
  );

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
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-6 text-blue-700">
        <Link2 className="h-5 w-5" />
        <h3 className="text-lg font-bold text-foreground">Tạo liên kết mới</h3>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Student Selection */}
          <div className="space-y-4">
            <Label className="font-semibold text-sm text-foreground">1. Chọn Sinh viên</Label>
            <div className="relative" ref={studentRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Nhập MSSV hoặc họ tên..."
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    setIsStudentDropdownOpen(true);
                  }}
                  onFocus={() => setIsStudentDropdownOpen(true)}
                  className="pl-9 h-11"
                />
              </div>
              
              {isStudentDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-60 overflow-auto">
                  {isStudentsLoading ? (
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
                          className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                          onClick={() => {
                            form.setValue('studentId', student.student_id);
                            form.clearErrors('studentId');
                            setStudentSearch(student.full_name);
                            setIsStudentDropdownOpen(false);
                          }}
                        >
                          <div className="font-medium">{student.full_name}</div>
                          <div className="text-xs text-muted-foreground">{student.student_code}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {selectedStudent ? (
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 flex gap-4 mt-2">
                <div className="w-12 h-12 rounded-lg bg-teal-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  <User className="h-6 w-6 text-teal-600" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-800 truncate">
                    {selectedStudent.full_name}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 truncate">
                    MSSV: {selectedStudent.student_code} {selectedStudent.class ? `• ${selectedStudent.class}` : ''}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50/50 border border-dashed border-slate-200 p-4 flex items-center justify-center h-[5.5rem] mt-2 text-sm text-slate-400 italic">
                Chưa chọn sinh viên...
              </div>
            )}
            
            {form.formState.errors.studentId && (
              <p className="text-xs text-destructive mt-1">
                {form.formState.errors.studentId.message}
              </p>
            )}
          </div>

          {/* Parent Selection */}
          <div className="space-y-4">
            <Label className="font-semibold text-sm text-foreground">2. Chọn Phụ huynh</Label>
            <div className="relative" ref={parentRef}>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Nhập Email hoặc SĐT..."
                  value={parentSearch}
                  onChange={(e) => {
                    setParentSearch(e.target.value);
                    setIsParentDropdownOpen(true);
                  }}
                  onFocus={() => setIsParentDropdownOpen(true)}
                  className="pl-9 h-11"
                />
              </div>

              {isParentDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-60 overflow-auto">
                  {isParentsLoading ? (
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
                          className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                          onClick={() => {
                            form.setValue('parentId', parent.parent_id);
                            form.clearErrors('parentId');
                            setParentSearch(parent.full_name);
                            setIsParentDropdownOpen(false);
                          }}
                        >
                          <div className="font-medium">{parent.full_name}</div>
                          <div className="text-xs text-muted-foreground">{parent.phone}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {selectedParent ? (
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 flex gap-4 mt-2">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-800 truncate">
                    {selectedParent.full_name}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 truncate">
                    SĐT: {selectedParent.phone}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50/50 border border-dashed border-slate-200 p-4 flex items-center justify-center h-[5.5rem] mt-2 text-sm text-slate-400 italic">
                Chưa chọn phụ huynh...
              </div>
            )}

            {form.formState.errors.parentId && (
              <p className="text-xs text-destructive mt-1">
                {form.formState.errors.parentId.message}
              </p>
            )}
          </div>

          {/* Relationship Selection */}
          <div className="space-y-4 flex flex-col justify-between">
            <div>
              <Label className="font-semibold text-sm text-foreground">3. Xác nhận Quan hệ</Label>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {RELATIONSHIP_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = relationship === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRelationship(option.value as 'CHA' | 'ME' | 'NGUOI_GIAM_HO')}
                      className={`flex flex-col items-center justify-center gap-2 h-[5.5rem] rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <Icon className={`h-6 w-6 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span className="text-xs font-semibold">
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-auto pt-4">
              <Button
                type="submit"
                className="w-full gap-2 bg-blue-700 hover:bg-blue-800 h-11 text-base font-semibold shadow-sm"
                disabled={assignMutation.isPending || !form.watch('studentId') || !form.watch('parentId')}
              >
                {assignMutation.isPending ? (
                  <Spinner className="h-5 w-5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
                Thiết lập liên kết ngay
              </Button>
            </div>
          </div>
        </div>
      </form>

      {assignMutation.isError && (
        <div className="rounded bg-destructive/10 p-3 text-sm text-destructive mt-4">
          Lỗi khi thiết lập liên kết. Vui lòng thử lại.
        </div>
      )}
    </div>
  );
}
