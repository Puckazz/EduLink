'use client';

import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useParentAttendance }    from '@/hooks/queries/useParentAttendance';
import { useParentClassSections } from '@/hooks/queries/useParentClassSections';

import { ParentAttendancePageHeader }    from './ParentAttendancePageHeader';
import { ParentAttendanceStatCards }     from './ParentAttendanceStatCards';
import { ParentAttendanceBarChart }      from './ParentAttendanceBarChart';
import { ParentAttendanceDonutChart }    from './ParentAttendanceDonutChart';
import { ParentAttendanceCalendarCard }  from './ParentAttendanceCalendarCard';
import { ParentAttendanceTable }         from './ParentAttendanceTable';
import { ParentAttendancePolicyCard }    from './ParentAttendancePolicyCard';
import { ParentAttendanceActions }       from './ParentAttendanceActions';

export default function ParentAttendancePageClient() {
  const {
    activeStudent,
    records,
    totalSessions,
    totalAbsent,
    totalLate,
    totalPresent,
    overallRate,
    isLoading,
    isError,
    refetch,
  } = useParentAttendance();

  const { sections, isLoading: sectionsLoading } = useParentClassSections();

  if (isError) {

    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card py-20 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <div className="space-y-1">
          <p className="text-sm font-semibold">Không thể tải dữ liệu chuyên cần</p>
          <p className="text-xs text-muted-foreground">Đã có lỗi khi kết nối máy chủ.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => refetch()}>
          <RefreshCcw className="h-4 w-4" /> Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-1 py-2">

      <ParentAttendancePageHeader activeStudent={activeStudent} />

      <ParentAttendanceStatCards
        overallRate={overallRate}
        totalSessions={totalSessions}
        totalAbsent={totalAbsent}
        totalLate={totalLate}
        isLoading={isLoading}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ParentAttendanceBarChart records={records} loading={isLoading} />
        </div>
        <div className="lg:col-span-2">
          <ParentAttendanceDonutChart
            present={totalPresent}
            late={totalLate}
            absent={totalAbsent}
            total={totalSessions}
            loading={isLoading}
          />
        </div>
      </div>

      <ParentAttendanceCalendarCard
        sections={sections}
        loading={isLoading || sectionsLoading}
      />

      <ParentAttendanceTable
        records={records}
        loading={isLoading}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ParentAttendancePolicyCard />
        <ParentAttendanceActions />
      </div>

    </div>
  );
}
