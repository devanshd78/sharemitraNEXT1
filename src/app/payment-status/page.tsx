"use client";

import React, { useState } from "react";
import { BadgeCheck, Clock, AlertTriangle } from "lucide-react";

const PaymentStatus = () => {
  const [payments] = useState([
    {
      id: 1,
      taskName: "Design Homepage",
      method: "UPI",
      status: "Pending",
      timestamp: "2025-05-12 10:30 AM",
    },
    {
      id: 2,
      taskName: "Fix Bug #42",
      method: "UPI",
      status: "Completed",
      timestamp: "2025-05-13 09:45 AM",
    },
    {
      id: 3,
      taskName: "Deploy to Production",
      method: "UPI",
      status: "Failed",
      timestamp: "2025-05-14 02:15 PM",
    },
  ]);

  const getStatusBadge = (status: string) => {
    const base =
      "flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold w-fit";

    switch (status) {
      case "Completed":
        return (
          <span className={`${base} bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100`}>
            <BadgeCheck className="w-4 h-4" />
            Completed
          </span>
        );
      case "Pending":
        return (
          <span className={`${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100`}>
            <Clock className="w-4 h-4" />
            Pending
          </span>
        );
      case "Failed":
        return (
          <span className={`${base} bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100`}>
            <AlertTriangle className="w-4 h-4" />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-green-50 dark:bg-zinc-900 text-gray-800 dark:text-gray-100 py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-green-200 dark:border-green-700 p-4 sm:p-6 md:p-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-green-900 dark:text-green-100 mb-8">
          Payment Status
        </h2>

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
                  key={payment.id}
                  className={`${
                    idx % 2 === 0
                      ? "bg-white dark:bg-zinc-800"
                      : "bg-green-50 dark:bg-zinc-700"
                  } hover:bg-green-100 dark:hover:bg-zinc-600 transition`}
                >
                  <td className="px-4 sm:px-6 py-4 border-b font-medium">
                    {payment.id}
                  </td>
                  <td className="px-4 sm:px-6 py-4 border-b font-semibold">
                    {payment.taskName}
                  </td>
                  <td className="px-4 sm:px-6 py-4 border-b">
                    <span className="text-gray-600 dark:text-gray-300">
                      {payment.method}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 border-b">
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 border-b text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {payment.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;
