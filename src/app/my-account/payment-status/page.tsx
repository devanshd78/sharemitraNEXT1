"use client";

import React, { useState, useEffect } from "react";
import { BadgeCheck, Clock, AlertTriangle } from "lucide-react";
import Swal from "sweetalert2";

interface Payout {
  payout_id: string;
  amount: number;
  withdraw_time: string;
  mode: string;
  status: string;
}

interface PayoutStatusResponseData {
  userId: string;
  total_payouts: number;
  total_payout_amount: number;
  payouts: Payout[];
}

const PaymentStatus: React.FC = () => {
  const [payoutData, setPayoutData] = useState<PayoutStatusResponseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get userId from localStorage on mount.
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.userId) {
        setUserId(user.userId);
      }
    }
  }, []);

  // Fetch payout status from API using centralized response.
  useEffect(() => {
    if (!userId) return;

    const fetchPayoutStatus = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://127.0.0.1:5000/payout/status?userId=${userId}`);
        const json = await response.json();
        if (!response.ok || !json.success) {
          const errMsg = json.message || "No payouts found for this user.";
          setError(errMsg);
          setPayoutData(null);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: errMsg,
            timer: 1500,
            showConfirmButton: false,
          });
        } else {
          // Using centralized response, data is inside json.data.
          setPayoutData(json.data);
        }
      } catch (err: any) {
        console.error("Error fetching payout status:", err);
        setError(err.message || "Failed to fetch payout status.");
        setPayoutData(null);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "Failed to fetch payout status.",
          timer: 1500,
          showConfirmButton: false,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPayoutStatus();
  }, [userId]);

  const getStatusBadge = (status: string) => {
    const base =
      "flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold";
    switch (status) {
      case "Processing":
        return (
          <span className={`${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100`}>
            <Clock size={14} /> Processing
          </span>
        );
      case "Reversed":
        return (
          <span className={`${base} bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100`}>
            <AlertTriangle size={14} /> Declined
          </span>
        );
      case "Pending":
        return (
          <span className={`${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100`}>
            <Clock size={14} /> Pending
          </span>
        );
      case "Processed":
        return (
          <span className={`${base} bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100`}>
            <BadgeCheck size={14} /> Paid
          </span>
        );
      default:
        return (
          <span className={`${base} bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200`}>
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-green-50 dark:bg-zinc-900 text-gray-800 dark:text-gray-100 p-6 sm:px-6">
      <div className="max-w-5xl mx-auto bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-green-200 dark:border-green-700 p-4 sm:p-6 md:p-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-green-900 dark:text-green-100 mb-8">
          Payout Status
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center">
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
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10">
            <span className="text-6xl mb-4">💰</span>
            <p className="text-lg text-red-500">{error}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No payout details available.
            </p>
          </div>
        ) : payoutData ? (
          <>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold">Total Payouts:</span>
                <span className="text-xl font-bold">{payoutData.total_payouts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Payout Amount:</span>
                <span className="text-xl font-bold">₹ {payoutData.total_payout_amount}</span>
              </div>
            </div>
            {payoutData.payouts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm sm:text-base">
                  <thead className="bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-100 uppercase tracking-wide">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 border-b">No.</th>
                      <th className="px-4 sm:px-6 py-3 border-b">Payout ID</th>
                      <th className="px-4 sm:px-6 py-3 border-b">Amount</th>
                      <th className="px-4 sm:px-6 py-3 border-b">Mode</th>
                      <th className="px-4 sm:px-6 py-3 border-b">Status</th>
                      <th className="px-4 sm:px-6 py-3 border-b">Withdraw Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payoutData.payouts.map((payout, idx) => (
                      <tr
                        key={payout.payout_id}
                        className={`${idx % 2 === 0 ? "bg-white dark:bg-zinc-800" : "bg-green-50 dark:bg-zinc-700"
                          } hover:bg-green-100 dark:hover:bg-zinc-600 transition`}
                      >
                        <td className="px-4 sm:px-6 py-4 border-b font-medium">
                          {idx + 1}
                        </td>
                        <td className="px-4 sm:px-6 py-4 border-b">
                          {payout.payout_id}
                        </td>
                        <td className="px-4 sm:px-6 py-4 border-b">
                          ₹ {payout.amount}
                        </td>
                        <td className="px-4 sm:px-6 py-4 border-b">
                          {payout.mode}
                        </td>
                        <td className="px-4 sm:px-6 py-4 border-b">
                          {getStatusBadge(payout.status)}
                        </td>
                        <td className="px-4 sm:px-6 py-4 border-b whitespace-nowrap">
                          {new Date(payout.withdraw_time).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <span className="text-6xl mb-4">💰</span>
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  No payout details available!
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your payouts will be displayed here once processed.
                </p>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default PaymentStatus;
