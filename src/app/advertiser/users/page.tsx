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

type User = {
  userId: string;
  referralCode: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  // Additional fields from the API can be added here
};

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const router = useRouter();

  // Pagination state
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://127.0.0.1:5000/user/getlist");
      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset current page when search term or users change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, users]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  const handleRowClick = (userId: string) => {
    router.push(`/advertiser/users/user-detail?Id=${userId}`);
  };

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
    <div className="p-4 space-y-4">
      <Card className="shadow-lg p-2">
        <CardHeader className="flex flex-col gap-4 py-6">
          {/* First row: Title centered */}
          <div className="flex justify-center">
            <CardTitle className="text-3xl font-bold text-green-700">
              User List
            </CardTitle>
          </div>
          {/* Second row: Search & Refresh aligned to right */}
          <div className="flex justify-end">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
                className="max-w-xs border-2 border-green-400 focus:ring-2 focus:ring-green-500"
              />
              <Button
                onClick={fetchUsers}
                className="bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500"
              >
                Refresh
              </Button>
            </div>
          </div>
          {/* Third row: Rows per page select aligned to right */}
          <div className="flex justify-end">
            <div className="flex items-center gap-2">
              <label htmlFor="pageSize" className="text-green-700 font-medium">
                Rows per page:
              </label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={(e) => setPageSize(parseInt(e.target.value))}
                className="border-2 border-green-400 rounded px-2 py-1 focus:ring-2 focus:ring-green-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user, index) => (
                  <TableRow
                    key={user.userId}
                    onClick={() => handleRowClick(user.userId)}
                    className="cursor-pointer hover:bg-green-100 transition-colors"
                  >
                    <TableCell>{startIndex + index + 1}</TableCell>
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
            <TableCaption>
              Page {currentPage} of {totalPages}
            </TableCaption>
          </Table>
        </CardContent>
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
            disabled={currentPage === totalPages}
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
