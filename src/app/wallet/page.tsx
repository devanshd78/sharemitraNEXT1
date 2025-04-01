"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const WalletPage = () => {
  const [walletData, setWalletData] = useState({
    totalEarned: 500,
    availableToWithdraw: 500,
  });

  const [showWithdrawInput, setShowWithdrawInput] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setWalletData({
        totalEarned: parsed.totalEarned || 500,
        availableToWithdraw: parsed.availableToWithdraw || 500,
      });
    }
  }, []);

  const handleWithdrawClick = () => {
    setShowWithdrawInput(true);
  };

  const handleWithdrawConfirm = () => {
    const amount = parseInt(withdrawAmount);

    if (isNaN(amount) || amount < 500) {
      Swal.fire("Invalid Amount", "Please enter at least ₹500 to withdraw.", "warning");
      return;
    }

    if (amount > walletData.availableToWithdraw) {
      Swal.fire("Insufficient Funds", "You cannot withdraw more than your available balance.", "error");
      return;
    }

    // Success - handle your API call here
    Swal.fire("Success", `₹${amount} withdrawal request submitted.`, "success");

    // Optional reset
    setShowWithdrawInput(false);
    setWithdrawAmount("");
  };

  return (
    <div className="min-h-screen bg-green-50 dark:bg-zinc-950 py-24 px-6">
      <div className="max-w-xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl shadow-lg p-8 border border-green-200 dark:border-green-700">
        <h2 className="text-4xl font-bold text-center text-green-800 dark:text-green-100 mb-6">
          Wallet
        </h2>

        <div className="bg-green-100 dark:bg-zinc-800 rounded-xl p-6 mb-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-green-800 dark:text-green-200">
              Total Earned
            </span>
            <span className="text-xl font-bold text-green-900 dark:text-green-100">
              ₹ {walletData.totalEarned}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-green-800 dark:text-green-200">
              Available to Withdraw
            </span>
            <span className="text-xl font-bold text-green-900 dark:text-green-100">
              ₹ {walletData.availableToWithdraw}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-700 dark:text-gray-400 mb-6 text-center">
          🔒 Withdrawals allowed only after ₹500 is available.
        </p>

        {/* Withdraw Input Section */}
        {showWithdrawInput && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-green-800 dark:text-green-200 mb-1">
              Enter Withdrawal Amount (₹)
            </label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Enter amount (min ₹500)"
              className="w-full px-4 py-3 rounded-md border border-green-300 dark:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              onClick={handleWithdrawConfirm}
              className="mt-4 w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition"
            >
              Confirm Withdrawal
            </button>
          </div>
        )}

        {!showWithdrawInput && (
          <button
            disabled={walletData.availableToWithdraw < 500}
            onClick={handleWithdrawClick}
            className={`w-full py-3 text-white font-semibold rounded-lg transition ${
              walletData.availableToWithdraw >= 500
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Withdraw Now
          </button>
        )}
      </div>
    </div>
  );
};

export default WalletPage;
