'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  ClassSectionService,
  ClassSection,
  AttendanceSession,
  SessionRecord,
  AttendanceRecordStatus,
} from '@/services/attendance.service';
import { useCurrentUser } from '@/hooks/useCurrentUser';
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

  // ── Section & Sessions ────────────────────────────────────────────────────
  const [section, setSection] = useState<ClassSection | null>(null);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);

  // ── Records ───────────────────────────────────────────────────────────────
  const [records, setRecords] = useState<SessionRecord[]>([]);
  const [originalRecords, setOriginalRecords] = useState<SessionRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sessionStats, setSessionStats] = useState({ total: 0, present: 0, late: 0, absent: 0 });
  const [sessionTrend, setSessionTrend] = useState<{ present: number | null; late: number | null; absent: number | null } | null>(null);

  // ── UI State ──────────────────────────────────────────────────────────────
  const [isLoadingSection, setIsLoadingSection] = useState(true);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ── Session CRUD dialogs ───────────────────────────────────────────────────
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [editingSession, setEditingSession] = useState<AttendanceSession | null>(null);
  const [deletingSession, setDeletingSession] = useState<AttendanceSession | null>(null);
  const [deletingSessionInProgress, setDeletingSessionInProgress] = useState(false);

  // ── Attendance record edit ────────────────────────────────────────────────
  const [editingRecord, setEditingRecord] = useState<SessionRecord | null>(null);

  // Dirty state: maps enrollmentId -> {status, note}
  const [dirtyMap, setDirtyMap] = useState<
    Record<number, { status: AttendanceRecordStatus; note: string }>
  >({});

  const PAGE_SIZE = 10;

  // ── Load section + sessions ───────────────────────────────────────────────
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
          setSelectedSession(sess[sess.length - 1]); // Default: buổi mới nhất
        }
      })
      .catch(() => toast.error('Không thể tải thông tin lớp học.'))
      .finally(() => setIsLoadingSection(false));
  }, [sectionId]);

  // ── Load records khi session / page / search thay đổi ────────────────────
  useEffect(() => {
    if (!selectedSession) return;
    setIsLoadingRecords(true);
    ClassSectionService.getSessionRecords(
      sectionId,
      selectedSession.session_id,
      currentPage,
      PAGE_SIZE,
      search || undefined,
    )
      .then((res) => {
        setRecords(res.data);
        setOriginalRecords(res.data);
        setTotalRecords(res.meta.total);
        setTotalPages(res.meta.totalPages);
        if (res.stats) setSessionStats(res.stats);
        setSessionTrend(res.trend ?? null);
        setDirtyMap({});
      })
      .catch(() => toast.error('Không thể tải danh sách điểm danh.'))
      .finally(() => setIsLoadingRecords(false));
  }, [sectionId, selectedSession, currentPage, search]);

  // ── Dirty map helpers ─────────────────────────────────────────────────────
  function applyEdit(enrollmentId: number, status: AttendanceRecordStatus, note: string) {
    setDirtyMap((prev) => ({ ...prev, [enrollmentId]: { status, note } }));
    setRecords((prev) =>
      prev.map((r) =>
        r.enrollment_id === enrollmentId ? { ...r, status, note } : r,
      ),
    );
  }

  // ── Save attendance ───────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
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
      toast.success(`Đã lưu ${dirty.length} bản ghi điểm danh.`);
    } catch {
      toast.error('Lưu thất bại. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  }, [sectionId, selectedSession, dirtyMap, isSaving]);

  // ── Undo ──────────────────────────────────────────────────────────────────
  const handleUndo = () => {
    setRecords(originalRecords);
    setDirtyMap({});
    toast.info('Đã hoàn tác tất cả thay đổi chưa lưu.');
  };

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExportReport = () => {
    try {
      exportAttendanceWithSummary(records, sessionLabel);
    } catch {
      toast.error('Không thể xuất báo cáo điểm danh.');
    }
  };

  // ── Mark all present ──────────────────────────────────────────────────────
  const handleMarkAllPresent = () => {
    const newDirty = { ...dirtyMap };
    records.forEach((r) => {
      newDirty[r.enrollment_id] = { status: 'PRESENT', note: r.note ?? '' };
    });
    setDirtyMap(newDirty);
    setRecords((prev) => prev.map((r) => ({ ...r, status: 'PRESENT' as const })));
    toast.success('Đã đánh dấu tất cả là Có mặt.');
  };

  // ── Session CRUD handlers ─────────────────────────────────────────────────

  // Tính session_no tiếp theo
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
      // Chọn buổi mới nhất còn lại
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

  // ── Computed ──────────────────────────────────────────────────────────────
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
        />
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
        />
        <AttendanceDetailTableCard
          records={records}
          isLoading={isLoadingRecords}
          onEdit={(record) => setEditingRecord(record)}
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

      {/* ── Attendance record edit ── */}
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

      {/* ── Session dialogs ── */}
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

      {/* ── Delete session confirmation ── */}
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
