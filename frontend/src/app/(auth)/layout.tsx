export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      {children}
      <footer className="mt-8 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} EduLink. All rights reserved.
      </footer>
    </div>
  );
}
