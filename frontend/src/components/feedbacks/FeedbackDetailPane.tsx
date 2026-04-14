import { Reply, Printer, Download } from 'lucide-react';
import { type Feedback } from './data';
import { FeedbackReplyBox } from './FeedbackReplyBox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DetailPaneProps {
  feedback: Feedback | null;
}

export function FeedbackDetailPane({ feedback }: DetailPaneProps) {
  if (!feedback) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50/50 p-8 sm:p-12">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Reply className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">Chưa chọn hộp thư</h3>
          <p className="text-slate-500 text-sm mt-2">Hãy chọn một mục phản hồi từ phía bên trái để bắt đầu xem chi tiết</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 bg-slate-50/30">
      <div className="max-w-4xl mx-auto p-6 md:p-10">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 md:p-8">
          
          {/* Header Message */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8">
            <div className="flex-1">
              <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
                {feedback.subject}
              </h2>
            </div>
            <div className="shrink-0 pt-1 text-right">
              <span className="text-sm font-semibold text-slate-500">
                {feedback.fullDate}
              </span>
            </div>
          </div>

          {/* Sender Info */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-slate-600">{feedback.avatarChar}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 text-[15px]">{feedback.senderName}</span>
                  <span className="text-sm font-medium text-slate-500">{` <${feedback.senderEmail}>`}</span>
                </div>
                <span className="text-xs font-semibold text-slate-500 mt-0.5">
                  Liên quan đến sinh viên: <span className="text-slate-800">{feedback.studentInfo}</span>
                </span>
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="flex items-center gap-1 shrink-0">
              <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
                <Reply className="h-4 w-4" />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
                <Printer className="h-4 w-4" />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="prose prose-slate prose-sm sm:prose-base max-w-none text-slate-700 whitespace-pre-line leading-relaxed pb-8">
            {feedback.fullContent}
          </div>

          <FeedbackReplyBox />

        </div>

        {/* Previous Interaction */}
        {feedback.previousInteraction && (
          <div className="mt-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-full bg-slate-200" />
              <span className="shrink-0 text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Tương tác trước đó</span>
              <div className="h-px w-full bg-slate-200" />
            </div>

            <div className="flex justify-between items-start bg-transparent">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700">{feedback.previousInteraction.adminName}</span>
                <span className="text-sm text-slate-600 mt-2">{feedback.previousInteraction.content}</span>
              </div>
              <span className="text-xs font-semibold text-slate-400 shrink-0">{feedback.previousInteraction.time}</span>
            </div>
          </div>
        )}

      </div>
    </ScrollArea>
  );
}
