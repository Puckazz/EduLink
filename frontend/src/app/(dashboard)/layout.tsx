export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white">{/* Sidebar */}</aside>
      <div className="flex flex-col flex-1">
        <header className="h-16 border-b">{/* Header */}</header>
        <main className="flex-1 p-6">{children}</main>
        <footer className="h-12 border-t">{/* Footer */}</footer>
      </div>
    </div>
  );
}
