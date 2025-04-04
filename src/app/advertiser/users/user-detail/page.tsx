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
};

type Task = {
  taskId: string;
  group_name: string;
  matched_link: string;
  participant_count: number;
  verified: boolean;
  verifiedAt: string;
};

type Payment = {
  _id: string;
  paymentId: string;
  paymentMethod: number;
  amount: number;
  created_at: string;
  updated_at: string;
  accountHolder?: string;
  accountNumber?: string;
  bankName?: string;
  upiId?: string;
};


type Payout = {
  payout_id: string;
  amount: number;
  withdraw_time: string;
  mode: string;
  status: string;
};

const UserDetailPage = () => {
  const searchParams = useSearchParams();
  const userId = searchParams.get("Id"); // Read query param "Id"
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user details
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`http://127.0.0.1:5000/user/getbyid?userId=${userId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch user details");
        }
        const data = await res.json();
        setUser(data.user); // Expecting API returns { user: { ... } }
      } catch (err: any) {
        setError(err.message);
      }
    }
    if (userId) {
      fetchUser();
    } else {
      setError("User ID not provided.");
    }
  }, [userId]);

  // Fetch task history via POST
  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch(`http://127.0.0.1:5000/task/history`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        });
        if (!res.ok) {
          throw new Error("Failed to fetch task history");
        }
        const data = await res.json();
        setTasks(data.task_history); // Expecting API returns { task_history: [ ... ] }
      } catch (err: any) {
        console.error(err);
      }
    }
    if (userId) {
      fetchTasks();
    }
  }, [userId]);

  // Fetch payment details
  useEffect(() => {
    async function fetchPayments() {
      try {
        const res = await fetch(`http://127.0.0.1:5000/payment/payment-details/user/${userId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch payment details");
        }
        const data = await res.json();
        setPayments(data.payments); // Expecting API returns { payments: [ ... ] }
      } catch (err: any) {
        console.error(err);
      }
    }
    if (userId) {
      fetchPayments();
    }
  }, [userId]);

  // Fetch payout status
  useEffect(() => {
    async function fetchPayouts() {
      try {
        const res = await fetch(`http://127.0.0.1:5000/payout/status?userId=${userId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch payout status");
        }
        const data = await res.json();
        setPayouts(data.payouts); // Expecting API returns { payouts: [ ... ] }
      } catch (err: any) {
        console.error(err);
      }
    }
    if (userId) {
      fetchPayouts();
    }
  }, [userId]);

  // Determine overall loading state. For simplicity, mark loading as false once user details load.
  useEffect(() => {
    if (user || error) {
      setLoading(false);
    }
  }, [user, error]);

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
                <TableCell>Group Name</TableCell>
                <TableCell>Matched Link</TableCell>
                <TableCell>Participant Count</TableCell>
                <TableCell>Verified</TableCell>
                <TableCell>Verified At</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task, index) => (
                <TableRow key={`${task.taskId}-${index}`}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{task.taskId}</TableCell>
                  <TableCell>{task.group_name}</TableCell>
                  <TableCell>
                    <a href={task.matched_link} target="_blank" rel="noopener noreferrer">
                      Link
                    </a>
                  </TableCell>
                  <TableCell>{task.participant_count}</TableCell>
                  <TableCell>{task.verified ? "Yes" : "No"}</TableCell>
                  <TableCell>{new Date(task.verifiedAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Details Card */}
      <Card className="shadow-lg p-4">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-700">
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>No.</TableCell>
                <TableCell>Payment ID</TableCell>
                <TableCell>Payment Method</TableCell>
                <TableCell>Details</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Updated At</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment, index) => {
                const paymentMethod = payment.paymentMethod === 1 ? "Bank" : "UPI";
                const details =
                  paymentMethod === "Bank"
                    ? `${payment.accountHolder} - ${payment.bankName} (${payment.accountNumber})`
                    : payment.upiId || "N/A";
                return (
                  <TableRow key={`${payment._id}-${index}`}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{payment.paymentId}</TableCell>
                    <TableCell>{paymentMethod}</TableCell>
                    <TableCell>{details}</TableCell>
                    <TableCell>{new Date(payment.created_at).toLocaleString()}</TableCell>
                    <TableCell>{new Date(payment.updated_at).toLocaleString()}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payout Status Card */}
      <Card className="shadow-lg p-4">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-700">
            Payout Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>No.</TableCell>
                <TableCell>Payout ID</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Withdraw Time</TableCell>
                <TableCell>Mode</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((payout, index) => (
                <TableRow key={`${payout.payout_id}-${index}`}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{payout.payout_id}</TableCell>
                  <TableCell>₹ {payout.amount}</TableCell>
                  <TableCell>{new Date(payout.withdraw_time).toLocaleString()}</TableCell>
                  <TableCell>{payout.mode}</TableCell>
                  <TableCell>{payout.status}</TableCell>
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
