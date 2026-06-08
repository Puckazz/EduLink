'use client';

import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  UploadCloud,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { ClassSectionService } from '@/services/attendance.service';
import type { ImportResult } from '@/types/attendance';
import {
  downloadClassImportTemplate,
  parseClassImportFile,
} from './utils/attendance-class-import';

interface Props {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

type Step = 1 | 2 | 3;

export function ImportClassSectionDialog({ open, onClose, onImported }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep(1);
    setFile(null);
    setResult(null);
    setParseErrors([]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileSelect = (selected: File) => {
    if (!selected.name.endsWith('.xlsx') && !selected.name.endsWith('.xls')) {
      toast.error('Chỉ chấp nhận file Excel (.xlsx hoặc .xls)');
      return;
    }
    setFile(selected);
    setParseErrors([]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
   
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    const parsed = await parseClassImportFile(file);
    if (parsed.errors.length > 0 && parsed.rows.length === 0) {
      setParseErrors(parsed.errors);
      return;
    }

    setUploading(true);
    try {
      const res = await ClassSectionService.importFromFile(file);
      setResult(res);
      setStep(3);
      onImported();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg ?? 'Import thất bại. Vui lòng kiểm tra lại file.');
    } finally {
      setUploading(false);
    }
  };

  const steps = [
    { n: 1 as Step, label: 'Tải mẫu' },
    { n: 2 as Step, label: 'Upload' },
    { n: 3 as Step, label: 'Kết quả' },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-800">
            Import lớp học phần từ Excel
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-0 mb-2">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center flex-1">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  step >= s.n
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {s.n}
              </div>
              <span
                className={`ml-1.5 text-xs font-medium ${
                  step >= s.n ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div className={`mx-2 flex-1 h-px ${step > s.n ? 'bg-slate-900' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="py-4 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3">
              <div className="flex items-start gap-3">
                <FileSpreadsheet className="h-8 w-8 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800 text-sm">File Excel mẫu</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Tải file mẫu về, điền đầy đủ thông tin lớp học và mã số sinh viên
                    (cách nhau bởi dấu phẩy), sau đó upload lại ở bước tiếp theo.
                  </p>
                </div>
              </div>
              <div className="text-xs text-slate-500 space-y-1 pl-11">
                <p>• <strong>Mã lớp</strong>: Mã duy nhất của lớp (VD: L01)</p>
                <p>• <strong>Mã môn học</strong>: Phải tồn tại trong hệ thống (VD: INT101)</p>
                <p>• <strong>Danh sách MSSV</strong>: Cách nhau bởi dấu phẩy (VD: SV001,SV002)</p>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => downloadClassImportTemplate()} className="gap-2">
                <Download className="h-4 w-4" />
                Tải file mẫu (.xlsx)
              </Button>
              <Button onClick={() => setStep(2)}>
                Tôi đã điền xong →
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="py-4 space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                isDragging
                  ? 'border-slate-900 bg-slate-50'
                  : file
                  ? 'border-emerald-400 bg-emerald-50'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                }}
              />
              <UploadCloud className={`mx-auto h-10 w-10 mb-3 ${file ? 'text-emerald-500' : 'text-slate-300'}`} />
              {file ? (
                <>
                  <p className="font-semibold text-emerald-700 text-sm">{file.name}</p>
                  <p className="text-xs text-emerald-600 mt-1">
                    {(file.size / 1024).toFixed(1)} KB — Nhấp để chọn file khác
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-slate-600 text-sm">Kéo thả file vào đây</p>
                  <p className="text-xs text-slate-400 mt-1">hoặc nhấp để chọn file (.xlsx)</p>
                </>
              )}
            </div>

            {parseErrors.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-1">
                <p className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" /> Phát hiện lỗi trong file
                </p>
                {parseErrors.slice(0, 5).map((e, i) => (
                  <p key={i} className="text-xs text-amber-600 pl-5">{e}</p>
                ))}
                {parseErrors.length > 5 && (
                  <p className="text-xs text-amber-500 pl-5">...và {parseErrors.length - 5} lỗi khác</p>
                )}
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>← Quay lại</Button>
              <Button onClick={handleUpload} disabled={!file || uploading} className="gap-2">
                {uploading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Đang xử lý...</>
                ) : (
                  <><UploadCloud className="h-4 w-4" /> Import ngay</>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && result && (
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-500 mb-1" />
                <p className="text-2xl font-bold text-emerald-700">{result.created}</p>
                <p className="text-xs text-emerald-600">Lớp tạo mới</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
                <AlertCircle className="mx-auto h-6 w-6 text-amber-500 mb-1" />
                <p className="text-2xl font-bold text-amber-700">{result.skipped}</p>
                <p className="text-xs text-amber-600">Lớp bỏ qua</p>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
                <CheckCircle2 className="mx-auto h-6 w-6 text-blue-500 mb-1" />
                <p className="text-2xl font-bold text-blue-700">{result.enrolled}</p>
                <p className="text-xs text-blue-600">SV đã đăng ký</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-1 max-h-36 overflow-y-auto">
                <p className="text-xs font-semibold text-red-700 flex items-center gap-1.5">
                  <XCircle className="h-3.5 w-3.5" /> Lỗi xử lý ({result.errors.length})
                </p>
                {result.errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-600 pl-5">{e}</p>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { reset(); }} className="gap-2">
                Import thêm
              </Button>
              <Button onClick={handleClose}>Đóng</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
