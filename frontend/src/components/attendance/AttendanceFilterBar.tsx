import { Calendar, GraduationCap, Library } from 'lucide-react';
import { FilterBar, type FilterField } from '@/components/shared/FilterBar';

export function AttendanceFilterBar() {
  const fields: FilterField[] = [
    {
      id: 'term',
      label: 'Học kỳ',
      icon: <Calendar />,
      placeholder: 'Chọn học kỳ',
      defaultValue: 'hk1',
      options: [
        { value: 'hk1', label: 'Học kỳ 1' },
        { value: 'hk2', label: 'Học kỳ 2' },
      ],
    },
    {
      id: 'year',
      label: 'Năm học',
      icon: <Calendar />,
      placeholder: 'Chọn năm học',
      defaultValue: '2023',
      options: [
        { value: '2023', label: '2023 - 2024' },
        { value: '2024', label: '2024 - 2025' },
      ],
    },
    {
      id: 'department',
      label: 'Khoa / Ngành',
      icon: <Library />,
      placeholder: 'Chọn khoa ngành',
      defaultValue: 'cntt',
      options: [
        { value: 'cntt', label: 'Khoa Công nghệ Thông tin' },
        { value: 'dtvt', label: 'Khoa Điện tử Viễn thông' },
      ],
    },
  ];

  return <FilterBar fields={fields} />;
}
