"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FiHome,
  FiSettings,
  FiUser,
  FiLogOut,
  FiCheckSquare,
  FiMenu,
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Determine if current page is the login page
  const isLoginPage = pathname === "/advertiser/login";

  useEffect(() => {
    // Check for a stored user only on the client
    const userStr = localStorage.getItem("user");
    console.log("AdminLayout localStorage user:", userStr);
    const user = userStr ? JSON.parse(userStr) : null;
    if (user && user.role === "admin") {
      setAuthenticated(true);
    } else if (!isLoginPage) {
      // Only redirect if not on login page
      router.replace("/advertiser/login");
    }
    setLoading(false);
  }, [router, isLoginPage]);

  if (loading) return <div>Loading...</div>;
  // If not on login page and not authenticated, render nothing
  if (!authenticated && !isLoginPage) return null;

  // If on the login page, simply render the children (login page content) without sidebar
  if (isLoginPage) {
    return <main className="p-6">{children}</main>;
  }

  const navItems = [
    { name: "Dashboard", href: "/advertiser/dashboard", icon: <FiHome /> },
    { name: "Users", href: "/advertiser/users", icon: <FiUser /> },
    { name: "Tasks", href: "/advertiser/tasks", icon: <FiCheckSquare /> },
    { name: "Payout", href: "/advertiser/payout", icon: <FaRupeeSign /> },
    { name: "Settings", href: "/advertiser/settings", icon: <FiSettings /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.replace("/advertiser/login");
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-green-50">
      {/* Sidebar for desktop */}
      <aside className="hidden md:block md:w-64 border-r border-green-200 p-6 bg-white">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-green-800">Advertiser Panel</h2>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-center px-4 py-3 rounded-md cursor-pointer transition ${
                  pathname === item.href
                    ? "bg-green-600 text-white"
                    : "text-green-700 hover:bg-green-100"
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </div>
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-6">
          <Button variant="destructive" className="w-full" onClick={handleLogout}>
            <FiLogOut className="mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile header and sidebar */}
      <div className="md:hidden">
        <div className="p-4 bg-white border-b border-green-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-green-800">Advertiser Panel</h2>
          <Button variant="outline" onClick={() => setMobileSidebarOpen(true)}>
            <FiMenu />
          </Button>
        </div>
        <Dialog open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <DialogTrigger asChild>
            {/* Invisible trigger as the button above already toggles the state */}
            <div />
          </DialogTrigger>
          <DialogContent className="w-full max-w-sm p-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-green-800">Menu</DialogTitle>
            </DialogHeader>
            <nav className="space-y-2 mt-4">
              {navItems.map((item) => (
                <Link key={item.name} href={item.href} onClick={() => setMobileSidebarOpen(false)}>
                  <div
                    className={`flex items-center px-4 py-3 rounded-md cursor-pointer transition ${
                      pathname === item.href
                        ? "bg-green-600 text-white"
                        : "text-green-700 hover:bg-green-100"
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                </Link>
              ))}
            </nav>
            <div className="mt-6">
              <Button variant="destructive" className="w-full" onClick={handleLogout}>
                <FiLogOut className="mr-2" />
                Logout
              </Button>
            </div>
            <div className="mt-4 flex justify-end">
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main content scrollable area */}
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
};

export default AdminLayout;
