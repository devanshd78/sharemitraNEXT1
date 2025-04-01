"use client";

import React, { useEffect, useState } from "react";
import { BadgeCheck, Clock, AlertTriangle } from "lucide-react";

interface Payment {
  _id: string;
  taskName: string;
  method: string;
  status: string;
  created_at: string;
}

const PaymentStatus = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.userId) {
        setUserId(user.userId);
      }
    }
  }, []);

  useEffect(() => {
    if (!userId) return; // ❗ Only fetch if userId is set

    const fetchPayments = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://127.0.0.1:5000/payment/payment-details/user/${userId}`);
        const result = await response.json();

        if (response.status === 404) {
          setError(result.msg);
          setPayments([]);
        } else if (response.status === 200) {
          setPayments(result.payments);
        } else {
          throw new Error("Unexpected response from server");
        }
      } catch (error) {
        console.error("Error fetching payments:", error);
        setError("Failed to fetch payment details.");
      } finally {
        setLoading(false);
      }
    };

    //fetchPayments();
  }, [userId]);

  const getStatusBadge = (status: string) => {
    const base = "flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold w-fit";

    switch (status) {
      case "Completed":
        return (
          <span className={`${base} bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100`}>
            ✅ Completed
          </span>
        );
      case "Pending":
        return (
          <span className={`${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100`}>
            ⏳ Pending
          </span>
        );
      case "Failed":
        return (
          <span className={`${base} bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100`}>
            ❌ Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-green-50 dark:bg-zinc-900 text-gray-800 dark:text-gray-100 p-6 sm:px-6">
      <div className="max-w-5xl mx-auto bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-green-200 dark:border-green-700 p-4 sm:p-6 md:p-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-green-900 dark:text-green-100 mb-8">
          Payment Status
        </h2>

        {loading ? (
          <p className="text-center text-gray-600 dark:text-gray-400">Loading payments...</p>
        ) : error ? (
          // ❌ Show this if no payments exist
          <div className="flex flex-col items-center justify-center py-10">
            <span className="text-6xl mb-4">💰</span>
            <p className="text-lg text-gray-700 dark:text-gray-300">{error}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Start working to earn payments! 🎯</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="min-w-full text-sm sm:text-base">
              <thead className="bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-100 uppercase tracking-wide">
                <tr>
                  <th className="px-4 sm:px-6 py-3 border-b">No.</th>
                  <th className="px-4 sm:px-6 py-3 border-b">Task</th>
                  <th className="px-4 sm:px-6 py-3 border-b">Method</th>
                  <th className="px-4 sm:px-6 py-3 border-b">Status</th>
                  <th className="px-4 sm:px-6 py-3 border-b">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, idx) => (
                  <tr
                    key={payment._id}
                    className={`${idx % 2 === 0 ? "bg-white dark:bg-zinc-800" : "bg-green-50 dark:bg-zinc-700"
                      } hover:bg-green-100 dark:hover:bg-zinc-600 transition`}
                  >
                    <td className="px-4 sm:px-6 py-4 border-b font-medium">{idx + 1}</td>
                    <td className="px-4 sm:px-6 py-4 border-b font-semibold">{payment.taskName}</td>
                    <td className="px-4 sm:px-6 py-4 border-b">
                      <span className="text-gray-600 dark:text-gray-300">{payment.method}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 border-b">{getStatusBadge(payment.status)}</td>
                    <td className="px-4 sm:px-6 py-4 border-b text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(payment.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus;