'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { StudentFilterBar } from '@/components/students/StudentFilterBar';
import { StudentTable, type Student } from '@/components/students/StudentTable';
import { cn } from '@/lib/utils';

const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    mssv: '#2024001',
    name: 'Nguyễn Thị Sarah',
    email: 'sarah.m@uni.edu.vn',
    avatarInitials: 'NS',
    avatarBg: 'bg-pink-200 text-pink-800',
    major: 'Khoa học máy tính',
    year: 'Năm 2',
    cohort: 'Khóa 2026',
    parentName: 'Nguyễn Văn Robert',
    parentContact: '+84 912 345 678',
    parentContactType: 'phone',
    status: 'Đang học',
  },
  {
    id: '2',
    mssv: '#2024042',
    name: 'Trần Văn James',
    email: 'j.carter@uni.edu.vn',
    avatarInitials: 'TJ',
    avatarBg: 'bg-blue-200 text-blue-800',
    major: 'Mỹ thuật',
    year: 'Năm nhất',
    cohort: 'Khóa 2027',
    parentName: 'Trần Thị Emily',
    parentContact: 'emily.c@email.com',
    parentContactType: 'email',
    status: 'Đang học',
  },
  {
    id: '3',
    mssv: '#2023156',
    name: 'Lê Thị Maria',
    email: 'm.rodz@uni.edu.vn',
    avatarInitials: 'LM',
    avatarBg: 'bg-orange-200 text-orange-800',
    major: 'Quản trị kinh doanh',
    year: 'Năm cuối',
    cohort: 'Khóa 2024',
    parentName: 'Lê Văn Carlos',
    parentContact: '+84 987 654 321',
    parentContactType: 'phone',
    status: 'Bảo lưu',
  },
  {
    id: '4',
    mssv: '#2024103',
    name: 'Phạm Văn David',
    email: 'd.chen@uni.edu.vn',
    avatarInitials: 'PD',
    avatarBg: 'bg-sky-200 text-sky-800',
    major: 'Kỹ thuật',
    year: 'Năm 3',
    cohort: 'Khóa 2025',
    parentName: 'Phạm Li Wei',
    parentContact: 'liwei@email.com',
    parentContactType: 'email',
    status: 'Đang học',
  },
  {
    id: '5',
    mssv: '#2023089',
    name: 'Hoàng Thị Aisha',
    email: 'aisha.k@uni.edu.vn',
    avatarInitials: 'HA',
    avatarBg: 'bg-purple-200 text-purple-800',
    major: 'Tâm lý học',
    year: 'Năm 2',
    cohort: 'Khóa 2026',
    parentName: 'Hoàng Văn Omar',
    parentContact: '+84 901 234 567',
    parentContactType: 'phone',
    status: 'Đình chỉ',
  },
];

const TOTAL = 124;
const PAGE_SIZE = 5;
const TOTAL_PAGES = Math.ceil(TOTAL / PAGE_SIZE);

export function StudentsPageClient() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const startItem = (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, TOTAL);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản Lý Sinh Viên</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý tuyển sinh, xem hồ sơ và cập nhật thông tin sinh viên.
          </p>
        </div>
        <Button className="shrink-0 gap-2">
          <Plus className="h-4 w-4" />
          Thêm sinh viên mới
        </Button>
      </div>

      {/* Filter bar */}
      <StudentFilterBar search={search} onSearchChange={setSearch} />

      {/* Table card */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <StudentTable students={MOCK_STUDENTS} />

        {/* Pagination footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-3">
          <p className="text-sm text-muted-foreground">
            Hiển thị{' '}
            <span className="font-semibold text-foreground">{startItem}</span> đến{' '}
            <span className="font-semibold text-foreground">{endItem}</span> trong số{' '}
            <span className="font-semibold text-foreground">{TOTAL}</span> kết quả
          </p>

          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  aria-disabled={currentPage === 1}
                  className={cn(
                    'cursor-pointer',
                    currentPage === 1 && 'pointer-events-none opacity-50'
                  )}
                />
              </PaginationItem>

              {[1, 2, 3].map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className={cn(
                      'cursor-pointer',
                      currentPage === page &&
                        'bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground'
                    )}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((p) => Math.min(TOTAL_PAGES, p + 1))}
                  aria-disabled={currentPage === TOTAL_PAGES}
                  className={cn(
                    'cursor-pointer',
                    currentPage === TOTAL_PAGES && 'pointer-events-none opacity-50'
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
