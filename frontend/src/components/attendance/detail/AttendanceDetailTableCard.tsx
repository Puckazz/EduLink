import { MessageSquare } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'none';

export interface StudentAttendance {
  id: string;
  name: string;
  mssv: string;
  avatar: string;
  status: AttendanceStatus;
  note: string;
  hasMessage: boolean;
}

interface TableProps {
  students: StudentAttendance[];
  onStatusChange: (id: string, status: AttendanceStatus) => void;
  onNoteChange: (id: string, note: string) => void;
  footer?: React.ReactNode;
}

export function AttendanceDetailTableCard({ students, onStatusChange, onNoteChange, footer }: TableProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-card shadow-sm overflow-hidden mt-6">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50 border-b-slate-200">
              <TableHead className="py-4 px-6 font-bold text-slate-800 w-[30%]">Sinh Viên</TableHead>
              <TableHead className="font-bold text-slate-800 w-[35%]">Trạng Thái</TableHead>
              <TableHead className="font-bold text-slate-800 w-[25%]">Ghi Chú</TableHead>
              <TableHead className="font-bold text-slate-800 text-center w-[10%]">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => {
              const isPresent = student.status === 'present';
              const isLate = student.status === 'late';
              const isAbsent = student.status === 'absent';

              return (
                <TableRow key={student.id} className="hover:bg-slate-50/50">
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 overflow-hidden rounded-full shrink-0">
                        <img 
                          src={student.avatar} 
                          alt={student.name} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{student.name}</span>
                        <span className="text-xs text-slate-500 font-medium mt-0.5">MSSV: {student.mssv}</span>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onStatusChange(student.id, 'present')}
                        className={`px-5 py-1.5 rounded-md text-sm font-bold transition-all ${
                          isPresent 
                            ? 'bg-emerald-100 text-emerald-700 shadow-xs ring-1 ring-emerald-400 ring-inset' 
                            : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                        }`}
                      >
                        Có Mặt
                      </button>
                      <button
                        onClick={() => onStatusChange(student.id, 'late')}
                        className={`px-5 py-1.5 rounded-md text-sm font-bold transition-all ${
                          isLate 
                            ? 'bg-amber-100 text-amber-700 shadow-xs ring-1 ring-amber-400 ring-inset' 
                            : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                        }`}
                      >
                        Muộn
                      </button>
                      <button
                        onClick={() => onStatusChange(student.id, 'absent')}
                        className={`px-5 py-1.5 rounded-md text-sm font-bold transition-all ${
                          isAbsent 
                            ? 'bg-red-50 text-red-600 shadow-xs ring-1 ring-red-300 ring-inset' 
                            : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                        }`}
                      >
                        Vắng
                      </button>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className={`rounded-md transition-colors w-full sm:w-auto p-[1px] ${isAbsent && student.note ? 'bg-red-100' : ''}`}>
                      <Input 
                        placeholder="Thêm ghi chú..." 
                        value={student.note}
                        onChange={(e) => onNoteChange(student.id, e.target.value)}
                        className={`h-9 border-transparent focus-visible:ring-0 focus-visible:border-slate-300 bg-transparent text-sm font-semibold shadow-none ${
                          student.note ? (isAbsent ? 'text-red-700 placeholder-red-300 bg-red-50 hover:bg-red-100' : 'text-slate-700 hover:bg-slate-50') : 'text-slate-400 hover:bg-slate-50'
                        }`}
                      />
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors group inline-flex">
                      <MessageSquare className="h-5 w-5" fill={student.hasMessage ? "currentColor" : "none"} />
                      {student.hasMessage && (
                        <span className="absolute top-1.5 right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-[2px] border-white" />
                      )}
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {footer}
    </div>
  );
}
