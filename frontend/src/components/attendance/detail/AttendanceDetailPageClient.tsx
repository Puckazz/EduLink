'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  ClassSectionService,
  ClassSection,
  AttendanceSession,
  SessionRecord,
  AttendanceRecordStatus,
} from '@/services/attendance.service';
import { AttendanceDetailHeader } from './AttendanceDetailHeader';
import { AttendanceStatsCards } from './AttendanceStatsCards';
import { AttendanceDetailFilters } from './AttendanceDetailFilters';
import { AttendanceDetailTableCard } from './AttendanceDetailTableCard';
import { AttendanceEditDialog } from './AttendanceEditDialog';
import { PaginationBar } from '@/components/shared/PaginationBar';
import { exportAttendanceWithSummary } from '@/components/attendance/utils/attendance-excel';

interface Props {
  courseId: string;
}

export function AttendanceDetailPageClient({ courseId }: Props) {
  const sectionId = parseInt(courseId, 10);

  // ── Section & Sessions ────────────────────────────────────────────────────
  const [section, setSection] = useState<ClassSection | null>(null);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);

  // ── Records ───────────────────────────────────────────────────────────────
  const [records, setRecords] = useState<SessionRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');

  // ── UI State ──────────────────────────────────────────────────────────────
  const [isLoadingSection, setIsLoadingSection] = useState(true);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit dialog
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
        setTotalRecords(res.meta.total);
        setTotalPages(res.meta.totalPages);
        setDirtyMap({}); // Clear dirty khi đổi session/page
      })
      .catch(() => toast.error('Không thể tải danh sách điểm danh.'))
      .finally(() => setIsLoadingRecords(false));
  }, [sectionId, selectedSession, currentPage, search]);

  // ── Dirty map helpers ─────────────────────────────────────────────────────
  function applyEdit(enrollmentId: number, status: AttendanceRecordStatus, note: string) {
    setDirtyMap((prev) => ({ ...prev, [enrollmentId]: { status, note } }));
    // Cập nhật bảng preview luôn
    setRecords((prev) =>
      prev.map((r) =>
        r.enrollment_id === enrollmentId ? { ...r, status, note } : r,
      ),
    );
  }

  // ── Save draft ────────────────────────────────────────────────────────────
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

  // ── Computed ──────────────────────────────────────────────────────────────
  const sessionLabel = section
    ? `${section.subject.subject_name} — ${section.class_code} — Buổi ${selectedSession?.session_no ?? '?'}`
    : `Buổi học — Lớp ${courseId}`;

  const hasDirty = Object.keys(dirtyMap).length > 0;

  const stats = {
    total: totalRecords,
    present: records.filter((r) => r.status === 'PRESENT').length,
    late: records.filter((r) => r.status === 'LATE').length,
    absent: records.filter((r) => r.status === 'ABSENT').length,
  };

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
          isSaving={isSaving}
          sessions={sessions}
          selectedSession={selectedSession}
          onSessionChange={(sess) => {
            setSelectedSession(sess);
            setCurrentPage(1);
            setSearch('');
          }}
        />
        <AttendanceStatsCards
          total={stats.total}
          present={stats.present}
          late={stats.late}
          absent={stats.absent}
        />
        <AttendanceDetailFilters
          search={search}
          sessionDate={
            selectedSession
              ? new Date(selectedSession.session_date).toLocaleDateString('vi-VN')
              : undefined
          }
          onSearchChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          onMarkAllPresent={handleMarkAllPresent}
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

      {/* Edit Dialog */}
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
    </>
  );
}
