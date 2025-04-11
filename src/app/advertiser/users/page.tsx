"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiDownload } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

type User = {
  userId: string;
  referralCode: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
};

const UserList: React.FC = () => {
  // State for user list and metadata
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Pagination state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] =
    useState<string>(searchTerm);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const router = useRouter();

  // ---------------------------
  // Debounce Effect for Search Term
  // ---------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // ---------------------------
  // Fetch Users from API with Pagination & Debounced Search
  // ---------------------------
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://127.0.0.1:5000/user/getlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // API expects page to be zero-indexed.
        body: JSON.stringify({
          keyword: debouncedSearchTerm.trim(),
          page: currentPage - 1,
          per_page: pageSize,
        }),
      });
      const data = await res.json();
      // Check both HTTP status and internal success flag.
      if (!res.ok || !data.success) {
        Swal.fire("Error", data.message || "Failed to fetch users", "error");
        throw new Error(data.message || "Failed to fetch users");
      }
      // Use centralized data payload.
      setUsers(data.data.users);
      setTotalUsers(data.data.total);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, currentPage, pageSize]);

  // Fetch users on initial load and whenever dependencies change.
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset to first page when debounced search term or pageSize changes.
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, pageSize]);

  const totalPages = Math.ceil(totalUsers / pageSize);
  const showingFrom = totalUsers === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const showingTo = Math.min(currentPage * pageSize, totalUsers);

  // ---------------------------
  // Navigation & Handlers
  // ---------------------------
  const handleRowClick = (userId: string) => {
    router.push(`/advertiser/users/user-detail?Id=${userId}`);
  };

  const handleExportExcel = async () => {
    if (totalUsers === 0) {
      Swal.fire("No users", "There are no users to export.", "info");
      return;
    }
    try {
      const response = await fetch("http://127.0.0.1:5000/download/users", {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Failed to download users");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "users.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Error exporting users:", error);
      Swal.fire("Error", error.message || "Failed to export users.", "error");
    }
  };

  return (
    <div className="p-4">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-700">
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Top Controls: Search, Rows per page, and Export Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sm:w-1/3"
            />
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <label htmlFor="pageSize" className="text-green-700 font-medium">
                  Rows:
                </label>
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={(e) => setPageSize(parseInt(e.target.value))}
                  className="border-2 border-green-400 rounded px-2 py-1 focus:ring-2 focus:ring-green-500"
                >
                  {[5, 10, 20, 50].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleExportExcel}
                className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500"
              >
                <FiDownload size={18} />
                Download Excel
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="flex items-center justify-center p-4">
                <svg
                  className="animate-spin h-6 w-6 text-green-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
                <span className="ml-2 text-green-600 font-medium">
                  Loading...
                </span>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10">
              <span className="text-6xl mb-4">💰</span>
              <p className="text-lg text-red-500">{error}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No user details available.
              </p>
            </div>
          ) : users && users.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No.</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Referral Code</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Updated At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user, index) => (
                      <TableRow
                        key={user.userId}
                        onClick={() => handleRowClick(user.userId)}
                        className="cursor-pointer hover:bg-green-100 transition-colors"
                      >
                        <TableCell>
                          {(currentPage - 1) * pageSize + index + 1}
                        </TableCell>
                        <TableCell>{user.userId}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>{user.referralCode}</TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {new Date(user.updatedAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableCaption>
                    {totalUsers > 0 ? (
                      <span>
                        Showing {showingFrom} to {showingTo} of {totalUsers} users
                      </span>
                    ) : (
                      <span>Showing 0 to 0 of 0 users</span>
                    )}
                  </TableCaption>
                </Table>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4">
                <div>
                  <span className="text-sm">
                    Showing {showingFrom} to {showingTo} of {totalUsers} users
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <span className="text-6xl mb-4">💰</span>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                No user details available!
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your users will be displayed here once available.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserList;
