

export function AttendancePageHeader() {
  return (
    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
      <div className="max-w-xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 mb-2">
          Danh sách Khóa học & Lớp học
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Chọn một lớp học để bắt đầu quản lý điểm danh và theo dõi tiến độ sinh viên.
        </p>
      </div>
    </div>
  );
}
