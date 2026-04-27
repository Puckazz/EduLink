import { Phone, Mail, MapPin, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CONTACT_INFO } from './data';

export function ParentFeedbackContactCard() {
  return (
    <div className="flex flex-col gap-4">
      {/* Contact Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-4">
          Thông Tin Liên Hệ Trực Tiếp
        </h3>
        <div className="flex flex-col gap-4">
          {/* Phone */}
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center">
              <Phone className="h-4 w-4 text-slate-600" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-slate-800">
                Hỗ trợ điện thoại
              </span>
              <span className="text-sm font-semibold text-[#0b203c]">
                {CONTACT_INFO.phone}
              </span>
              <span className="text-xs text-slate-500">{CONTACT_INFO.phoneNote}</span>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Email */}
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center">
              <Mail className="h-4 w-4 text-slate-600" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-slate-800">Email</span>
              <span className="text-sm font-medium text-[#4a90e2] break-all">
                {CONTACT_INFO.email}
              </span>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Office */}
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-slate-600" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-slate-800">Văn phòng</span>
              <span className="text-sm text-slate-600">{CONTACT_INFO.office}</span>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ CTA Card */}
      <div className="bg-[#0b203c] rounded-2xl p-5 text-white shadow-sm">
        <h3 className="text-sm font-bold mb-2">Trước khi gửi câu hỏi...</h3>
        <p className="text-xs text-white/70 leading-relaxed mb-4">
          Quý phụ huynh đã xem qua mục Câu hỏi thường gặp chưa? Nhiều câu hỏi
          về điểm số và lịch học đã được giải đáp tại đó.
        </p>
        <Button
          variant="secondary"
          className="w-full h-9 bg-white/15 hover:bg-white/25 text-white font-semibold text-sm border-0 gap-2 transition-colors duration-200"
        >
          <BookOpen className="h-4 w-4" />
          Xem Hỏi Đáp (FAQ)
        </Button>
      </div>
    </div>
  );
}
