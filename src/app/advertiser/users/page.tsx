"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  // Debounced search term state
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>(searchTerm);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const router = useRouter();

  // ---------------------------
  // Debounce Effect for Search Term
  // ---------------------------
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // Adjust the debounce delay as needed

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // ---------------------------
  // Fetch Users from API with Pagination & Search
  // ---------------------------
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://127.0.0.1:5000/user/getlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // API expects page to be zero-indexed.
        body: JSON.stringify({
          keyword: debouncedSearchTerm,
          page: currentPage - 1,
          per_page: pageSize,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Swal.fire("Error", data.error || "Failed to fetch users", "error");
        throw new Error(data.error || "Failed to fetch users");
      }

      setUsers(data.users);
      setTotalUsers(data.total);
    } catch (err: any) {
      setError(err.message);
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

  const handleExportExcel = () => {
    if (totalUsers === 0) {
      Swal.fire("No users", "There are no users to export.", "info");
      return;
    }
  
    fetch("http://127.0.0.1:5000/download/users", {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to download users");
        }
        return response.blob();
      })
      .then((blob) => {
        // Create a temporary URL for the blob and trigger the download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "users.xlsx"; // Adjust file name/extension as needed
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // Optionally revoke the object URL to free up resources
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error("Error exporting users:", error);
        Swal.fire("Error", "Failed to export users.", "error");
      });
  };  

  // ---------------------------
  // Render
  // ---------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg font-medium">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card className="shadow-lg p-2">
        {/* Header Area */}
        <CardHeader className="py-4">
          <CardTitle className="text-2xl font-bold text-green-700">
            User Management
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* Top Controls: Search, Rows per page, Download, Add User */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            {/* Left: Search */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-2 border-green-400 focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Right: Rows dropdown, Download CSV, Add User */}
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
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <Button
                onClick={handleExportExcel}
                className="bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500"
              >
                Download Excel
              </Button>
            </div>
          </div>

          {/* Table */}
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
              {users.length > 0 ? (
                users.map((user, index) => (
                  <TableRow
                    key={user.userId}
                    onClick={() => handleRowClick(user.userId)}
                    className="cursor-pointer hover:bg-green-100 transition-colors"
                  >
                    <TableCell>{(currentPage - 1) * pageSize + index + 1}</TableCell>
                    <TableCell>{user.userId}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{user.referralCode}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{new Date(user.updatedAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            {/* Table Caption with Pagination Info */}
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
        </CardContent>

        {/* Bottom Pagination Controls */}
        <div className="flex justify-end items-center p-4 space-x-4">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500"
          >
            Previous
          </Button>
          <Button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500"
          >
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default UserList;
