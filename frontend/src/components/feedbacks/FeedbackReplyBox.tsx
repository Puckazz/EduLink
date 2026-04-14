import { Paperclip, Smile, SendHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function FeedbackReplyBox() {
  return (
    <div className="mt-8 flex gap-4">
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-200">
        <div className="flex h-full w-full items-center justify-center bg-orange-100 text-orange-700">
          <span className="font-bold text-sm">AM</span>
        </div>
      </div>
      
      <div className="flex-1 border border-slate-200 rounded-lg bg-white overflow-hidden focus-within:ring-1 focus-within:ring-slate-300 transition-shadow">
        <Textarea 
          placeholder="Nhập nội dung trả lời tại đây..."
          className="min-h-[120px] resize-none border-0 focus-visible:ring-0 rounded-none bg-transparent p-4 text-sm font-medium placeholder:text-slate-400"
        />
        
        <div className="flex items-center justify-between p-3 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-1">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
              <Paperclip className="h-4 w-4" />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
              <Smile className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="font-bold text-slate-600 shadow-sm">
              Lưu nháp
            </Button>
            <Button className="font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm">
              Gửi phản hồi <SendHorizontal className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
