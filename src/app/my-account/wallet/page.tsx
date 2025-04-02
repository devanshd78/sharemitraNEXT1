"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface PaymentMethod {
  _id?: string;
  accountHolder?: string;
  accountNumber?: string;
  bankName?: string;
  upiId?: string;
  paymentId: string;
  paymentMethod: number; // 0 for UPI, 1 for Bank Transfer
}

const WalletPage = () => {
  const [walletData, setWalletData] = useState({
    totalEarned: 500,
    availableToWithdraw: 500,
  });
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [error, setError] = useState("");
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);

  const router = useRouter();
  // Fetch wallet data and payment methods from localStorage and API respectively
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setWalletData({
        totalEarned: parsed.totalEarned || 500,
        availableToWithdraw: parsed.availableToWithdraw || 500,
      });
      if (parsed.userId) {
        fetchPaymentMethods(parsed.userId);
      }
    }
  }, []);

  const fetchPaymentMethods = async (userId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/payment/payment-details/user/${userId}`);
      const data = await response.json();
      if (data.status === 200) {
        setPaymentMethods(data.payments);
      } else {
        setPaymentMethods([]);
      }
    } catch (err) {
      console.error("Error fetching payment methods:", err);
    }
  };

  const handleWithdrawConfirm = async () => {
    const amount = parseInt(withdrawAmount);

    if (isNaN(amount) || amount < 500) {
      Swal.fire({
        title: "Invalid Amount",
        text: "Please enter at least ₹500 to withdraw.",
        icon: "warning",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    if (amount > walletData.availableToWithdraw) {
      Swal.fire({
        title: "Insufficient Funds",
        text: "You cannot withdraw more than your available balance.",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    if (!selectedPaymentMethod) {
      Swal.fire({
        title: "Select Payment Method",
        text: "Please select a payment method.",
        icon: "warning",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    // Retrieve userId from localStorage
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    if (!user?.userId) {
      Swal.fire({
        title: "User Not Found",
        text: "Please login again.",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    // Find the selected payment method details to extract payment type
    const selectedPM = paymentMethods.find((pm) => pm.paymentId === selectedPaymentMethod);
    if (!selectedPM) {
      Swal.fire({
        title: "Payment Method Error",
        text: "Selected payment method not found.",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }
    const paymentType = selectedPM.paymentMethod; // 0 for UPI, 1 for Bank Transfer

    // API call to withdraw funds from your Flask backend.
    try {
      const response = await fetch("http://127.0.0.1:5000/payout/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.userId,
          amount: amount, // in rupees
          paymentType: paymentType,
        }),
      });

      const data = await response.json();
      if (response.status === 200) {
        Swal.fire({
          title: "Success",
          text: `₹${amount} withdrawal request submitted successfully.`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          setOpenPaymentDialog(false);
          setWithdrawAmount("");
          setSelectedPaymentMethod("");
          // Optionally update wallet data by re-fetching from API or local storage.
        });
      } else {
        Swal.fire({
          title: "Withdrawal Failed",
          text: data.error || "Unable to process withdrawal request.",
          icon: "error",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error("Error processing withdrawal:", err);
      Swal.fire({
        title: "Error",
        text: "Please try again later.",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  return (
    <div className="min-h-screen bg-green-50 dark:bg-zinc-950 p-6">
      <div className="max-w-xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl shadow-lg p-8 border border-green-200 dark:border-green-700">
        <h2 className="text-4xl font-bold text-center text-green-800 dark:text-green-100 mb-6">Wallet</h2>

        <div className="bg-green-100 dark:bg-zinc-800 rounded-xl p-6 mb-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-green-800 dark:text-green-200">Total Earned</span>
            <span className="text-xl font-bold text-green-900 dark:text-green-100">₹ {walletData.totalEarned}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-green-800 dark:text-green-200">Available to Withdraw</span>
            <span className="text-xl font-bold text-green-900 dark:text-green-100">₹ {walletData.availableToWithdraw}</span>
          </div>
        </div>

        <p className="text-sm text-gray-700 dark:text-gray-400 mb-6 text-center">
          🔒 Withdrawals allowed only after ₹500 is available.
        </p>

        <Dialog open={openPaymentDialog} onOpenChange={setOpenPaymentDialog}>
          <DialogTrigger asChild>
            <Button
              disabled={walletData.availableToWithdraw < 500}
              className={`w-full py-3 text-white font-semibold rounded-lg transition ${walletData.availableToWithdraw >= 500
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed"
                }`}
            >
              Withdraw Now
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-md p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-green-800 dark:text-green-100">
                Withdraw Funds
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
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
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                Select Payment Method
              </label>
              {paymentMethods.length > 0 ? (
                <div className="space-y-2">
                  {paymentMethods.map((pm) => {
                    let labelText = "";
                    if (pm.paymentMethod === 1) {
                      labelText = `Bank Transfer - ${pm.bankName} (${pm.accountHolder})`;
                    } else if (pm.paymentMethod === 0) {
                      labelText = `UPI - ${pm.upiId}`;
                    } else {
                      labelText = "Other Payment Method";
                    }
                    return (
                      <label key={pm.paymentId} className="flex items-center">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={pm.paymentId}
                          checked={selectedPaymentMethod === pm.paymentId}
                          onChange={() => setSelectedPaymentMethod(pm.paymentId)}
                          className="mr-2"
                        />
                        <span className="text-green-800 dark:text-green-200">{labelText}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-400">No payment methods available.</p>
                  <Button onClick={() => router.push("/my-account/payment-details")}>
                    Add Payment Method
                  </Button>

                </>
              )}
            </div>
            <div className="mt-6 flex space-x-4">
              <Button variant="outline" onClick={() => setOpenPaymentDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleWithdrawConfirm}>Confirm Withdrawal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default WalletPage;
