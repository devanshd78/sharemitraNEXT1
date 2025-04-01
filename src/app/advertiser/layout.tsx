'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiSettings, FiUser, FiLogOut } from 'react-icons/fi';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/advertiser', icon: <FiHome /> },
    { name: 'Users', href: '/advertiser/users', icon: <FiUser /> },
    { name: 'Settings', href: '/advertiser/settings', icon: <FiSettings /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md p-6 flex flex-col">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Admin Panel</h2>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-center px-4 py-3 rounded-md cursor-pointer transition ${
                  pathname === item.href
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-3">{item.icon}</span> {item.name}
              </div>
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <button className="flex items-center w-full px-4 py-3 text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">
            <FiLogOut className="mr-3" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;