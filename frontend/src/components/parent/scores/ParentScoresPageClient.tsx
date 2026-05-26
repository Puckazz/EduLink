'use client';

import { useState } from 'react';
import {
  Download,
  GraduationCap,
  TrendingUp,
  Award,
  BookOpen,
  AlertCircle,
  RefreshCcw,
  Info,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterBar } from '@/components/shared/FilterBar';
import { Skeleton } from '@/components/ui/skeleton';
import { useParentScores } from '@/hooks/queries/useParentScores';
import { useAcademicTerms } from '@/hooks/queries/useAcademicTerms';
import { useAcademicYears } from '@/hooks/queries/useAcademicYears';
import type { Score } from '@/types/score';


type LetterGrade = 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';

function getLetterGrade(avg: number): LetterGrade {
  if (avg >= 9.0) return 'A+';
  if (avg >= 8.5) return 'A';
  if (avg >= 8.0) return 'B+';
  if (avg >= 7.0) return 'B';
  if (avg >= 5.5) return 'C';
  if (avg >= 4.0) return 'D';
  return 'F';
}

function getGPAScale(avg: number): number {
  if (avg >= 9.0) return 4.0;
  if (avg >= 8.5) return 4.0;
  if (avg >= 8.0) return 3.5;
  if (avg >= 7.0) return 3.0;
  if (avg >= 5.5) return 2.0;
  if (avg >= 4.0) return 1.0;
  return 0;
}

const GRADE_COLORS: Record<string, string> = {
  'A+': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  A: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'B+': 'bg-sky-100 text-sky-700 border-sky-200',
  B: 'bg-sky-100 text-sky-700 border-sky-200',
  C: 'bg-amber-100 text-amber-700 border-amber-200',
  D: 'bg-orange-100 text-orange-700 border-orange-200',
  F: 'bg-red-100 text-red-600 border-red-200',
};

function GradeChip({ avg }: { avg: number | null }) {
  if (avg === null)
    return <span className="text-sm text-muted-foreground">—</span>;
  const grade = getLetterGrade(avg);
  const gpa = getGPAScale(avg);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${GRADE_COLORS[grade]}`}
    >
      {grade} ({gpa.toFixed(1)})
    </span>
  );
}

function ScoreCell({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted-foreground">—</span>;
  const color =
    value >= 8.5
      ? 'text-emerald-600 font-semibold'
      : value >= 7.0
        ? 'text-sky-600 font-semibold'
        : value >= 4.0
          ? 'text-amber-600'
          : 'text-red-500 font-semibold';
  return <span className={color}>{value.toFixed(1)}</span>;
}


interface StatCardProps {
  label: string;
  value: string | React.ReactNode;
  sub?: string;
  icon: React.ReactNode;
  iconBg: string;
  trend?: { value: number; positive: boolean };
  loading?: boolean;
}

function StatCard({
  label,
  value,
  sub,
  icon,
  iconBg,
  trend,
  loading,
}: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-muted/10">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}
        >
          {icon}
        </div>
      </div>
      {loading ? (
        <>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-32" />
        </>
      ) : (
        <>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {value}
            </span>
            {trend && (
              <span
                className={`mb-1 flex items-center gap-0.5 text-xs font-semibold ${trend.positive ? 'text-emerald-600' : 'text-red-500'}`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                {trend.positive ? '+' : ''}
                {trend.value.toFixed(1)}
              </span>
            )}
          </div>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </>
      )}
    </div>
  );
}


function ScoresTable({
  scores,
  loading,
}: {
  scores: Score[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-2 p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (scores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <BookOpen className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          Không có dữ liệu điểm cho học kỳ này.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Mã môn
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Tên môn học
            </th>
            <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Số TC
            </th>
            <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Thường xuyên
            </th>
            <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Giữa kỳ
            </th>
            <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Cuối kỳ
            </th>
            <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Trung bình
            </th>
            <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Tổng kết
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {scores.map((score) => {
            return (
              <tr
                key={score.score_id}
                className="group transition-colors hover:bg-muted/30"
              >
                <td className="px-5 py-3.5">
                  <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-mono font-medium text-foreground">
                    {score.subject?.subject_code ?? `#${score.subject_id}`}
                  </span>
                </td>
                <td className="px-3 py-3.5">
                  <span className="font-medium text-foreground">
                    {score.subject?.subject_name ?? `Môn #${score.subject_id}`}
                  </span>
                </td>
                <td className="px-3 py-3.5 text-center">
                  <span className="text-muted-foreground">
                    {score.subject?.credit ?? '—'}
                  </span>
                </td>
                <td className="px-3 py-3.5 text-center">
                  <ScoreCell value={score.assignment} />
                </td>
                <td className="px-3 py-3.5 text-center">
                  <ScoreCell value={score.midterm} />
                </td>
                <td className="px-3 py-3.5 text-center">
                  <ScoreCell value={score.final} />
                </td>
                <td className="px-3 py-3.5 text-center font-bold">
                  {score.publish_status === 'PUBLISHED' ? (
                    <ScoreCell value={score.avg} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-3 py-3.5 text-center">
                  {score.publish_status === 'PUBLISHED' ? (
                    <GradeChip avg={score.avg} />
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                      Chưa công bố
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex items-center justify-between border-t border-border px-5 py-4">
        <p className="text-sm text-muted-foreground">
          Hiển thị {scores.length} môn học
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Đạt (≥ 4.0)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            Không đạt
          </span>
        </div>
      </div>
    </div>
  );
}


function GradeScaleInfo() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between">
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Info className="h-5 w-5 text-foreground" />
          <h3 className="text-base font-bold text-foreground">
            Thông Tin Thang Điểm
          </h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed font-medium">
          Điểm được tính dựa trên điểm giữa kỳ, điểm cuối kỳ và điểm đánh giá
          quá trình. Điểm trung bình tích lũy tối thiểu 2.0 là yêu cầu bắt buộc
          để duy trì tình trạng học tập tốt.
        </p>
      </div>
      <div className="mt-6">
        <a
          href="#"
          className="inline-flex items-center gap-1 text-sm font-bold text-foreground hover:text-muted-foreground transition-colors"
        >
          Xem Sổ Tay Sinh Viên <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}


function AcademicInsightCard() {
  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-6 flex flex-col justify-between">
      <div>
        <div className="mb-4 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-blue-900" />
          <h3 className="text-base font-bold text-blue-950">
            Nhận Xét Của Giảng Viên
          </h3>
        </div>
        <p className="text-sm text-blue-800/80 leading-relaxed italic font-medium">
          &quot;Lan đã cho thấy sự tiến bộ đáng kể trong môn Vật Lý học kỳ này.
          Tuy nhiên, cần chú ý ôn tập thêm cho môn Tiếng Anh Chuyên Ngành để cải
          thiện kết quả.&quot;
        </p>
      </div>
      <div className="mt-4 flex justify-end">
        <p className="text-[11px] font-bold text-[#1e3a5f] uppercase tracking-wide">
          - TS. Trần Văn Hùng, Cố vấn học tập
        </p>
      </div>
    </div>
  );
}


export default function ParentScoresPageClient() {
  const { years } = useAcademicYears();
  const [selectedAcademicYearId, setSelectedAcademicYearId] =
    useState<string>('all');
  const { terms, activeTerm } = useAcademicTerms({
    academicYearId:
      selectedAcademicYearId === 'all'
        ? undefined
        : Number(selectedAcademicYearId),
  });
  const [selectedTermId, setSelectedTermId] = useState<string>('all');

  const selectedTerm =
    terms.find((term) => String(term.term_id) === selectedTermId) ??
    (selectedTermId === 'all' ? null : activeTerm);

  const {
    activeStudent,
    scores,
    semesterGPA,
    semesterGPA4,
    cumulativeGPA,
    cumulativeGPA4,
    creditsEarned,
    creditsRegistered,
    isLoading,
    isError,
    refetch,
  } = useParentScores({
    termId: selectedTermId === 'all' ? undefined : Number(selectedTermId),
    academicYearId:
      selectedAcademicYearId === 'all'
        ? undefined
        : Number(selectedAcademicYearId),
  });

  return (
    <div className="space-y-6 px-1 py-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Kết Quả Học Tập
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Chi tiết điểm số và tín chỉ tích lũy
            {activeStudent && (
              <>
                {' '}
                của{' '}
                <span className="font-semibold text-foreground">
                  {activeStudent.full_name}
                </span>{' '}
                ({activeStudent.student_code})
              </>
            )}
          </p>
        </div>
        <Button
          variant="default"
          className="gap-2 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
          size="sm"
        >
          <Download className="h-4 w-4" />
          Tải Báo Cáo
        </Button>
      </div>

      <FilterBar
        fields={[
          {
            id: 'academic_year',
            label: 'Năm học',
            placeholder: 'Tất cả năm học',
            value: selectedAcademicYearId,
            options: [
              { value: 'all', label: 'Tất cả năm học' },
              ...years.map((year) => ({
                value: String(year.academic_year_id),
                label: year.name,
              })),
            ],
          },
          {
            id: 'term',
            label: 'Học kỳ',
            placeholder:
              selectedAcademicYearId === 'all' ? 'Chọn năm học trước' : 'Tất cả học kỳ',
            value: selectedTermId,
            disabled: selectedAcademicYearId === 'all',
            options: [
              { value: 'all', label: 'Tất cả học kỳ' },
              ...terms.map((term) => ({
                value: String(term.term_id),
                label: term.name,
              })),
            ],
          },
        ]}
        onFilterChange={(id, value) => {
          if (id === 'academic_year') {
            setSelectedAcademicYearId(value);
            setSelectedTermId('all');
          }
          if (id === 'term') setSelectedTermId(value);
        }}
      />

      {isError && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card py-14 text-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">
              Không thể tải dữ liệu điểm
            </p>
            <p className="text-sm text-muted-foreground">
              Đã có lỗi xảy ra khi kết nối tới máy chủ.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => refetch()}
          >
            <RefreshCcw className="h-4 w-4" />
            Thử lại
          </Button>
        </div>
      )}

      {!isError && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="GPA Học kỳ"
            value={
              <div className="flex items-baseline gap-2">
                <span>
                  {semesterGPA !== null ? semesterGPA.toFixed(2) : '—'}
                </span>
                {semesterGPA4 !== null && (
                  <span className="text-lg font-medium text-muted-foreground">
                    ({semesterGPA4.toFixed(2)}/4.0)
                  </span>
                )}
              </div>
            }
            sub={selectedTerm?.name ?? 'Tất cả học kỳ'}
            icon={<TrendingUp className="h-4.5 w-4.5 text-white" />}
            iconBg="bg-sky-500"
            loading={isLoading}
          />
          <StatCard
            label="GPA Tích lũy"
            value={
              <div className="flex items-baseline gap-2">
                <span>
                  {cumulativeGPA !== null ? cumulativeGPA.toFixed(2) : '—'}
                </span>
                {cumulativeGPA4 !== null && (
                  <span className="text-lg font-medium text-muted-foreground">
                    ({cumulativeGPA4.toFixed(2)}/4.0)
                  </span>
                )}
              </div>
            }
            sub="Tính trên toàn bộ quá trình học"
            icon={<GraduationCap className="h-4.5 w-4.5 text-white" />}
            iconBg="bg-violet-500"
            loading={isLoading}
          />
          <StatCard
            label="Tín chỉ đạt được"
            value={
              <span>
                {creditsEarned}{' '}
                <span className="text-lg font-normal text-muted-foreground">
                  / {creditsRegistered} đăng ký
                </span>
              </span>
            }
            icon={<Award className="h-4.5 w-4.5 text-white" />}
            iconBg="bg-amber-500"
            loading={isLoading}
          />
        </div>
      )}

      {!isError && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-base font-bold text-foreground">
              Bảng Điểm Chi Tiết
            </h2>
            <span className="text-sm text-muted-foreground">
              {selectedTerm?.name ?? 'Tất cả học kỳ'}
            </span>
          </div>
          <ScoresTable scores={scores} loading={isLoading} />
        </div>
      )}

      {!isError && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <GradeScaleInfo />
          <AcademicInsightCard />
        </div>
      )}
    </div>
  );
}
