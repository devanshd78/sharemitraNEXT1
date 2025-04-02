"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AdminDashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!user || user.role !== "admin") {
      router.replace("/advertiser/login"); // Redirect to admin login
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) return <div>Loading...</div>;

  return <div>Advertiser Content Here</div>;
};

export default AdminDashboard;