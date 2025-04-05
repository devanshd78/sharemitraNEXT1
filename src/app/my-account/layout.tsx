"use client";

import { useState, useEffect } from "react";
import {
  FaUser,
  FaCreditCard,
  FaTasks,
  FaMoneyCheck,
  FaUsers,
  FaWallet,
  FaHome,
  FaBars,
} from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { Lexend } from "next/font/google";

const lexend = Lexend({
  subsets: ["latin"],
  weight: "400",
});

export default function MyAccountLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePath, setActivePath] = useState<string>("/my-account/profile");

  useEffect(() => {
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
  }, [activePath]);

  // Insert the new "Latest Task" option at the top.
  const menuItems = [
    { name: "Latest Task", icon: <FaTasks />, path: "/my-account/latest-task", highlight: true },
    { name: "My Profile", icon: <FaUser />, path: "/my-account/profile" },
    { name: "Payment Details", icon: <FaCreditCard />, path: "/my-account/payment-details" },
    { name: "Task Status", icon: <FaTasks />, path: "/my-account/task-status" },
    { name: "Payment Status", icon: <FaMoneyCheck />, path: "/my-account/payment-status" },
    { name: "Refer & Earn", icon: <FaUsers />, path: "/my-account/refer-earn" },
    { name: "Wallet", icon: <FaWallet />, path: "/my-account/wallet" },
  ];

  return (
    <div className={`flex h-screen bg-green-50 dark:bg-zinc-950 ${lexend.className}`}>
      {/* Mobile Menu Button */}
      {!isMobileMenuOpen && (
        <button
          className="lg:hidden absolute top-4 left-4 z-50 bg-green-600 text-white p-2 rounded-full shadow-md"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <FaBars className="text-xl" />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative top-0 left-0 h-screen bg-green-600 text-white transition-all duration-300 z-40
          ${isMobileMenuOpen ? "w-64" : isCollapsed ? "w-20" : "w-64"} 
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Image
              src="/logo.jpeg"
              alt="Logo"
              width={40}
              height={40}
              className="rounded-full cursor-pointer"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {!isCollapsed && <span className="ml-3 text-xl font-bold">ShareMitra</span>}
          </div>
          {/* Close Button for Mobile */}
          <button
            className="lg:hidden text-white text-2xl"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            ✖
          </button>
        </div>

        {/* Menu Items */}
        <nav className="mt-6">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              onClick={() => setActivePath(item.path)}
              className={`flex items-center w-full p-3 rounded-lg transition duration-200 ease-in-out ${
                activePath === item.path
                  ? "bg-green-800"
                  : item.highlight
                  ? "bg-gradient-to-r from-blue-600 to-green-800 transform hover:scale-105 mb-4"
                  : "hover:bg-green-700"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {!isCollapsed && <span className="ml-3">{item.name}</span>}
              {item.highlight && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                  New
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* "Go to Home" Button */}
        <div className="absolute bottom-4 left-4 right-4">
          <hr className="mb-3" />
          <Link
            href="/"
            className="flex items-center justify-center w-full p-3 rounded-lg text-center bg-green-700 hover:bg-green-800 transition duration-300"
          >
            <FaHome className="text-xl mr-2" />
            {!isCollapsed && <span>Go to Home</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 overflow-y-auto">{children}</main>
    </div>
  );
}
