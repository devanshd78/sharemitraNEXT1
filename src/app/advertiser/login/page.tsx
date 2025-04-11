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
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  // Check for an existing admin user to avoid SSR issues.
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

  // Validate email and password fields
  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email.";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login API integration with proper error handling
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await axios.post("http://127.0.0.1:5000/admin/login", {
        email,
        password,
      });

      // Using standardized response keys from the centralized formatter:
      if (response?.data?.success) {
        // Save admin user data and navigate to dashboard.
        localStorage.setItem("user", JSON.stringify(response.data.data));
        router.replace("/advertiser/dashboard");
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: response?.data?.message || "Unknown error occurred.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error: any) {
      // Updated error retrieval uses the "message" key as standardized in format_response.
      let errorMessage = "Something went wrong. Please try again later.";
      if (error.response) {
        errorMessage =
          error.response.data?.message || "Login failed due to server error.";
      } else if (error.request) {
        errorMessage =
          "No response from server. Check your internet connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      Swal.fire({
        icon: "error",
        title: "Login Error",
        text: errorMessage,
        timer: 2500,
        showConfirmButton: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">
          Sharemitra Admin Login
        </h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-medium mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition duration-300"
            />
            {errors.email && (
              <span className="text-red-600 text-sm mt-1 block">
                {errors.email}
              </span>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-medium mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition duration-300"
            />
            {errors.password && (
              <span className="text-red-600 text-sm mt-1 block">
                {errors.password}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-green-600 text-white py-2 rounded-lg shadow transition duration-300 ${
              loading ? "opacity-60 cursor-not-allowed" : "hover:bg-green-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
