"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AdminLogin = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Set mounted to true to avoid SSR issues
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      if (user && user.role === "admin") {
        router.replace("/advertiser/dashboard");
      }
    }
  }, [router]);

  if (!isMounted) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock authentication check
    if (email === "admin@example.com" && password === "admin123") {
      localStorage.setItem("user", JSON.stringify({ role: "admin" }));
      router.replace("/advertiser/dashboard");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-3 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-3 border rounded"
            required
          />
          <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;