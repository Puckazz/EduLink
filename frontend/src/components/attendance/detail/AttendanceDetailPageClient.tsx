'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ClassSectionService } from '@/services/attendance.service';
import type {
  AttendanceAccess,
  AttendanceRecordStatus,
  AttendanceSession,
  ClassSection,
  SessionRecord,
} from '@/types/attendance';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useDebounce } from '@/hooks/useDebounce';
import { AttendanceDetailHeader } from './AttendanceDetailHeader';
import { AttendanceStatsCards } from './AttendanceStatsCards';
import { AttendanceDetailFilters } from './AttendanceDetailFilters';
import { AttendanceDetailTableCard } from './AttendanceDetailTableCard';
import { AttendanceEditDialog } from './AttendanceEditDialog';
import { CreateSessionDialog } from './CreateSessionDialog';
import { EditSessionDialog } from './EditSessionDialog';
import { PaginationBar } from '@/components/shared/PaginationBar';
import { exportAttendanceWithSummary } from '@/components/attendance/utils/attendance-excel';
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

interface Props {
  courseId: string;
}

export function AttendanceDetailPageClient({ courseId }: Props) {
  const sectionId = parseInt(courseId, 10);

  const { data: profile } = useCurrentUser();
  const isAdmin = profile?.role === 'admin';

  const [section, setSection] = useState<ClassSection | null>(null);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);

  const [records, setRecords] = useState<SessionRecord[]>([]);
  const [originalRecords, setOriginalRecords] = useState<SessionRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sessionStats, setSessionStats] = useState({ total: 0, present: 0, late: 0, absent: 0 });
  const [attendanceAccess, setAttendanceAccess] = useState<AttendanceAccess | null>(null);
  const [sessionTrend, setSessionTrend] = useState<{ present: number | null; late: number | null; absent: number | null } | null>(null);

  const [isLoadingSection, setIsLoadingSection] = useState(true);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [showCreateSession, setShowCreateSession] = useState(false);
  const [editingSession, setEditingSession] = useState<AttendanceSession | null>(null);
  const [deletingSession, setDeletingSession] = useState<AttendanceSession | null>(null);
  const [deletingSessionInProgress, setDeletingSessionInProgress] = useState(false);

  const [editingRecord, setEditingRecord] = useState<SessionRecord | null>(null);

  const [dirtyMap, setDirtyMap] = useState<
    Record<number, { status: AttendanceRecordStatus; note: string }>
  >({});

  const PAGE_SIZE = 10;
  const debouncedSearch = useDebounce(search.trim(), 350);
  const canEditRecords = attendanceAccess?.canEditRecords ?? false;
  const isAttendanceLocked = !canEditRecords;
  const isAdminOverride = attendanceAccess?.reason === 'ADMIN_OVERRIDE';

  useEffect(() => {
    if (!sectionId) return;
    setIsLoadingSection(true);
    Promise.all([
      ClassSectionService.getOne(sectionId),
      ClassSectionService.getSessions(sectionId),
    ])
      .then(([sec, sess]) => {
        setSection(sec);
        setSessions(sess);
        if (sess.length > 0) {
          setSelectedSession(sess[sess.length - 1]);
        }
      })
      .catch(() => toast.error('Không thể tải thông tin lớp học.'))
      .finally(() => setIsLoadingSection(false));
  }, [sectionId]);

  const loadRecords = useCallback(() => {
    if (!selectedSession) return Promise.resolve();
    setIsLoadingRecords(true);
    setAttendanceAccess(null);
    return ClassSectionService.getSessionRecords(
      sectionId,
      selectedSession.session_id,
      currentPage,
      PAGE_SIZE,
      debouncedSearch || undefined,
    )
      .then((res) => {
        setRecords(res.data);
        setOriginalRecords(res.data);
        setTotalRecords(res.meta.total);
        setTotalPages(res.meta.totalPages);
        if (res.stats) setSessionStats(res.stats);
        setSessionTrend(res.trend ?? null);
        setAttendanceAccess(res.attendanceAccess ?? null);
        setDirtyMap({});
      })
      .catch(() => toast.error('Không thể tải danh sách điểm danh.'))
      .finally(() => setIsLoadingRecords(false));
  }, [sectionId, selectedSession, currentPage, debouncedSearch]);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  function applyEdit(enrollmentId: number, status: AttendanceRecordStatus, note: string) {
    if (isAttendanceLocked) return;
    setDirtyMap((prev) => ({ ...prev, [enrollmentId]: { status, note } }));
    setRecords((prev) =>
      prev.map((r) =>
        r.enrollment_id === enrollmentId ? { ...r, status, note } : r,
      ),
    );
  }

  const handleSave = useCallback(async () => {
    if (isAttendanceLocked) {
      toast.info('Lớp sắp diễn ra, chưa thể lưu điểm danh.');
      return;
    }
    if (!selectedSession || isSaving) return;
    const dirty = Object.entries(dirtyMap).map(([eid, v]) => ({
      enrollmentId: parseInt(eid, 10),
      status: v.status,
      note: v.note,
    }));
    if (dirty.length === 0) {
      toast.info('Chưa có thay đổi nào cần lưu.');
      return;
    }
    setIsSaving(true);
    try {
      await ClassSectionService.bulkSaveAttendance(sectionId, selectedSession.session_id, dirty);
      setDirtyMap({});
      await loadRecords();
      toast.success(`Đã lưu ${dirty.length} bản ghi điểm danh.`);
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response
        ?.data?.message;
      toast.error(message || 'Lưu thất bại. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  }, [sectionId, selectedSession, dirtyMap, isSaving, isAttendanceLocked, loadRecords]);

  const handleUndo = () => {
    setRecords(originalRecords);
    setDirtyMap({});
    toast.info('Đã hoàn tác tất cả thay đổi chưa lưu.');
  };

  const handleExportReport = () => {
    try {
      exportAttendanceWithSummary(records, sessionLabel);
    } catch {
      toast.error('Không thể xuất báo cáo điểm danh.');
    }
  };

  const handleMarkAllPresent = async () => {
    if (isAttendanceLocked) {
      toast.info('Lớp sắp diễn ra, chưa thể điểm danh.');
      return;
    }
    if (!selectedSession || isLoadingRecords) return;

    try {
      const allRecordsResult = await ClassSectionService.getSessionRecords(
        sectionId,
        selectedSession.session_id,
        1,
        Math.max(sessionStats.total, PAGE_SIZE),
      );
      const newDirty = { ...dirtyMap };
      allRecordsResult.data.forEach((record) => {
        newDirty[record.enrollment_id] = {
          status: 'PRESENT',
          note: record.note ?? '',
        };
      });

      setDirtyMap(newDirty);
      setRecords((prev) =>
        prev.map((record) => ({ ...record, status: 'PRESENT' as const })),
      );
      setDirtyMap(newDirty);
      toast.success(
        `Đã đánh dấu ${allRecordsResult.data.length} sinh viên là Có mặt. Nhấn Lưu điểm danh để lưu thay đổi.`,
      );
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(message || 'Không thể đánh dấu tất cả. Vui lòng thử lại.');
    }
  };


  const nextSessionNo = sessions.length > 0
    ? Math.max(...sessions.map((s) => s.session_no)) + 1
    : 1;

  const handleSessionCreated = (newSession: AttendanceSession) => {
    setSessions((prev) => [...prev, newSession]);
    setSelectedSession(newSession);
    setCurrentPage(1);
  };

  const handleSessionUpdated = (updated: AttendanceSession) => {
    setSessions((prev) => prev.map((s) => s.session_id === updated.session_id ? updated : s));
    if (selectedSession?.session_id === updated.session_id) {
      setSelectedSession(updated);
    }
  };

  const handleSessionDeleteConfirm = async () => {
    if (!deletingSession) return;
    setDeletingSessionInProgress(true);
    try {
      await ClassSectionService.deleteSession(sectionId, deletingSession.session_id);
      const remaining = sessions.filter((s) => s.session_id !== deletingSession.session_id);
      setSessions(remaining);
      if (selectedSession?.session_id === deletingSession.session_id) {
        setSelectedSession(remaining.length > 0 ? remaining[remaining.length - 1] : null);
      }
      toast.success(`Đã xóa Buổi ${deletingSession.session_no}.`);
    } catch {
      toast.error('Xóa buổi học thất bại.');
    } finally {
      setDeletingSessionInProgress(false);
      setDeletingSession(null);
    }
  };

  const sessionLabel = section
    ? `${section.subject.subject_name} — ${section.class_code} — Buổi ${selectedSession?.session_no ?? '?'}`
    : `Buổi học — Lớp ${courseId}`;

  const hasDirty = Object.keys(dirtyMap).length > 0;

  if (isLoadingSection) {
    return (
      <div className="space-y-6 pb-12 w-full animate-pulse">
        <div className="h-16 rounded-xl bg-slate-100" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-100" />
          ))}
        </div>
        <div className="h-12 rounded-xl bg-slate-100" />
        <div className="h-64 rounded-xl bg-slate-100" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 pb-12 w-full">
        <AttendanceDetailHeader
          sessionLabel={sessionLabel}
          hasDirty={hasDirty}
          onExportReport={handleExportReport}
          onSave={handleSave}
          onUndo={handleUndo}
          isSaving={isSaving}
          isReadOnly={isAttendanceLocked}
        />
        {selectedSession && attendanceAccess && isAttendanceLocked && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            Điểm danh đang bị khóa vì chưa nằm trong thời gian mở điểm danh của buổi học.
          </div>
        )}
        {isAdminOverride && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800">
            Admin đang sửa điểm danh ngoài giờ mở điểm danh của buổi học.
          </div>
        )}
        <AttendanceStatsCards
          total={sessionStats.total}
          present={sessionStats.present}
          late={sessionStats.late}
          absent={sessionStats.absent}
          trend={sessionTrend}
        />
        <AttendanceDetailFilters
          search={search}
          sessions={sessions}
          selectedSession={selectedSession}
          isAdmin={isAdmin}
          onSessionChange={(sess) => {
            setSelectedSession(sess);
            setCurrentPage(1);
            setSearch('');
          }}
          onSearchChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          onMarkAllPresent={handleMarkAllPresent}
          onAddSession={() => setShowCreateSession(true)}
          onEditSession={(sess) => setEditingSession(sess)}
          onDeleteSession={(sess) => setDeletingSession(sess)}
          isReadOnly={isAttendanceLocked}
        />
        <AttendanceDetailTableCard
          records={records}
          isLoading={isLoadingRecords}
          onEdit={(record) => setEditingRecord(record)}
          isReadOnly={isAttendanceLocked}
          footer={
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalRecords}
              pageSize={PAGE_SIZE}
              isBusy={isLoadingRecords}
              onPageChange={setCurrentPage}
            />
          }
        />
      </div>

      {editingRecord && (
        <AttendanceEditDialog
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSave={(status, note) => {
            applyEdit(editingRecord.enrollment_id, status, note);
            setEditingRecord(null);
          }}
        />
      )}

      <CreateSessionDialog
        open={showCreateSession}
        sectionId={sectionId}
        nextSessionNo={nextSessionNo}
        onClose={() => setShowCreateSession(false)}
        onCreated={handleSessionCreated}
      />

      {editingSession && (
        <EditSessionDialog
          open={!!editingSession}
          session={editingSession}
          sectionId={sectionId}
          onClose={() => setEditingSession(null)}
          onUpdated={handleSessionUpdated}
        />
      )}

      <AlertDialog
        open={!!deletingSession}
        onOpenChange={(v: boolean) => !v && setDeletingSession(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa buổi học</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa{' '}
              <strong className="text-slate-800">Buổi {deletingSession?.session_no}</strong>
              {deletingSession?.session_date && (
                <> ({new Date(deletingSession.session_date).toLocaleDateString('vi-VN')})</>
              )}
              ? Toàn bộ bản ghi điểm danh của buổi này sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingSessionInProgress}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSessionDeleteConfirm}
              disabled={deletingSessionInProgress}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deletingSessionInProgress ? 'Đang xóa...' : 'Xóa buổi học'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
