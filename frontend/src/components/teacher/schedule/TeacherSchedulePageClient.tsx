'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  RefreshCcw,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  ClassSectionService,
} from '@/services/attendance.service';
import type { ClassSection, ClassStatus } from '@/types/attendance';
import { useAcademicYears } from '@/hooks/queries/useAcademicYears';
import { useAcademicTerms } from '@/hooks/queries/useAcademicTerms';
import { CLASS_STATUS_CONFIG } from '@/components/attendance/class-status.config';

const DAY_OF_WEEK_MAP: Record<string, number> = {
  'Chủ nhật': 0,
  'Chủ Nhật': 0,
  CN: 0,
  'Thứ 2': 1,
  'Thứ Hai': 1,
  T2: 1,
  'Thứ 3': 2,
  'Thứ Ba': 2,
  T3: 2,
  'Thứ 4': 3,
  'Thứ Tư': 3,
  T4: 3,
  'Thứ 5': 4,
  'Thứ Năm': 4,
  T5: 4,
  'Thứ 6': 5,
  'Thứ Sáu': 5,
  T6: 5,
  'Thứ 7': 6,
  'Thứ Bảy': 6,
  T7: 6,
};

const GRID_DAYS = [
  { label: 'Thứ 2', dayIndex: 1 },
  { label: 'Thứ 3', dayIndex: 2 },
  { label: 'Thứ 4', dayIndex: 3 },
  { label: 'Thứ 5', dayIndex: 4 },
  { label: 'Thứ 6', dayIndex: 5 },
  { label: 'Thứ 7', dayIndex: 6 },
  { label: 'CN', dayIndex: 0 },
];

const TIME_PERIODS = [
  { id: 'morning', label: 'Sáng', sub: '07:00 - 12:00', startHour: 0, endHour: 12 },
  { id: 'afternoon', label: 'Chiều', sub: '12:00 - 18:00', startHour: 12, endHour: 24 },
];

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDates(monday: Date): Record<number, Date> {
  const map: Record<number, Date> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    map[d.getDay()] = d;
  }
  return map;
}

function fmtShort(date: Date) {
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

function parseHour(time: string): number {
  return parseInt((time || '0').split(':')[0], 10);
}

function StatusBadge({ status }: { status: ClassStatus }) {
  const cfg = CLASS_STATUS_CONFIG[status];

  return (
    <Badge variant="outline" className={`rounded-md ${cfg.badgeClass}`}>
      {cfg.label}
    </Badge>
  );
}

function TeacherScheduleSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-20 rounded-lg" />
      <Skeleton className="h-12 rounded-lg" />
      <Skeleton className="h-[420px] rounded-lg" />
      <Skeleton className="h-80 rounded-lg" />
    </div>
  );
}

function SectionButton({
  section,
  onClick,
}: {
  section: ClassSection;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg border border-indigo-200 bg-indigo-50 p-2.5 text-left transition hover:bg-indigo-100 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 truncate text-xs font-bold text-indigo-900">
          {section.subject.subject_name}
        </p>
        <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
      </div>
      <p className="mt-1 text-[11px] font-medium text-indigo-700">
        {section.start_time} - {section.end_time}
      </p>
      <p className="mt-1 flex items-center gap-1 text-[11px] text-indigo-700">
        <MapPin className="h-3 w-3" />
        <span className="truncate">{section.room}</span>
      </p>
    </button>
  );
}

export function TeacherSchedulePageClient() {
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState('all');
  const [selectedTermId, setSelectedTermId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | ClassStatus>('all');
  const [selectedSection, setSelectedSection] = useState<ClassSection | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const { years } = useAcademicYears();
  const { terms } = useAcademicTerms({
    academicYearId:
      selectedAcademicYearId === 'all'
        ? undefined
        : Number(selectedAcademicYearId),
  });

  const termId =
    selectedTermId === 'all' ? undefined : Number(selectedTermId);
  const academicYearId =
    selectedAcademicYearId === 'all'
      ? undefined
      : Number(selectedAcademicYearId);
  const effectiveStatus =
    selectedStatus === 'all' ? undefined : selectedStatus;
  const isAcademicYearSelected = selectedAcademicYearId !== 'all';

  const { data: sections = [], isPending, isError, refetch } = useQuery({
    queryKey: [
      'teacher',
      'schedule',
      'sections',
      academicYearId ?? 'all-years',
      termId ?? 'all-terms',
      effectiveStatus ?? 'all-statuses',
    ],
    queryFn: () =>
      ClassSectionService.getAll(termId, effectiveStatus, academicYearId),
    staleTime: 2 * 60 * 1000,
  });

  const filteredSections = useMemo(
    () => sections,
    [sections],
  );

  const handleAcademicYearChange = (value: string) => {
    setSelectedAcademicYearId(value);
    setSelectedTermId('all');
  };

  const today = useMemo(() => new Date(), []);
  const todayStr = today.toDateString();
  const monday = useMemo(() => {
    const value = getMonday(today);
    value.setDate(value.getDate() + weekOffset * 7);
    return value;
  }, [today, weekOffset]);
  const sunday = useMemo(() => {
    const value = new Date(monday);
    value.setDate(monday.getDate() + 6);
    return value;
  }, [monday]);
  const weekDates = useMemo(() => getWeekDates(monday), [monday]);

  const sectionsByDay = useMemo(() => {
    const map: Record<number, ClassSection[]> = {};
    for (const section of filteredSections) {
      const dayIndex = DAY_OF_WEEK_MAP[section.day_of_week] ?? -1;
      if (dayIndex === -1) continue;
      if (!map[dayIndex]) map[dayIndex] = [];
      map[dayIndex].push(section);
    }
    Object.values(map).forEach((items) =>
      items.sort((a, b) => a.start_time.localeCompare(b.start_time)),
    );
    return map;
  }, [filteredSections]);

  if (isPending) return <TeacherScheduleSkeleton />;

  if (isError) {
    return (
      <div className="flex min-h-[42vh] flex-col items-center justify-center gap-4 rounded-lg border border-border bg-card p-8 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Không thể tải thời khóa biểu
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Đã có lỗi khi kết nối máy chủ.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => refetch()}>
          <RefreshCcw className="h-4 w-4" />
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Thời khóa biểu giảng viên
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Xem lịch dạy theo tuần, phòng học và danh sách lớp được phân công.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span className="rounded-lg border border-border bg-card px-3 py-2">
            {filteredSections.length} lớp
          </span>
          <span className="rounded-lg border border-border bg-card px-3 py-2">
            {filteredSections.reduce((sum, item) => sum + item._count.enrollments, 0)} sinh viên
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center">
        <Select
          value={selectedAcademicYearId}
          onValueChange={handleAcademicYearChange}
        >
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Năm học" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả năm học</SelectItem>
            {years.map((year) => (
              <SelectItem
                key={year.academic_year_id}
                value={String(year.academic_year_id)}
              >
                {year.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedTermId}
          onValueChange={setSelectedTermId}
          disabled={!isAcademicYearSelected}
        >
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue
              placeholder={
                isAcademicYearSelected ? 'Học kỳ' : 'Chọn năm học trước'
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả học kỳ</SelectItem>
            {terms.map((term) => (
              <SelectItem key={term.term_id} value={String(term.term_id)}>
                {term.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedStatus}
          onValueChange={(value) => setSelectedStatus(value as 'all' | ClassStatus)}
        >
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="ONGOING">
              {CLASS_STATUS_CONFIG.ONGOING.label}
            </SelectItem>
            <SelectItem value="FINISHED">
              {CLASS_STATUS_CONFIG.FINISHED.label}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Lịch dạy theo tuần</h2>
              <p className="text-sm text-muted-foreground">Nhấp vào lớp để xem chi tiết</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekOffset((value) => value - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[160px] text-center text-sm font-semibold text-foreground">
              {fmtShort(monday)} - {fmtShort(sunday)}
            </span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekOffset((value) => value + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            {weekOffset !== 0 && (
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setWeekOffset(0)}>
                Hôm nay
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr>
                <th className="w-[88px] border-b border-r border-border bg-muted/40 px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                  Thời gian
                </th>
                {GRID_DAYS.map(({ label, dayIndex }) => {
                  const date = weekDates[dayIndex];
                  const isToday = date?.toDateString() === todayStr;
                  return (
                    <th
                      key={dayIndex}
                      className={`border-b border-r border-border px-2 py-2.5 text-center text-xs font-semibold last:border-r-0 ${
                        isToday ? 'bg-primary text-primary-foreground' : 'bg-muted/40 text-foreground'
                      }`}
                    >
                      <div>{label}</div>
                      {date && (
                        <div className={`mt-0.5 text-[11px] font-normal ${isToday ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {fmtShort(date)}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {TIME_PERIODS.map((period) => (
                <tr key={period.id} className="border-b border-border last:border-b-0">
                  <td className="border-r border-border bg-muted/20 px-3 py-3 align-top">
                    <p className="text-xs font-bold text-foreground">{period.label}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{period.sub}</p>
                  </td>
                  {GRID_DAYS.map(({ dayIndex }) => {
                    const date = weekDates[dayIndex];
                    const isToday = date?.toDateString() === todayStr;
                    const cells = (sectionsByDay[dayIndex] ?? []).filter((section) => {
                      const hour = parseHour(section.start_time);
                      return hour >= period.startHour && hour < period.endHour;
                    });

                    return (
                      <td
                        key={dayIndex}
                        className={`border-r border-border p-1.5 align-top last:border-r-0 ${isToday ? 'bg-primary/5' : ''}`}
                      >
                        <div className="flex flex-col gap-1.5">
                          {cells.map((section) => (
                            <SectionButton
                              key={section.section_id}
                              section={section}
                              onClick={() => setSelectedSection(section)}
                            />
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}

              {filteredSections.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                        <CalendarDays className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">Không có lịch dạy phù hợp.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h2 className="text-base font-bold text-foreground">Danh sách lớp dạy</h2>
          <span className="text-sm text-muted-foreground">{filteredSections.length} lớp</span>
        </div>
        {filteredSections.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <BookOpen className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Không có lớp học nào trong bộ lọc này.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {['Mã lớp', 'Môn học', 'Lịch dạy', 'Phòng', 'Học kỳ', 'Sĩ số', 'Trạng thái'].map((label) => (
                    <th key={label} className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSections.map((section) => (
                  <tr
                    key={section.section_id}
                    className="cursor-pointer transition-colors hover:bg-muted/30"
                    onClick={() => setSelectedSection(section)}
                  >
                    <td className="px-4 py-4">
                      <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-medium">
                        {section.class_code}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-foreground">{section.subject.subject_name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{section.subject.subject_code}</p>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {section.day_of_week}, {section.start_time} - {section.end_time}
                    </td>
                    <td className="px-4 py-4">{section.room}</td>
                    <td className="px-4 py-4 text-muted-foreground">{section.term.name}</td>
                    <td className="px-4 py-4">{section._count.enrollments}</td>
                    <td className="px-4 py-4">
                      <StatusBadge status={section.effectiveStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Sheet open={!!selectedSection} onOpenChange={(open) => !open && setSelectedSection(null)}>
        <SheetContent className="sm:max-w-md">
          {selectedSection && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedSection.subject.subject_name}</SheetTitle>
                <SheetDescription>
                  {selectedSection.class_code} - {selectedSection.subject.subject_code}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-4">
                <StatusBadge status={selectedSection.effectiveStatus} />
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <Clock3 className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedSection.day_of_week}, {selectedSection.start_time} - {selectedSection.end_time}</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedSection.room}</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedSection._count.enrollments} sinh viên</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedSection._count.sessions} buổi học - {selectedSection.term.name}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
