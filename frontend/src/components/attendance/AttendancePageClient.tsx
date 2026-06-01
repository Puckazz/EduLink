'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AttendancePageHeader } from './AttendancePageHeader';
import { AttendanceFilterBar } from './AttendanceFilterBar';
import { AttendanceCourseCard, CourseStatus } from './AttendanceCourseCard';
import { AttendancePagination } from './AttendancePagination';
import { CreateClassSectionDialog } from './CreateClassSectionDialog';
import { EditClassSectionDialog } from './EditClassSectionDialog';
import { ImportClassSectionDialog } from './ImportClassSectionDialog';
import {
  ClassSectionService,
  ClassSection,
  ClassStatus,
  PaginationMeta,
} from '@/services/attendance.service';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useDebounce } from '@/hooks/useDebounce';

const PAGE_SIZE = 12;

const STATUS_MAP: Record<ClassStatus, CourseStatus> = {
  ONGOING: 'ongoing',
  UPCOMING: 'upcoming',
  FINISHED: 'finished',
};

const STATUS_COLOR: Record<ClassStatus, string> = {
  ONGOING: 'bg-emerald-500',
  UPCOMING: 'bg-indigo-900',
  FINISHED: 'bg-slate-300',
};

function mapSectionToCardProps(s: ClassSection, basePath: string) {
  return {
    id: s.section_id,
    classCode: s.class_code,
    title: s.subject.subject_name,
    subjectCode: s.subject.subject_code,
    teacher: s.teacher_name,
    time: `${s.day_of_week} (${s.start_time} - ${s.end_time})`,
    room: s.room,
    status: STATUS_MAP[s.status],
    topColor: STATUS_COLOR[s.status],
    basePath,
  };
}

export function AttendancePageClient() {
  const { data: profile } = useCurrentUser();
  const isTeacher = profile?.role === 'teacher';
  const isAdmin = profile?.role === 'admin';
  const basePath = isTeacher ? '/teacher/attendance' : '/admin/attendance';

  const [sections, setSections] = useState<ClassSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [termId, setTermId] = useState<number | undefined>(undefined);
  const [academicYearId, setAcademicYearId] = useState<number | undefined>(undefined);
  const [majorId, setMajorId] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const debouncedSearch = useDebounce(search.trim(), 400);

  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingSection, setEditingSection] = useState<ClassSection | null>(null);
  const [deletingSection, setDeletingSection] = useState<ClassSection | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSections = useCallback(
    (
      term?: number,
      year?: number,
      major?: number,
      keyword?: string,
      page = 1,
    ) => {
      setLoading(true);
      setError(null);
      ClassSectionService.getList({
        search: keyword || undefined,
        term_id: term,
        academic_year_id: term ? undefined : year,
        major_id: major,
        page,
        limit: PAGE_SIZE,
      })
        .then((res) => {
          setSections(res.data);
          setPagination(res.pagination);
        })
        .catch(() => setError('Không thể tải danh sách lớp học. Vui lòng thử lại.'))
        .finally(() => setLoading(false));
    },
    [],
  );

  useEffect(() => {
    fetchSections(
      termId,
      academicYearId,
      majorId,
      debouncedSearch,
      currentPage,
    );
  }, [
    fetchSections,
    termId,
    academicYearId,
    majorId,
    debouncedSearch,
    currentPage,
  ]);

  const handleSearchChange = useCallback((value: string) => {
    setCurrentPage(1);
    setSearch(value);
  }, []);

  const handleFilterChange = useCallback(
    (
      newTermId: number | undefined,
      newAcademicYearId: number | undefined,
      newMajorId: number | undefined,
    ) => {
      setCurrentPage(1);
      setTermId(newTermId);
      setAcademicYearId(newAcademicYearId);
      setMajorId(newMajorId);
    },
    [],
  );


  const handleCreated = () => {
    if (currentPage !== 1) {
      setCurrentPage(1);
      return;
    }
    fetchSections(termId, academicYearId, majorId, debouncedSearch, currentPage);
  };

  const handleUpdated = (updated: ClassSection) => {
    setSections((prev) =>
      prev.map((s) => (s.section_id === updated.section_id ? updated : s)),
    );
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSection) return;
    setDeleting(true);
    try {
      await ClassSectionService.remove(deletingSection.section_id);
      setSections((prev) => prev.filter((s) => s.section_id !== deletingSection.section_id));
      if (sections.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        fetchSections(termId, academicYearId, majorId, debouncedSearch, currentPage);
      }
      toast.success(`Đã xóa lớp "${deletingSection.class_code}".`);
    } catch {
      toast.error('Xóa lớp thất bại. Vui lòng thử lại.');
    } finally {
      setDeleting(false);
      setDeletingSection(null);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <AttendancePageHeader
        isAdmin={isAdmin}
        onCreateClick={() => setShowCreate(true)}
        onImportClick={() => setShowImport(true)}
      />
      <AttendanceFilterBar
        search={search}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
      />

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl border border-border bg-muted animate-pulse"
            />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && sections.length === 0 && (
        <div className="rounded-xl border border-border bg-muted/50 p-10 text-center text-sm text-muted-foreground">
          Không có lớp học nào phù hợp với bộ lọc đã chọn.
        </div>
      )}

      {!loading && !error && sections.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {sections.map((section) => (
            <AttendanceCourseCard
              key={section.section_id}
              {...mapSectionToCardProps(section, basePath)}
              isAdmin={isAdmin}
              onEdit={() => setEditingSection(section)}
              onDelete={() => setDeletingSection(section)}
            />
          ))}
        </div>
      )}

      {!loading && !error && pagination && pagination.total_pages > 1 && (
        <AttendancePagination
          currentPage={currentPage}
          totalPages={Math.max(1, pagination.total_pages)}
          isBusy={loading}
          onPageChange={setCurrentPage}
        />
      )}

      <CreateClassSectionDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreated}
      />

      {editingSection && (
        <EditClassSectionDialog
          section={editingSection}
          open={!!editingSection}
          onClose={() => setEditingSection(null)}
          onUpdated={handleUpdated}
        />
      )}

      <ImportClassSectionDialog
        open={showImport}
        onClose={() => setShowImport(false)}
        onImported={handleCreated}
      />

      <AlertDialog
        open={!!deletingSection}
        onOpenChange={(v: boolean) => !v && setDeletingSection(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa lớp học</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa lớp{' '}
              <strong className="text-slate-800">{deletingSection?.class_code}</strong>
              {' '}({deletingSection?.subject.subject_name})?{' '}
              Toàn bộ buổi học và bản ghi điểm danh liên quan sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleting ? 'Đang xóa...' : 'Xóa lớp'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
