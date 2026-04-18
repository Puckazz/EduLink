'use client';

import { useState, useRef } from 'react';
import {
  Bell,
  ChevronDown,
  Clock,
  Globe,
  GraduationCap,
  Megaphone,
  Send,
  User,
  AlertTriangle,
  FileText,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
type Recipient = 'all' | 'parents' | 'students';
type SortOrder = 'newest' | 'oldest';

interface NotificationItem {
  id: number;
  title: string;
  preview: string;
  date: string;
  time: string;
  recipient: Recipient;
  isUrgent: boolean;
}

// ──────────────────────────────────────────────
// Mock data
// ──────────────────────────────────────────────
const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    title: 'Thông báo Khẩn: Đóng cửa khuôn viên trường',
    preview:
      'Do điều kiện thời tiết diễn biến phức tạp, nhà trường sẽ đóng cửa...',
    date: '24 Th10, 2023',
    time: '08:30 Sáng',
    recipient: 'all',
    isUrgent: true,
  },
  {
    id: 2,
    title: 'Đã có Bảng điểm Học kỳ',
    preview:
      'Điểm tổng kết Học kỳ I đã được cập nhật trên cổng thông tin...',
    date: '22 Th10, 2023',
    time: '02:15 Chiều',
    recipient: 'parents',
    isUrgent: false,
  },
  {
    id: 3,
    title: 'Bảo trì hệ thống Thư viện',
    preview:
      'Danh mục thư viện trực tuyến sẽ tạm ngưng để bảo trì vào Chủ Nhật...',
    date: '20 Th10, 2023',
    time: '11:00 Sáng',
    recipient: 'students',
    isUrgent: false,
  },
  {
    id: 4,
    title: 'Cập nhật Quy định Y tế & An toàn',
    preview:
      'Các quy định mới về phòng chống cúm mùa đã được áp dụng ngay lập tức...',
    date: '18 Th10, 2023',
    time: '09:45 Sáng',
    recipient: 'all',
    isUrgent: true,
  },
  {
    id: 5,
    title: 'Lịch thi cuối kỳ Học kỳ I năm học 2023-2024',
    preview:
      'Lịch thi chính thức đã được công bố trên cổng thông tin sinh viên...',
    date: '15 Th10, 2023',
    time: '03:00 Chiều',
    recipient: 'students',
    isUrgent: false,
  },
];

const RECIPIENT_OPTIONS: { value: Recipient | ''; label: string }[] = [
  { value: '', label: 'Chọn đối tượng...' },
  { value: 'all', label: 'Tất cả' },
  { value: 'parents', label: 'Phụ huynh' },
  { value: 'students', label: 'Sinh viên' },
];

// ──────────────────────────────────────────────
// Helper components
// ──────────────────────────────────────────────
function RecipientBadge({ recipient }: { recipient: Recipient }) {
  if (recipient === 'all') {
    return (
      <span className="flex items-center gap-1.5 text-sm text-slate-600">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100">
          <Globe className="h-3.5 w-3.5 text-slate-500" />
        </span>
        Tất cả
      </span>
    );
  }
  if (recipient === 'parents') {
    return (
      <span className="flex items-center gap-1.5 text-sm text-slate-600">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
          <User className="h-3.5 w-3.5 text-emerald-600" />
        </span>
        Phụ huynh
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-sm text-slate-600">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
        <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
      </span>
      Sinh viên
    </span>
  );
}

// ──────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────
export function NotificationsPageClient() {
  // Form state
  const [title, setTitle] = useState('');
  const [recipient, setRecipient] = useState<Recipient | ''>('');
  const [body, setBody] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const MAX_CHARS = 500;

  // History state
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [sortOpen, setSortOpen] = useState(false);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  const sortRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!title.trim() || !recipient || !body.trim()) return;

    const now = new Date();
    const newItem: NotificationItem = {
      id: Date.now(),
      title: title.trim(),
      preview: body.trim().slice(0, 80) + (body.length > 80 ? '...' : ''),
      date: now.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      time: now.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      recipient: recipient as Recipient,
      isUrgent,
    };

    setNotifications((prev) => [newItem, ...prev]);
    setTitle('');
    setRecipient('');
    setBody('');
    setIsUrgent(false);
    setIsDraft(false);
  };

  const filteredNotifications = notifications
    .filter((n) =>
      n.title.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sortOrder === 'newest' ? b.id - a.id : a.id - b.id,
    );

  return (
    <div className="w-full space-y-7 pb-12">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Quản Lý Thông Báo
            </h1>
            <p className="text-sm text-slate-500">
              Gửi thông báo đến sinh viên và phụ huynh toàn trường
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative hidden w-64 sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm kiếm thông báo..."
            className="pl-9 border-slate-200 bg-slate-50 text-sm focus-visible:ring-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Create form ── */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-5 p-6">
          {/* Card header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-600" />
              <h2 className="text-base font-bold text-slate-900">
                Tạo Thông Báo Mới
              </h2>
            </div>
            <button
              onClick={() => setIsDraft(!isDraft)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                isDraft
                  ? 'border-amber-300 bg-amber-50 text-amber-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {isDraft ? '✓ Chế độ Nháp' : 'Chế độ Nháp'}
            </button>
          </div>

          {/* Row 1: Title + Recipient */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Tiêu đề thông báo
              </label>
              <Input
                placeholder="VD: Thông báo nghỉ học do thời tiết xấu"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-slate-200 text-sm focus-visible:ring-1"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Đối tượng nhận
              </label>
              <div className="relative">
                <select
                  value={recipient}
                  onChange={(e) =>
                    setRecipient(e.target.value as Recipient | '')
                  }
                  className="w-full appearance-none rounded-md border border-slate-200 bg-white px-3 py-2 pr-8 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
                >
                  {RECIPIENT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Row 2: Body */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Nội dung tin nhắn
            </label>
            <textarea
              rows={5}
              placeholder="Nhập nội dung chi tiết tại đây..."
              value={body}
              onChange={(e) => setBody(e.target.value.slice(0, MAX_CHARS))}
              className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Hỗ trợ định dạng Markdown</span>
              <span>
                {body.length} / {MAX_CHARS} ký tự
              </span>
            </div>
          </div>

          {/* Row 3: Urgent checkbox + Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
              <div
                onClick={() => setIsUrgent(!isUrgent)}
                className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                  isUrgent
                    ? 'border-red-500 bg-red-500'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {isUrgent && (
                  <svg
                    className="h-2.5 w-2.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <AlertTriangle
                className={`h-4 w-4 ${isUrgent ? 'text-red-500' : 'text-slate-400'}`}
              />
              Đánh dấu Quan trọng / Khẩn cấp
            </label>

            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                className="border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                onClick={() => {
                  setIsDraft(true);
                }}
              >
                Lưu Nháp
              </Button>
              <Button
                className="gap-2 bg-slate-900 text-white hover:bg-slate-800 font-semibold"
                onClick={handleSend}
                disabled={!title.trim() || !recipient || !body.trim()}
              >
                <Send className="h-4 w-4" />
                Gửi Thông Báo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── History ── */}
      <div className="space-y-4">
        {/* History header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-600" />
            <h2 className="text-base font-bold text-slate-900">Lịch Sử Gửi</h2>
          </div>

          {/* Sort dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <span className="text-xs text-slate-400">Sắp xếp theo:</span>
              <span className="font-semibold text-slate-800">
                {sortOrder === 'newest' ? 'Ngày (Mới nhất)' : 'Ngày (Cũ nhất)'}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform ${sortOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full z-10 mt-1.5 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                {(['newest', 'oldest'] as SortOrder[]).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSortOrder(opt);
                      setSortOpen(false);
                    }}
                    className={`flex w-full items-center px-4 py-2 text-sm transition-colors hover:bg-slate-50 ${
                      sortOrder === opt
                        ? 'font-semibold text-slate-900'
                        : 'text-slate-600'
                    }`}
                  >
                    {opt === 'newest' ? 'Ngày (Mới nhất)' : 'Ngày (Cũ nhất)'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* History table */}
        <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    Tiêu đề
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    Ngày gửi
                  </th>
                  <th className="px-6 py-3.5 text-right text-[11px] font-bold uppercase tracking-widest text-slate-500 pr-8">
                    Đối tượng nhận
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredNotifications.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-10 text-center text-sm text-slate-400"
                    >
                      Không tìm thấy thông báo nào.
                    </td>
                  </tr>
                ) : (
                  filteredNotifications.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={`group cursor-pointer transition-colors hover:bg-blue-50/40 ${
                        idx < filteredNotifications.length - 1
                          ? 'border-b border-slate-100'
                          : ''
                      }`}
                    >
                      {/* Title cell */}
                      <td className="px-0 py-0">
                        <div className="flex h-full items-stretch">
                          {/* Urgent indicator bar */}
                          <div
                            className={`w-1 shrink-0 rounded-sm ${item.isUrgent ? 'bg-red-500' : 'bg-transparent'}`}
                          />
                          <div className="flex flex-col justify-center gap-0.5 px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 text-sm">
                                {item.title}
                              </span>
                              {item.isUrgent && (
                                <span className="rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                                  Khẩn cấp
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 leading-snug line-clamp-1">
                              {item.preview}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Date cell */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>
                            {item.date}
                            <span className="ml-2 text-slate-400">
                              {item.time}
                            </span>
                          </span>
                        </div>
                      </td>

                      {/* Recipient cell */}
                      <td className="px-8 py-4 text-right">
                        <div className="flex justify-end">
                          <RecipientBadge recipient={item.recipient} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
