'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Loader2, PlusCircle, Save, Search } from 'lucide-react';
import { ScoreService } from '@/services/score.service';
import { StudentService } from '@/services/student.service';
import { SubjectService } from '@/services/subject.service';
import { AcademicTermService } from '@/services/academic-term.service';
import { useDebounce } from '@/hooks/useDebounce';
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
import { Textarea } from '@/components/ui/textarea';
import type { AcademicTerm } from '@/types/academic-term';
import type { Student } from '@/types/student';
import type { Subject } from '@/types/subject';

const SEARCH_MIN_CHARS = 2;
const SEARCH_DEBOUNCE_MS = 400;

interface ScoreCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => Promise<void>;
}

interface ScoreFormState {
  studentId: string;
  subjectId: string;
  termId: string;
  assignment: string;
  midterm: string;
  final: string;
  note: string;
}

const initialFormState: ScoreFormState = {
  studentId: '',
  subjectId: '',
  termId: '',
  assignment: '',
  midterm: '',
  final: '',
  note: '',
};

function parseOptionalScore(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const numeric = Number(trimmed);
  if (Number.isNaN(numeric) || numeric < 0 || numeric > 10) {
    throw new Error('Điểm phải là số từ 0 đến 10.');
  }

  return Math.round(numeric * 100) / 100;
}

function getCreateScoreErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 409) {
      return 'Điểm của sinh viên cho môn học và học kỳ này đã tồn tại. Vui lòng chỉnh sửa bản ghi hiện có trong bảng.';
    }

    const responseMessage = error.response?.data?.message;
    if (Array.isArray(responseMessage)) {
      return responseMessage[0] ?? 'Không thể tạo điểm.';
    }

    if (typeof responseMessage === 'string') {
      return responseMessage;
    }

    return 'Không thể tạo điểm. Vui lòng thử lại.';
  }

  return error instanceof Error ? error.message : 'Không thể tạo điểm.';
}

export function ScoreCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: ScoreCreateDialogProps) {
  const [formState, setFormState] = useState<ScoreFormState>(initialFormState);
  const [studentSearch, setStudentSearch] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isSearchingStudents, setIsSearchingStudents] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const studentSearchRef = useRef<HTMLDivElement>(null);

  const debouncedStudentSearch = useDebounce(
    studentSearch.trim(),
    SEARCH_DEBOUNCE_MS,
  );
  const canSearchStudents = debouncedStudentSearch.length >= SEARCH_MIN_CHARS;

  useEffect(() => {
    if (!open) return;

    let isMounted = true;

    async function fetchOptions() {
      setIsLoadingOptions(true);
      setErrorMessage(null);

      try {
        const termsRes = await AcademicTermService.getAll();

        if (!isMounted) return;

        setTerms(termsRes);
      } catch {
        if (isMounted) {
          setErrorMessage('Không thể tải dữ liệu tạo điểm.');
        }
      } finally {
        if (isMounted) setIsLoadingOptions(false);
      }
    }

    void fetchOptions();

    return () => {
      isMounted = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        studentSearchRef.current &&
        !studentSearchRef.current.contains(event.target as Node)
      ) {
        setIsStudentDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (!canSearchStudents) {
      setStudents([]);
      setIsSearchingStudents(false);
      return;
    }

    let isMounted = true;

    async function searchStudents() {
      setIsSearchingStudents(true);

      try {
        const result = await StudentService.getAll({
          search: debouncedStudentSearch,
          limit: 10,
          sort_by: 'full_name',
          sort_order: 'asc',
        });

        if (isMounted) {
          setStudents(result.data);
        }
      } catch {
        if (isMounted) {
          setStudents([]);
          setErrorMessage('Không thể tìm sinh viên.');
        }
      } finally {
        if (isMounted) {
          setIsSearchingStudents(false);
        }
      }
    }

    void searchStudents();

    return () => {
      isMounted = false;
    };
  }, [canSearchStudents, debouncedStudentSearch, open]);

  useEffect(() => {
    if (!open) return;

    const majorId = selectedStudent?.major_id;
    if (!majorId) {
      setSubjects([]);
      setFormState((prev) => ({ ...prev, subjectId: '' }));
      return;
    }

    let isMounted = true;

    async function fetchSubjects() {
      setIsLoadingSubjects(true);
      try {
        const data = await SubjectService.getAllForMajor(majorId);
        if (!isMounted) return;

        setSubjects(data);
        setFormState((prev) => ({ ...prev, subjectId: '' }));
      } catch {
        if (isMounted) {
          setSubjects([]);
          setErrorMessage('Không thể tải môn học theo ngành.');
        }
      } finally {
        if (isMounted) setIsLoadingSubjects(false);
      }
    }

    void fetchSubjects();

    return () => {
      isMounted = false;
    };
  }, [open, selectedStudent?.major_id]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSaving) return;

    onOpenChange(nextOpen);
    if (!nextOpen) {
      setFormState(initialFormState);
      setStudentSearch('');
      setStudents([]);
      setSelectedStudent(null);
      setSubjects([]);
      setErrorMessage(null);
    }
  };

  const handleSave = async () => {
    try {
      setErrorMessage(null);

      if (!formState.studentId || !formState.subjectId || !formState.termId) {
        throw new Error('Vui lòng chọn sinh viên, môn học và học kỳ.');
      }

      setIsSaving(true);

      await ScoreService.createForStudent(Number(formState.studentId), {
        subject_id: Number(formState.subjectId),
        term_id: Number(formState.termId),
        assignment: parseOptionalScore(formState.assignment),
        midterm: parseOptionalScore(formState.midterm),
        final: parseOptionalScore(formState.final),
        note: formState.note.trim() || undefined,
      });

      await onCreated();
      handleOpenChange(false);
    } catch (error) {
      setErrorMessage(getCreateScoreErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const isBusy = isLoadingOptions || isSaving;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <PlusCircle className="h-4 w-4" />
            Thêm điểm mới
          </DialogTitle>
          <DialogDescription>
            Chọn sinh viên, môn học và học kỳ để tạo bản ghi điểm.
          </DialogDescription>
        </DialogHeader>

        {isLoadingOptions ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải dữ liệu...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-3">
                <Label htmlFor="score-create-student">Sinh viên</Label>
                <div className="relative" ref={studentSearchRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    {isSearchingStudents ? (
                      <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                    ) : null}
                    <Input
                      id="score-create-student"
                      value={studentSearch}
                      onChange={(event) => {
                        const value = event.target.value;
                        setStudentSearch(value);
                        setIsStudentDropdownOpen(true);
                        setSelectedStudent(null);
                        setSubjects([]);
                        setFormState((prev) => ({
                          ...prev,
                          studentId: '',
                          subjectId: '',
                        }));
                      }}
                      onFocus={() => setIsStudentDropdownOpen(true)}
                      placeholder="Nhập tên hoặc mã sinh viên..."
                      className="pl-9 pr-9"
                      disabled={isBusy}
                    />
                  </div>

                  {isStudentDropdownOpen ? (
                    <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-popover shadow-md">
                      {!canSearchStudents ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          Nhập ít nhất {SEARCH_MIN_CHARS} ký tự để tìm kiếm
                        </div>
                      ) : isSearchingStudents ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
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
                              className="cursor-pointer px-3 py-2.5 text-sm hover:bg-muted"
                              onClick={() => {
                                setSelectedStudent(student);
                                setStudentSearch(
                                  `${student.full_name} (${student.student_code})`,
                                );
                                setFormState((prev) => ({
                                  ...prev,
                                  studentId: String(student.student_id),
                                  subjectId: '',
                                }));
                                setIsStudentDropdownOpen(false);
                              }}
                            >
                              <div className="font-medium text-foreground">
                                {student.full_name}
                              </div>
                              <div className="mt-0.5 text-xs text-muted-foreground">
                                {student.student_code}
                                {student.class ? ` • ${student.class}` : ''}
                                {student.major?.major_name
                                  ? ` • ${student.major.major_name}`
                                  : ''}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="score-create-subject">Môn học</Label>
                <Select
                  value={formState.subjectId}
                  onValueChange={(subjectId) =>
                    setFormState((prev) => ({ ...prev, subjectId }))
                  }
                  disabled={!selectedStudent || isLoadingSubjects || isBusy}
                >
                  <SelectTrigger id="score-create-subject">
                    <SelectValue
                      placeholder={
                        selectedStudent
                          ? 'Chọn môn học'
                          : 'Chọn sinh viên trước'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem
                        key={subject.subject_id}
                        value={String(subject.subject_id)}
                      >
                        {subject.subject_code} - {subject.subject_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="score-create-term">Học kỳ</Label>
                <Select
                  value={formState.termId}
                  onValueChange={(termId) =>
                    setFormState((prev) => ({ ...prev, termId }))
                  }
                  disabled={isBusy}
                >
                  <SelectTrigger id="score-create-term">
                    <SelectValue placeholder="Chọn học kỳ" />
                  </SelectTrigger>
                  <SelectContent>
                    {terms.map((term) => (
                      <SelectItem key={term.term_id} value={String(term.term_id)}>
                        {term.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="score-create-assignment">
                  Điểm thường xuyên
                </Label>
                <Input
                  id="score-create-assignment"
                  value={formState.assignment}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      assignment: event.target.value,
                    }))
                  }
                  placeholder="0 - 10"
                  disabled={isBusy}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="score-create-midterm">Điểm giữa kỳ</Label>
                <Input
                  id="score-create-midterm"
                  value={formState.midterm}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      midterm: event.target.value,
                    }))
                  }
                  placeholder="0 - 10"
                  disabled={isBusy}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="score-create-final">Điểm cuối kỳ</Label>
                <Input
                  id="score-create-final"
                  value={formState.final}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      final: event.target.value,
                    }))
                  }
                  placeholder="0 - 10"
                  disabled={isBusy}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="score-create-note">Ghi chú</Label>
              <Textarea
                id="score-create-note"
                value={formState.note}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, note: event.target.value }))
                }
                placeholder="Ghi chú thêm"
                disabled={isBusy}
              />
            </div>

            {errorMessage ? (
              <p className="text-sm text-destructive">{errorMessage}</p>
            ) : null}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSaving}
          >
            Hủy
          </Button>
          <Button className="gap-2" onClick={handleSave} disabled={isBusy}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? 'Đang tạo...' : 'Tạo điểm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
