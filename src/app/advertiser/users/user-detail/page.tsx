"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";

type UserDetail = {
  userId: string;
  referralCode: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  // Additional fields from your API can be added here
};

const UserDetailPage = () => {
  const searchParams = useSearchParams();
  const userId = searchParams.get("Id"); // Read query param "Id"
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Dummy data for Task History
  const taskHistory = [
    { id: "task1", description: "Completed onboarding", date: "2023-01-01T12:00:00Z", status: "Completed" },
    { id: "task2", description: "Submitted profile update", date: "2023-02-15T15:30:00Z", status: "Pending" },
  ];

  // Dummy data for Payment Withdraw History
  const paymentWithdrawHistory = [
    { id: "pay1", amount: 150, date: "2023-03-10T10:00:00Z", status: "Approved" },
    { id: "pay2", amount: 75, date: "2023-04-05T14:20:00Z", status: "Rejected" },
  ];

  // Dummy data for Saved Payment Methods
  const savedPaymentMethods = [
    { id: "card1", type: "Visa", last4: "4242", expiry: "12/25" },
    { id: "card2", type: "MasterCard", last4: "1234", expiry: "11/24" },
  ];

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`http://127.0.0.1:5000/user/getbyid?userId=${userId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch user details");
        }
        const data = await res.json();
        setUser(data.user); // Expect API returns { user: { ... } }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (userId) {
      fetchUser();
    } else {
      setError("User ID not provided.");
      setLoading(false);
    }
  }, [userId]);

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
  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg">User not found.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-8">
      {/* User Detail Card */}
      <Card className="shadow-lg p-4">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-green-700">
            User Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-lg">
            <div>
              <strong>User ID:</strong> {user.userId}
            </div>
            <div>
              <strong>Name:</strong> {user.name}
            </div>
            <div>
              <strong>Email:</strong> {user.email}
            </div>
            <div>
              <strong>Phone:</strong> {user.phone}
            </div>
            <div>
              <strong>Referral Code:</strong> {user.referralCode}
            </div>
            <div>
              <strong>Created At:</strong> {new Date(user.createdAt).toLocaleString()}
            </div>
            <div>
              <strong>Updated At:</strong> {new Date(user.updatedAt).toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task History Card */}
      <Card className="shadow-lg p-4">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-700">
            Task History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>No.</TableCell>
                <TableCell>Task ID</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taskHistory.map((task, index) => (
                <TableRow key={task.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{task.id}</TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>{new Date(task.date).toLocaleString()}</TableCell>
                  <TableCell>{task.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Withdraw History Card */}
      <Card className="shadow-lg p-4">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-700">
            Payment Withdraw History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>No.</TableCell>
                <TableCell>Withdraw ID</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentWithdrawHistory.map((payment, index) => (
                <TableRow key={payment.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{payment.id}</TableCell>
                  <TableCell>${payment.amount}</TableCell>
                  <TableCell>{new Date(payment.date).toLocaleString()}</TableCell>
                  <TableCell>{payment.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Saved Payment Methods Card */}
      <Card className="shadow-lg p-4">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-700">
            Saved Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>No.</TableCell>
                <TableCell>Method ID</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Last 4 Digits</TableCell>
                <TableCell>Expiry</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savedPaymentMethods.map((method, index) => (
                <TableRow key={method.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{method.id}</TableCell>
                  <TableCell>{method.type}</TableCell>
                  <TableCell>{method.last4}</TableCell>
                  <TableCell>{method.expiry}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetailPage;
