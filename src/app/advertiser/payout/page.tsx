"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  TableCaption,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiDownload } from "react-icons/fi";
import Swal from "sweetalert2";

interface Payout {
  payout_id: string;
  userId: string;
  name: string;
  amount: number;
  withdraw_time: string;
  mode: string;
  status: string;
}

interface PayoutData {
  payouts: Payout[];
  total: number;
}

interface PayoutResponse {
  success: boolean;
  message: string;
  data: PayoutData;
  status: number;
}

const PayoutHistory: React.FC = () => {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Fetch payout history with updated integration.
  const fetchPayoutHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://127.0.0.1:5000/payout/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: currentPage - 1, // backend expects zero-indexed page
          per_page: rowsPerPage,
          searchquery: searchQuery.trim(),
        }),
      });
      const data: PayoutResponse = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch payout history");
      }
      // Set the payout list and total rows from the centralized response
      setPayouts(data.data.payouts);
      setTotalRows(data.data.total);
    } catch (err: any) {
      console.error("Error fetching payout history:", err);
      setError(err.message);
      Swal.fire("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayoutHistory();
  }, [currentPage, rowsPerPage, searchQuery]);

  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const showingFrom = totalRows === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const showingTo = Math.min(currentPage * rowsPerPage, totalRows);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Download Excel via the API endpoint.
  const handleExportExcel = async () => {
    if (totalRows === 0) {
      Swal.fire("No payouts", "There are no payout records to export.", "info");
      return;
    }
    try {
      const response = await fetch("http://127.0.0.1:5000/download/payouts", {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Failed to download payouts");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "payout.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Error exporting payouts:", error);
      Swal.fire("Error", error.message || "Failed to export payouts.", "error");
    }
  };

  return (
    <div className="p-4">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-700">
            Payout History (All Users)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Controls: Search, Rows Per Page, and Export Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <Input
              placeholder="Search by User ID or Name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="sm:w-1/3"
            />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="rowsPerPage" className="text-green-700 font-medium">
                  Rows:
                </label>
                <select
                  id="rowsPerPage"
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700"
              >
                <FiDownload size={18} />
                Download Excel
              </Button>
            </div>
          </div>

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
          ) : payouts && payouts.length > 0 ? (
            <>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold">Total Payouts:</span>
                  <span className="text-xl font-bold">{totalRows}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Payout Amount:</span>
                  <span className="text-xl font-bold">
                    ₹ {payouts.reduce((acc, cur) => acc + cur.amount, 0)}
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No.</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Payout ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Withdraw Time</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((payout, index) => (
                      <TableRow key={payout.payout_id}>
                        <TableCell>
                          {(currentPage - 1) * rowsPerPage + index + 1}
                        </TableCell>
                        <TableCell>{payout.userId}</TableCell>
                        <TableCell>{payout.name}</TableCell>
                        <TableCell>{payout.payout_id}</TableCell>
                        <TableCell>₹ {payout.amount}</TableCell>
                        <TableCell>
                          {new Date(payout.withdraw_time).toLocaleString()}
                        </TableCell>
                        <TableCell>{payout.mode}</TableCell>
                        <TableCell>{payout.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableCaption>
                    {totalRows > 0 ? (
                      <span>
                        Showing {showingFrom} to {showingTo} of {totalRows} records
                      </span>
                    ) : (
                      <span>No payout records found.</span>
                    )}
                  </TableCaption>
                </Table>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4">
                <div>
                  <span className="text-sm">
                    Showing {showingFrom} to {showingTo} of {totalRows} records
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={handleNextPage}
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
                No payout details available!
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your payouts will be displayed here once processed.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PayoutHistory;
