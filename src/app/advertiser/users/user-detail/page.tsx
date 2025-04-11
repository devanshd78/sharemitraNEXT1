"use client";

import React, { useEffect, useState, useCallback } from "react";
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
  TableCaption,
} from "@/components/ui/table";
import Swal from "sweetalert2";

type UserDetail = {
  userId: string;
  referralCode: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  stateId: string;
  stateName: string;
  cityId: string;
  cityName: string;
  createdAt: string;
  updatedAt: string;
};

type Task = {
  taskId: string;
  task_name: string;
  matched_link: string;
  participant_count: number;
  verified: boolean;
  verifiedAt: string;
  task_details: {
    description: string;
  };
  task_price: number;
  image_phash: string;
  userId: string;
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

// Simple spinner component using Tailwind CSS classes.
const LoadingSpinner: React.FC = () => (
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
    <span className="ml-2 text-green-600 font-medium">Loading...</span>
  </div>
);

const UserDetailPage = () => {
  const searchParams = useSearchParams();
  const userId = searchParams.get("Id"); // Read query param "Id"
  const router = useRouter();

  // Global state for user details.
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Separate states for tasks, payments and payouts.
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState<boolean>(true);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState<boolean>(true);

  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [payoutsLoading, setPayoutsLoading] = useState<boolean>(true);

  // ---------------------------
  // Fetch User Details
  // ---------------------------
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`http://127.0.0.1:5000/user/getbyid?userId=${userId}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to fetch user details");
        }
        // User details are in json.data
        setUser(json.data);
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

  // ---------------------------
  // Fetch Task History
  // ---------------------------
  useEffect(() => {
    async function fetchTasks() {
      setTasksLoading(true);
      try {
        const res = await fetch("http://127.0.0.1:5000/task/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to fetch task history");
        }
        // Task history is in json.data.task_history.
        setTasks(json.data.task_history);
      } catch (err: any) {
        console.error("Error fetching tasks:", err);
      } finally {
        setTasksLoading(false);
      }
    }
    if (userId) {
      fetchTasks();
    }
  }, [userId]);

  // ---------------------------
  // Fetch Payment Details
  // ---------------------------
  useEffect(() => {
    async function fetchPayments() {
      setPaymentsLoading(true);
      try {
        const response = await fetch("http://127.0.0.1:5000/payment/userdetail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        const json = await response.json();
        if (!response.ok || !json.success) {
          throw new Error(json.message || "Failed to fetch payment details");
        }
        // Payment details are in json.data.payments.
        setPayments(json.data.payments);
      } catch (err: any) {
        console.error("Error fetching payments:", err);
      } finally {
        setPaymentsLoading(false);
      }
    }
    if (userId) {
      fetchPayments();
    }
  }, [userId]);

  // ---------------------------
  // Fetch Payout Status
  // ---------------------------
  useEffect(() => {
    async function fetchPayouts() {
      setPayoutsLoading(true);
      try {
        const res = await fetch(`http://127.0.0.1:5000/payout/status?userId=${userId}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to fetch payout status");
        }
        // Payout details are in json.data.payouts.
        setPayouts(json.data.payouts);
      } catch (err: any) {
        console.error("Error fetching payouts:", err);
      } finally {
        setPayoutsLoading(false);
      }
    }
    if (userId) {
      fetchPayouts();
    }
  }, [userId]);

  // ---------------------------
  // Set overall loading to false when user details load or error occurs.
  // ---------------------------
  useEffect(() => {
    if (user || error) {
      setLoading(false);
    }
  }, [user, error]);

  // Render overall loading, error or user not found states.
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
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

  // ---------------------------
  // Render the User Detail Page
  // ---------------------------
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
            <div><strong>User ID:</strong> {user.userId}</div>
            <div><strong>Name:</strong> {user.name}</div>
            <div><strong>Email:</strong> {user.email}</div>
            <div><strong>Phone:</strong> {user.phone}</div>
            <div>
              <strong>Date of Birth:</strong>{" "}
              {user.dob ? new Date(user.dob).toLocaleDateString() : "N/A"}
            </div>
            <div>
              <strong>State:</strong> {user.stateName || "N/A"}
            </div>
            <div>
              <strong>City:</strong> {user.cityName || "N/A"}
            </div>
            <div><strong>Referral Code:</strong> {user.referralCode}</div>
            <div>
              <strong>Created At:</strong>{" "}
              {new Date(user.createdAt).toLocaleString()}
            </div>
            <div>
              <strong>Updated At:</strong>{" "}
              {new Date(user.updatedAt).toLocaleString()}
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
          {tasksLoading ? (
            <LoadingSpinner />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>No.</TableCell>
                  <TableCell>Task ID</TableCell>
                  <TableCell>Task Name</TableCell>
                  <TableCell>Task Description</TableCell>
                  <TableCell>Task Price</TableCell>
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
                    <TableCell>{task.task_name}</TableCell>
                    <TableCell>{task.task_details.description}</TableCell>
                    <TableCell>{task.task_price}</TableCell>
                    <TableCell>
                      <a
                        href={task.matched_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={task.matched_link}
                        className="underline text-blue-600 hover:text-blue-800"
                      >
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
          )}
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
          {paymentsLoading ? (
            <LoadingSpinner />
          ) : (
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
          )}
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
          {payoutsLoading ? (
            <LoadingSpinner />
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetailPage;
