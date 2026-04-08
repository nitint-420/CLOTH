import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-64"><Header /><main className="p-4 lg:p-6">{children}</main></div>
    </div>
  );
}
