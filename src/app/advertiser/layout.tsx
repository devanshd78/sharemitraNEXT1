"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FiHome, FiSettings, FiUser, FiLogOut } from "react-icons/fi";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check for a stored user only on the client
    const userStr = localStorage.getItem("user");
    console.log("AdminLayout localStorage user:", userStr);
    const user = userStr ? JSON.parse(userStr) : null;
    if (user && user.role === "admin") {
      setAuthenticated(true);
    } else {
      router.replace("/advertiser/login");
    }
    setLoading(false);
  }, [router]);

  if (loading) return <div>Loading...</div>;
  if (!authenticated) return null;

  const navItems = [
    { name: "Dashboard", href: "/advertiser", icon: <FiHome /> },
    { name: "Users", href: "/advertiser/users", icon: <FiUser /> },
    { name: "Settings", href: "/advertiser/settings", icon: <FiSettings /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.replace("/advertiser/login");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 border-r border-border p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Admin Panel</h2>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-center px-4 py-3 rounded-md cursor-pointer transition ${
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
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
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
};

export default AdminLayout;