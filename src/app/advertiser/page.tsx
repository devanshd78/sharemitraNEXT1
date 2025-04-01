"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const AdminDashboard = () => {
  const router = useRouter();

//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem("user") || "{}");

//     if (!user || user.role !== "admin") {
//       router.replace("/unauthorized"); // or redirect to login
//     }
//   }, []);

  return <div className="py-24">Admin Content Here</div>;
};

export default AdminDashboard