import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface NotificationsFilterBarProps {
  searchKeyword: string;
  selectedRecipient: string;
  sortOrder: 'newest' | 'oldest';
  onSearchKeywordChange: (value: string) => void;
  onRecipientChange: (value: string) => void;
  onSortOrderChange: (value: 'newest' | 'oldest') => void;
  onClearFilters: () => void;
}

export function NotificationsFilterBar({
  searchKeyword,
  selectedRecipient,
  sortOrder,
  onSearchKeywordChange,
  onRecipientChange,
  onSortOrderChange,
  onClearFilters,
}: NotificationsFilterBarProps) {
  const [inputValue, setInputValue] = useState(searchKeyword);

  useEffect(() => {
    setInputValue(searchKeyword);
  }, [searchKeyword]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== searchKeyword) {
        onSearchKeywordChange(inputValue);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [inputValue, onSearchKeywordChange, searchKeyword]);

  return (
    <Card className="border-border bg-card shadow-xs">
      <CardContent className="grid gap-4 px-6 pt-6 pb-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Search className="h-4 w-4 text-muted-foreground" />
            Tìm kiếm
          </p>
          <div className="relative">
            <Input
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Nhập tiêu đề hoặc nội dung"
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Filter className="h-4 w-4 text-muted-foreground" />
            Đối tượng nhận
          </p>
          <Select value={selectedRecipient} onValueChange={onRecipientChange}>
            <SelectTrigger>
              <SelectValue placeholder="Tất cả đối tượng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_types">Tất cả đối tượng</SelectItem>
              <SelectItem value="all">Toàn trường</SelectItem>
              <SelectItem value="parents">Phụ huynh</SelectItem>
              <SelectItem value="teachers">Giáo viên</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Filter className="h-4 w-4 text-muted-foreground" />
            Sắp xếp
          </p>
          <Select
            value={sortOrder}
            onValueChange={(val) => onSortOrderChange(val as 'newest' | 'oldest')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sắp xếp theo ngày" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mới nhất trước</SelectItem>
              <SelectItem value="oldest">Cũ nhất trước</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end justify-end pt-4 md:pt-0">
          <Button variant="outline" onClick={onClearFilters}>
            Xóa bộ lọc
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
