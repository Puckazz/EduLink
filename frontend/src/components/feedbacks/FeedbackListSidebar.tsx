import { ListFilter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Feedback } from './data';

interface SidebarProps {
  feedbacks: Feedback[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

import { ScrollArea } from '@/components/ui/scroll-area';

export function FeedbackListSidebar({ feedbacks, selectedId, onSelect }: SidebarProps) {
  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-full shrink-0">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] h-9 bg-transparent border-slate-200 text-sm font-semibold text-slate-700">
              <SelectValue placeholder="Tất cả phản hồi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả phản hồi</SelectItem>
              <SelectItem value="unread">Chưa đọc</SelectItem>
              <SelectItem value="replied">Đã phản hồi</SelectItem>
            </SelectContent>
          </Select>
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
            <ListFilter className="h-5 w-5" />
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {feedbacks.map((fb) => {
          const isActive = fb.id === selectedId;
          const isUnread = fb.status === 'unread';

          return (
            <div 
              key={fb.id} 
              onClick={() => onSelect(fb.id)}
              className={`p-4 border-b border-slate-100 cursor-pointer transition-colors ${
                isActive ? 'bg-slate-100/60' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`font-bold text-sm ${isActive || isUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                  {fb.senderName}
                </span>
                <span className={`text-xs ${isActive || isUnread ? 'text-slate-900 font-semibold' : 'text-slate-500 font-medium'}`}>
                  {fb.time}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mb-2 truncate">
                Phụ huynh em {fb.studentInfo}
              </p>
              <p className={`text-sm font-bold mb-1 truncate ${isActive || isUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                {fb.subject}
              </p>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                {fb.preview}
              </p>
              
              {isUnread ? (
                <span className="inline-flex px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]">
                  Chưa đọc
                </span>
              ) : (
                <span className="inline-flex px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[10px]">
                  Đã phản hồi
                </span>
              )}
            </div>
          );
        })}
      </ScrollArea>
    </div>
  );
}
