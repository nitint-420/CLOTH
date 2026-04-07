"use client";
import { useState, useEffect } from "react";
import { Bell, User, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";

export function Header() {
  const [user, setUser] = useState<any>(null);
  const [dd, setDd] = useState(false);
  const { signOut } = useClerk();

  useEffect(() => { 
    fetch("/api/auth/me").then(r => r.json()).then(d => { 
      if (d.user) setUser(d.user); 
    }).catch(() => {}); 
  }, []);

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="ml-14 lg:ml-0"><p className="text-sm font-medium text-gray-800">{today}</p></div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
          <Bell className="h-5 w-5" /><span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="relative">
          <button onClick={() => setDd(!dd)} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg">
            <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center"><User className="h-4 w-4 text-white" /></div>
            <div className="hidden sm:block text-left"><p className="text-sm font-medium">{user?.name || "..."}</p><p className="text-xs text-gray-500">{user?.role}</p></div>
            <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
          </button>
          {dd && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDd(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                <div className="px-4 py-2 border-b"><p className="text-sm font-medium">{user?.name}</p><p className="text-xs text-gray-500">{user?.phone}</p></div>
                <Link href="/dashboard/settings" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setDd(false)}>Settings</Link>
                <button 
                  onClick={() => signOut({ redirectUrl: "/sign-in" })} 
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
