"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import axios from "axios";

const AdminLogin: React.FC = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Set mounted to true to avoid SSR issues and check if user is already logged in
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Call the backend admin login API
      const response = await axios.post("http://127.0.0.1:5000/admin/login", {
        email,
        password,
      });
      if (response.data.msg == "Login successful") {
        console.log(response.data);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        router.replace("/advertiser/dashboard");
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Error",
          text: response.data.msg,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Login Error",
        text: error.response ? error.response.data.msg : error.message,
        timer: 1500,
        showConfirmButton: false,
      });
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
