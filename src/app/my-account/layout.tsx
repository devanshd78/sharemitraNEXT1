"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaUser,
  FaCreditCard,
  FaTasks,
  FaMoneyCheck,
  FaUsers,
  FaWallet,
  FaHome,
  FaBars,
  FaSignOutAlt,
} from "react-icons/fa";
import { Lexend } from "next/font/google";
import { useRouter } from "next/navigation";
// Shadcn-inspired UI components
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
// Import Sidebar components and provider
import {
  Sidebar,
  SidebarHeader,
  SidebarContent as SBContent,
  SidebarFooter,
  SidebarProvider,
} from "@/components/ui/sidebar";

const lexend = Lexend({
  subsets: ["latin"],
  weight: "400",
});

export default function MyAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // State
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activePath, setActivePath] = useState<string>("/my-account/latest-task");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Sidebar menu items
  const menuItems = [
    {
      name: "Latest Task",
      icon: <FaTasks />,
      path: "/my-account/latest-task",
      highlight: true,
    },
    { name: "My Profile", icon: <FaUser />, path: "/my-account/profile" },
    {
      name: "Payment Details",
      icon: <FaCreditCard />,
      path: "/my-account/payment-details",
    },
    { name: "Task Status", icon: <FaTasks />, path: "/my-account/task-status" },
    {
      name: "Payment Status",
      icon: <FaMoneyCheck />,
      path: "/my-account/payment-status",
    },
    { name: "Refer & Earn", icon: <FaUsers />, path: "/my-account/refer-earn" },
    { name: "Wallet", icon: <FaWallet />, path: "/my-account/wallet" },
  ];

  // Find the active menu item (for breadcrumb in desktop)
  const activeMenu = menuItems.find((item) => item.path === activePath);

  useEffect(() => {
    // Optional: side effects when activePath changes
  }, [activePath]);

  const handleLogout = () => {
    console.log("Logging out...");
    window.localStorage.clear();
    router.push("/");
  };

  return (
    <SidebarProvider>
      {/* Outer container uses flex-col on mobile and row on desktop */}
      <div className={`${lexend.className} flex flex-col lg:flex-row min-h-screen bg-green-50 w-full`}>
        {/* MOBILE VIEW */}
        <div className="lg:hidden">
          {/* Fixed Mobile Navbar */}
          <header className="bg-green-600 text-white p-4 flex items-center justify-between shadow-md fixed top-0 left-0 right-0 z-40">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="ShareMitra Logo"
                width={120}
                height={50}
                className="rounded-full"
              />

              {/* <span className="ml-2 font-bold text-xl">ShareMitra</span> */}
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-full bg-green-700 hover:bg-green-800 transition-colors"
            >
              <FaBars className="text-xl" />
            </button>
          </header>

          {/* Mobile Navigation Dropdown */}
          {isMobileMenuOpen && (
            <div className="mt-16 w-full bg-gradient-to-br from-green-700 to-green-900 text-white shadow-md z-30">
              <div className="p-6">
                {/* Navigation links */}
                <nav className="flex flex-col space-y-4">
                  {menuItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.path}
                      onClick={() => {
                        setActivePath(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`block px-4 py-3 transition-colors duration-200 ${activePath === item.path
                        ? "bg-green-800 rounded-lg"
                        : "hover:bg-green-600 rounded-lg"
                        } ${item.highlight
                          ? "bg-gradient-to-r from-green-600 to-green-800 shadow-md rounded-lg"
                          : ""
                        }`}
                    >
                      <div className="flex items-center">
                        <span className="text-xl">{item.icon}</span>
                        <span className="ml-4 font-semibold">{item.name}</span>
                        {item.highlight && (
                          <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                            New
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </nav>
                <Separator className="my-6 border-white/40" />
                <div className="flex flex-col space-y-4">
                  <Link
                    href="/"
                    className="block text-center bg-green-600 hover:bg-green-700 transition-colors p-3 rounded-lg text-white"
                  >
                    <FaHome className="inline mr-2" />
                    Go to Home
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full block text-center bg-red-500 hover:bg-red-400 transition-colors p-3 rounded-lg text-white"
                  >
                    <FaSignOutAlt className="inline mr-2" />
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Spacer for mobile main content below the fixed navbar */}
          <div className="h-16" />
        </div>

        {/* DESKTOP VIEW using shadcn Sidebar */}
        <aside className="hidden lg:block">
          <Sidebar
            style={{
              background: "linear-gradient(to bottom right, #047857, #064e3b)"
            }}
            className={`fixed top-0 left-0 h-full transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"} text-white shadow-lg`}
          >

            <SidebarHeader>
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center">
                  <Image
                    src="/logo.png"
                    alt="ShareMitra Logo"
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                  {!isCollapsed && (
                    <span className="ml-4 text-2xl font-extrabold tracking-wide">
                      ShareMitra
                    </span>
                  )}
                </div>
                {/* Optional collapse toggle button */}
              </div>
            </SidebarHeader>
            <SBContent>
              <div className="flex flex-col space-y-4 px-6">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.path}
                    onClick={() => setActivePath(item.path)}
                    className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${activePath === item.path ? "bg-green-800" : "hover:bg-green-600"
                      } ${item.highlight
                        ? "bg-gradient-to-r from-green-600 to-green-800 shadow-md"
                        : ""
                      }`}
                  >
                    <div className="text-xl">{item.icon}</div>
                    {!isCollapsed && (
                      <span className="ml-4 font-semibold">{item.name}</span>
                    )}
                    {item.highlight && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                        New
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </SBContent>
            <SidebarFooter>
              <div className="p-6">
                <Separator className="border-white/40" />
                <Link
                  href="/"
                  className="flex items-center justify-center p-3 mt-4 rounded-lg bg-green-600 hover:bg-green-700 transition-colors"
                >
                  <FaHome className="text-xl mr-2" />
                  <span className="font-semibold">Go to Home</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center p-3 mt-4 rounded-lg bg-red-500 hover:bg-red-400 transition-colors w-full"
                >
                  <FaSignOutAlt className="text-xl mr-2" />
                  <span className="font-semibold">Log Out</span>
                </button>
              </div>
            </SidebarFooter>
          </Sidebar>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 w-full flex flex-col">
          {/* Desktop Breadcrumb Header */}
          <div className="hidden lg:block">
            <header className="bg-green-600 text-white p-6 shadow-md">
              <div className="container mx-auto">
                <nav className="flex items-center text-sm" aria-label="Breadcrumb">
                  <ol className="inline-flex items-center space-x-1 md:space-x-3">
                    {/* Home breadcrumb */}
                    <li className="inline-flex items-center">
                      <Link
                        href="/"
                        className="inline-flex items-center text-white hover:text-gray-200"
                      >
                        <FaHome className="mr-1" />
                        Home
                      </Link>
                    </li>
                    {/* My Account breadcrumb */}
                    <li>
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          />
                        </svg>
                        <span className="ml-1 md:ml-2 text-white font-bold">
                          My Account
                        </span>
                      </div>
                    </li>
                    {/* Active menu breadcrumb (if available) */}
                    {activePath &&
                      activePath !== "/my-account/latest-task" &&
                      activeMenu && (
                        <li>
                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              />
                            </svg>
                            <span className="ml-1 md:ml-2 text-white font-bold">
                              {activeMenu.name}
                            </span>
                          </div>
                        </li>
                      )}
                  </ol>
                </nav>
              </div>
            </header>
          </div>

          {/* Main Content */}
          <main className="flex-1 bg-green-50 p-8 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
