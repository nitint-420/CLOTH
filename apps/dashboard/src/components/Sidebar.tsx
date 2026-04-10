"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@ecom/ui";
import { LayoutDashboard, ShoppingCart, Package, Receipt, BookOpen, BarChart3, Settings, LogOut, Store, CreditCard, Menu, X, PackagePlus } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";


const nav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "POS / Billing", href: "/dashboard/pos", icon: Receipt },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Khata Book", href: "/dashboard/khata", icon: CreditCard },
  { name: "Daybook", href: "/dashboard/daybook", icon: BookOpen },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Purchase Entry", href: "/dashboard/purchase", icon: PackagePlus },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [storeName, setStoreName] = useState("Grocery");

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(d => {
        const s = d.settings?.find((x: any) => x.key === "store_name");
        if (s?.value) setStoreName(s.value);
      });
  }, []);

  const logout = async () => {
    toast.success("Logged out");
    router.push("/sign-in");
  };

  return (
    <>
      <button onClick={() => setOpen(!open)} className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border">
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
      {open && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />}
      <aside className={cn("fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r flex flex-col transform transition-transform lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="h-16 flex items-center px-6 border-b">
          <Store className="h-8 w-8 text-green-600 mr-2" />
          <span className="text-xl font-bold truncate">{storeName}</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={cn("flex items-center px-6 py-2.5 text-sm font-medium transition-all", active ? "text-green-600 bg-green-50 border-r-4 border-green-600" : "text-gray-600 hover:bg-gray-50")}>
                <Icon className="h-5 w-5 mr-3" />{item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <Link href="/dashboard/pos" className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
            <Receipt className="h-5 w-5" />New Sale
          </Link>
        </div>
        <div className="p-4 border-t">
          <button onClick={logout} className="flex items-center w-full px-4 py-2.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg">
            <LogOut className="h-5 w-5 mr-3" />Logout
          </button>
        </div>
      </aside>
    </>
  );
}