import AppSidebar from "@/components/AppSidebar";

export default function ClaimsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="h-px w-full absolute top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary/30 via-primary/70 to-primary/30" />
      <AppSidebar />
      <main className="flex-1 overflow-y-auto bg-background">{children}</main>
    </div>
  );
}
