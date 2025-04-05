"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useModalStore } from "./stores/modalStore";

interface User {
  name: string;
  profileImage: string;
}

interface NavbarProps {
  walletBalance: number;
}


const Navbar: React.FC<NavbarProps> = ({ walletBalance }) => {
  const pathname = usePathname();
  const router = useRouter();

  // State Hooks
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { openLoginModal } = useModalStore();

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (pathname === "/login" || pathname.startsWith("/advertiser") || pathname.startsWith("/my-account")) return;

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          name: parsedUser.name,
          profileImage: "/placeholder.jpg",
        });
      } catch (err) {
        console.error("Failed to parse user from localStorage:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("referralCode");
      }
    }
  }, [pathname]);

  // Conditionally return null AFTER all hooks have been called
  if (pathname === "/login" || pathname.startsWith("/advertiser") || pathname.startsWith("/my-account")) return null;

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("referralCode");
    setUser(null);
    router.push("/home");
    window.location.reload();
  };

  return (
    <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 left-0 border-b border-gray-200 dark:border-gray-600 font-sans">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between p-4">
        
        {/* Brand & Logo */}
        <div
          onClick={() => router.push("/home")}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <img
            src="/logo.jpeg"
            alt="Logo"
            className="w-10 h-10 rounded-full"
          />
          <span className="text-3xl font-bold tracking-tight text-green-500 dark:text-green-400">
            Sharemitra
          </span>
        </div>

        {/* Middle Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          <span
            onClick={() => router.push("/home#about")}
            className="text-base font-semibold cursor-pointer hover:text-green-500 dark:hover:text-green-400"
          >
            About
          </span>
          <span
            onClick={() => router.push("/home#task")}
            className="text-base font-semibold cursor-pointer hover:text-green-500 dark:hover:text-green-400"
          >
            Task
          </span>
          <span
            onClick={() => router.push("/home/prev-task")}
            className="text-base font-semibold cursor-pointer hover:text-green-500 dark:hover:text-green-400"
          >
            Prev Task
          </span>
          <span
            onClick={() => router.push("/contact-us")}
            className="text-base font-semibold cursor-pointer hover:text-green-500 dark:hover:text-green-400"
          >
            Contact Us
          </span>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="relative">
              {/* Avatar & Name Button */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center bg-gray-200 hover:bg-gray-300 rounded-full px-3 py-2 focus:outline-none cursor-pointer"
              >
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span className="text-gray-700 text-sm font-medium">
                {user.name} | ₹ {walletBalance}
                </span>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
                  <ul className="py-2 text-sm font-medium">
                    <li>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          router.push("/my-account/profile");
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        My Account
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 cursor-pointer"
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <button
              className="bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-green-700 cursor-pointer"
              onClick={openLoginModal}
            >
              Sign Up / Log In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
