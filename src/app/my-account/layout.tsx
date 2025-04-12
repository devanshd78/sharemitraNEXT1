// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import {
//   FaUser,
//   FaCreditCard,
//   FaTasks,
//   FaMoneyCheck,
//   FaUsers,
//   FaWallet,
//   FaHome,
//   FaBars,
//   FaSignOutAlt,
// } from "react-icons/fa";
// import { Lexend } from "next/font/google";
// import { useRouter } from "next/navigation";
// // Shadcn-inspired UI components
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// // Import Sidebar components and provider
// import {
//   Sidebar,
//   SidebarHeader,
//   SidebarContent as SBContent,
//   SidebarFooter,
//   SidebarProvider,
// } from "@/components/ui/sidebar";

// const lexend = Lexend({
//   subsets: ["latin"],
//   weight: "400",
// });

// export default function MyAccountLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   // State
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [activePath, setActivePath] = useState<string>("/my-account/latest-task");
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const router = useRouter();

//   // Sidebar menu items
//   const menuItems = [
//     {
//       name: "Latest Task",
//       icon: <FaTasks />,
//       path: "/my-account/latest-task",
//       highlight: true,
//     },
//     { name: "My Profile", icon: <FaUser />, path: "/my-account/profile" },
//     {
//       name: "Payment Details",
//       icon: <FaCreditCard />,
//       path: "/my-account/payment-details",
//     },
//     { name: "Task Status", icon: <FaTasks />, path: "/my-account/task-status" },
//     {
//       name: "Payment Status",
//       icon: <FaMoneyCheck />,
//       path: "/my-account/payment-status",
//     },
//     { name: "Refer & Earn", icon: <FaUsers />, path: "/my-account/refer-earn" },
//     { name: "Wallet", icon: <FaWallet />, path: "/my-account/wallet" },
//   ];

//   // Find the active menu item (for breadcrumb in desktop)
//   const activeMenu = menuItems.find((item) => item.path === activePath);

//   useEffect(() => {
//     // Optional: side effects when activePath changes
//   }, [activePath]);

//   const handleLogout = () => {
//     console.log("Logging out...");
//     window.localStorage.clear();
//     router.push("/");
//   };

//   return (
//     <SidebarProvider>
//       {/* Outer container uses flex-col on mobile and row on desktop */}
//       <div className={`${lexend.className} flex flex-col lg:flex-row min-h-screen bg-green-50 w-full`}>
//         {/* MOBILE VIEW */}
//         <div className="lg:hidden">
//           {/* Fixed Mobile Navbar */}
//           <header className="bg-green-600 text-white p-4 flex items-center justify-between shadow-md fixed top-0 left-0 right-0 z-40">
//             <div className="flex items-center">
//               <Image
//                 src="/logo.png"
//                 alt="ShareMitra Logo"
//                 width={120}
//                 height={50}
//                 className="rounded-full"
//               />
//             </div>
//             <button
//               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//               className="p-2 rounded-full bg-green-700 hover:bg-green-800 transition-colors"
//             >
//               <FaBars className="text-xl" />
//             </button>
//           </header>

//           {/* Mobile Navigation Dropdown */}
//           {isMobileMenuOpen && (
//             <div className="mt-16 w-full bg-gradient-to-br from-green-700 to-green-900 text-white shadow-md z-30">
//               <div className="p-6">
//                 {/* Navigation links */}
//                 <nav className="flex flex-col space-y-4">
//                   {menuItems.map((item) => (
//                     <Link
//                       key={item.name}
//                       href={item.path}
//                       onClick={() => {
//                         setActivePath(item.path);
//                         setIsMobileMenuOpen(false);
//                       }}
//                       className={`block px-4 py-3 transition-colors duration-200 ${
//                         activePath === item.path
//                           ? "bg-green-800 rounded-lg"
//                           : "hover:bg-green-600 rounded-lg"
//                       } ${item.highlight ? "bg-gradient-to-r from-green-600 to-green-800 shadow-md rounded-lg" : ""}`}
//                     >
//                       <div className="flex items-center">
//                         <span className="text-xl">{item.icon}</span>
//                         <span className="ml-4 font-semibold">{item.name}</span>
//                         {item.highlight && (
//                           <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
//                             New
//                           </span>
//                         )}
//                       </div>
//                     </Link>
//                   ))}
//                 </nav>
//                 <Separator className="my-6 border-white/40" />
//                 <div className="flex flex-col space-y-4">
//                   <Link
//                     href="/"
//                     className="block text-center bg-green-600 hover:bg-green-700 transition-colors p-3 rounded-lg text-white"
//                   >
//                     <FaHome className="inline mr-2" />
//                     Go to Home
//                   </Link>
//                   <button
//                     onClick={handleLogout}
//                     className="w-full block text-center bg-red-500 hover:bg-red-400 transition-colors p-3 rounded-lg text-white"
//                   >
//                     <FaSignOutAlt className="inline mr-2" />
//                     Log Out
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Spacer for mobile main content below the fixed navbar */}
//           <div className="h-16" />
//         </div>

//         {/* DESKTOP VIEW using shadcn Sidebar */}
//         <aside className="hidden lg:block">
//           <Sidebar
//             className={`fixed top-0 left-0 h-full transition-all duration-300 ${
//               isCollapsed ? "w-20" : "w-64"
//             } text-white shadow-lg`}
//           >
//             <SidebarHeader>
//               <div className="flex items-center justify-between p-6">
//                 <div className="flex items-center">
//                   <Image
//                     src="/logo.png"
//                     alt="ShareMitra Logo"
//                     width={50}
//                     height={50}
//                     className="rounded-full"
//                   />
//                   {!isCollapsed && (
//                     <span className="ml-4 text-2xl font-extrabold tracking-wide">
//                       ShareMitra
//                     </span>
//                   )}
//                 </div>
//                 {/* Optional collapse toggle button */}
//               </div>
//             </SidebarHeader>
//             <SBContent>
//               <div className="flex flex-col space-y-4 px-6">
//                 {menuItems.map((item) => (
//                   <Link
//                     key={item.name}
//                     href={item.path}
//                     onClick={() => setActivePath(item.path)}
//                     className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
//                       activePath === item.path ? "bg-green-800" : "hover:bg-green-600"
//                     } ${item.highlight ? "bg-gradient-to-r from-green-600 to-green-800 shadow-md" : ""}`}
//                   >
//                     <div className="text-xl">{item.icon}</div>
//                     {!isCollapsed && (
//                       <span className="ml-4 font-semibold">{item.name}</span>
//                     )}
//                     {item.highlight && (
//                       <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
//                         New
//                       </span>
//                     )}
//                   </Link>
//                 ))}
//               </div>
//             </SBContent>
//             <SidebarFooter>
//               <div className="p-6">
//                 <Separator className="border-white/40" />
//                 <Link
//                   href="/"
//                   className="flex items-center justify-center p-3 mt-4 rounded-lg bg-green-600 hover:bg-green-700 transition-colors"
//                 >
//                   <FaHome className="text-xl mr-2" />
//                   <span className="font-semibold">Go to Home</span>
//                 </Link>
//                 <button
//                   onClick={handleLogout}
//                   className="flex items-center justify-center p-3 mt-4 rounded-lg bg-red-500 hover:bg-red-400 transition-colors w-full"
//                 >
//                   <FaSignOutAlt className="text-xl mr-2" />
//                   <span className="font-semibold">Log Out</span>
//                 </button>
//               </div>
//             </SidebarFooter>
//           </Sidebar>
//         </aside>

//         {/* MAIN CONTENT AREA */}
//         <div className="flex-1 w-full flex flex-col">
//           {/* Desktop Breadcrumb Header */}
//           <div className="hidden lg:block">
//             <header className="bg-green-600 text-white p-6 shadow-md">
//               <div className="container mx-auto">
//                 <nav className="flex items-center text-sm" aria-label="Breadcrumb">
//                   <ol className="inline-flex items-center space-x-1 md:space-x-3">
//                     {/* Home breadcrumb */}
//                     <li className="inline-flex items-center">
//                       <Link
//                         href="/"
//                         className="inline-flex items-center text-white hover:text-gray-200"
//                       >
//                         <FaHome className="mr-1" />
//                         Home
//                       </Link>
//                     </li>
//                     {/* My Account breadcrumb */}
//                     <li>
//                       <div className="flex items-center">
//                         <svg
//                           className="w-4 h-4 text-white"
//                           fill="currentColor"
//                           viewBox="0 0 20 20"
//                           xmlns="http://www.w3.org/2000/svg"
//                         >
//                           <path
//                             d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
//                           />
//                         </svg>
//                         <span className="ml-1 md:ml-2 text-white font-bold">
//                           My Account
//                         </span>
//                       </div>
//                     </li>
//                     {/* Active menu breadcrumb (if available) */}
//                     {activePath &&
//                       activePath !== "/my-account/latest-task" &&
//                       activeMenu && (
//                         <li>
//                           <div className="flex items-center">
//                             <svg
//                               className="w-4 h-4 text-white"
//                               fill="currentColor"
//                               viewBox="0 0 20 20"
//                               xmlns="http://www.w3.org/2000/svg"
//                             >
//                               <path
//                                 d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
//                               />
//                             </svg>
//                             <span className="ml-1 md:ml-2 text-white font-bold">
//                               {activeMenu.name}
//                             </span>
//                           </div>
//                         </li>
//                       )}
//                   </ol>
//                 </nav>
//               </div>
//             </header>
//           </div>

//           {/* Main Content */}
//           <main className="flex-1 bg-green-50 p-8 overflow-y-auto">{children}</main>
//         </div>
//       </div>
//     </SidebarProvider>
//   );
// }

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  User,
  CreditCard,
  ClipboardList,
  CheckCircle,
  IndianRupeeIcon as CurrencyRupee,
  Users,
  Menu,
  LogOut,
} from "lucide-react";
import { Lexend } from "next/font/google";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const lexend = Lexend({ subsets: ["latin"], weight: "400" });

export default function MyAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    {
      name: "Latest Task",
      icon: <ClipboardList size={18} />,
      path: "/my-account/latest-task",
      highlight: true,
      new: true,
    },
    { name: "My Profile", icon: <User size={18} />, path: "/my-account/profile" },
    { name: "Payment Details", icon: <CreditCard size={18} />, path: "/my-account/payment-details" },
    { name: "Task Status", icon: <CheckCircle size={18} />, path: "/my-account/task-status" },
    { name: "Payment Status", icon: <CurrencyRupee size={18} />, path: "/my-account/payment-status" },
    { name: "Refer & Earn", icon: <Users size={18} />, path: "/my-account/refer-earn" },
    { name: "Wallet", icon: <CurrencyRupee size={18} />, path: "/my-account/wallet" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  const baseBtn =
    "flex items-center w-full justify-start rounded-lg px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700 transition";
  const activeBtn =
    "flex items-center w-full justify-start rounded-lg px-4 py-2 bg-green-600 text-white";
  const highlightBtn =
    "flex items-center w-full justify-start rounded-lg px-4 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white shadow hover:from-green-600 hover:to-green-800 transition-all duration-300";

  return (
    <div className={`${lexend.className} flex h-screen bg-gradient-to-br from-green-100 to-white`}>
      {/* MOBILE HEADER */}
      <header className="lg:hidden fixed inset-x-0 top-0 bg-white text-gray-800 px-4 py-3 flex justify-between items-center shadow z-20">
        <Image src="/logo.png" alt="Logo" width={100} height={40} priority />
        <Button variant="ghost" onClick={() => setMobileOpen((o) => !o)} aria-label="Menu">
          <Menu size={24} />
        </Button>
      </header>

      {/* MOBILE NAVIGATION */}
      {mobileOpen && (
        <nav className="lg:hidden fixed inset-x-0 top-16 bg-white shadow-md z-10 p-4 space-y-3 rounded-b-lg">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const cls = item.highlight
              ? highlightBtn
              : isActive
                ? activeBtn
                : baseBtn;
            return (
              <Link key={item.name} href={item.path}>
                <button className={cls} onClick={() => setMobileOpen(false)}>
                  {item.icon}
                  <span className="ml-2 flex items-center justify-between w-full">
                    <span>{item.name}</span>
                    {item.new && (
                      <span className="text-xs bg-white text-green-700 font-bold px-2 py-0.5 rounded-full animate-pulse">
                        NEW
                      </span>
                    )}
                  </span>
                </button>
              </Link>
            );
          })}

          <Separator className="my-3 border-gray-200" />

          <Link href="/">
            <Button
              variant="outline"
              className="w-full justify-start rounded-lg px-4 py-2 text-green-700 border-green-300 bg-white hover:bg-green-50"
            >
              <Home size={18} className="mr-2" /> Home
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full justify-start rounded-lg px-4 py-2 mt-2 text-green-700 border-green-300 bg-white hover:bg-green-50"
            onClick={handleLogout}
          >
            <LogOut size={18} className="mr-2" /> Log Out
          </Button>
        </nav>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-60 bg-white text-gray-800 p-6 shadow-md">
        <div className="flex items-center mb-8">
          <Image src="/logo.png" alt="Logo" width={200} height={40} priority />
          {/* <span className="ml-3 text-xl font-semibold">ShareMitra</span> */}
        </div>

        <div className="flex-1 space-y-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const cls = item.highlight
              ? "flex items-center w-full justify-start rounded-lg px-4 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white shadow hover:from-green-600 hover:to-green-800 transition-all duration-300 my-1"
              : isActive
                ? "flex items-center w-full justify-start rounded-lg px-4 py-2 bg-green-600 text-white my-1"
                : "flex items-center w-full justify-start rounded-lg px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700 transition my-1";
            return (
              <Link key={item.name} href={item.path}>
                <button className={cls} onClick={() => setMobileOpen(false)}>
                  {item.icon}
                  <span className="ml-2 flex items-center justify-between w-full">
                    <span>{item.name}</span>
                    {item.new && (
                      <span className="text-xs italic bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full animate-pulse">
                        NEW
                      </span>

                    )}
                  </span>
                </button>
              </Link>

            );
          })}
        </div>

        <Separator className="my-6 border-gray-300" />

        <Link href="/">
          <Button
            variant="outline"
            className="w-full justify-start rounded-lg px-4 py-2 text-green-700 border-green-300 bg-white hover:bg-green-50"
          >
            <Home size={18} className="mr-2" /> Home
          </Button>
        </Link>
        <Button
          variant="outline"
          className="w-full justify-start rounded-lg px-4 py-2 mt-2 text-green-700 border-green-300 bg-white hover:bg-green-50"
          onClick={handleLogout}
        >
          <LogOut size={18} className="mr-2" /> Log Out
        </Button>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col transition-all duration-300">
        {/* DESKTOP HEADER / BREADCRUMB */}
        <header className="hidden lg:flex items-center bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-800">
            <Home size={16} className="mr-1 text-green-600" /> Home
          </Link>
          <span className="mx-3 text-gray-400">/</span>
          <span className="text-gray-800 font-medium">My Account</span>
          {pathname !== "/my-account/latest-task" && (
            <>
              <span className="mx-3 text-gray-400">/</span>
              <span className="text-gray-800">
                {menuItems.find((item) => item.path === pathname)?.name}
              </span>
            </>
          )}
        </header>

        <main className="flex-1 overflow-y-auto bg-white/80 mt-16 lg:mt-0 rounded-tr-lg rounded-br-lg shadow-inner">
          {children}
        </main>
      </div>
    </div>
  );
}
