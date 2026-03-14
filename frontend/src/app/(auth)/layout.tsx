export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 sm:p-8">
      <div className="w-full max-w-[1100px]">{children}</div>
      <footer className="mt-6 text-center text-sm font-medium text-muted-foreground">
        &copy; {new Date().getFullYear()} EduLink. All rights reserved.
      </footer>
    </div>
  );
}
