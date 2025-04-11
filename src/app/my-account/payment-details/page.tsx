"use client";

import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import Swal from "sweetalert2";
import { FaChevronDown, FaChevronUp, FaEdit, FaTrash } from "react-icons/fa";
import PaymentModal from "./paymentModal"; // Adjust the import path as necessary

// Define your PaymentMethod interface
interface PaymentMethod {
  paymentId: string;
  userId: string;
  paymentMethod: number; // 1 for bank, 0 for UPI
  accountHolder?: string;
  accountNumber?: string;
  ifsc?: string;
  bankName?: string;
  upiId?: string;
  created_at: string;
}

const PaymentPage: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "upi">("bank");
  const [bankDetails, setBankDetails] = useState({
    accountHolder: "",
    accountNumber: "",
    ifsc: "",
    bankName: "",
  });
  const [upiDetails, setUpiDetails] = useState({ upiId: "" });
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Fetch user from local storage on mount.
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.userId) {
        setUserId(user.userId);
        fetchPaymentMethods(user.userId);
      }
    }
  }, []);

  // Fetch payment methods using centralized API response.
  const fetchPaymentMethods = async (userId: string) => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/payment/userdetail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: json.message || "Failed to fetch payment methods",
          timer: 1500,
          showConfirmButton: false,
        });
        setPaymentMethods([]);
      } else {
        // Expecting centralized response: payment details under json.data.payments.
        setPaymentMethods(json.data.payments || []);
      }
    } catch (err: any) {
      console.error("Error fetching payment methods:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || err.message || "Error fetching payment methods",
        timer: 1500,
        showConfirmButton: false,
      });
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPaymentMethod(e.target.value as "bank" | "upi");
  };

  const handleBankInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setBankDetails({ ...bankDetails, [e.target.name]: e.target.value });
  };

  const handleUpiInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUpiDetails({ upiId: e.target.value });
  };

  const handleIfscBlur = async () => {
    const ifsc = bankDetails.ifsc.trim();
    if (ifsc !== "") {
      try {
        const response = await fetch(`https://ifsc.razorpay.com/${ifsc}`);
        if (response.ok) {
          const data = await response.json();
          setBankDetails((prev) => ({ ...prev, bankName: data.BANK }));
        } else {
          setBankDetails((prev) => ({ ...prev, bankName: "" }));
          Swal.fire("Error", "Invalid IFSC Code", "error");
        }
      } catch {
        setBankDetails((prev) => ({ ...prev, bankName: "" }));
        Swal.fire("Error", "Error fetching bank details", "error");
      }
    }
  };

  const handleEditPayment = (payment: PaymentMethod) => {
    setEditingPayment(payment);
    if (payment.paymentMethod === 1) {
      setPaymentMethod("bank");
      setBankDetails({
        accountHolder: payment.accountHolder || "",
        accountNumber: payment.accountNumber || "",
        ifsc: payment.ifsc || "",
        bankName: payment.bankName || "",
      });
    } else {
      setPaymentMethod("upi");
      setUpiDetails({ upiId: payment.upiId || "" });
    }
    setShowModal(true);
  };

  // Handle submission of payment details.
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (paymentMethod === "bank") {
      const accountNumberRegex = /^[0-9]{9,18}$/;
      if (!accountNumberRegex.test(bankDetails.accountNumber)) {
        return Swal.fire("Error", "Invalid account number.", "error");
      }
      if (!bankDetails.accountHolder || !bankDetails.ifsc || !bankDetails.bankName) {
        return Swal.fire("Error", "Please fill all bank details.", "error");
      }
    } else {
      const upiRegex = /^[\w.-]+@[\w.-]+$/;
      if (!upiRegex.test(upiDetails.upiId.trim())) {
        return Swal.fire("Error", "Invalid UPI ID.", "error");
      }
    }

    const payload =
      paymentMethod === "bank"
        ? { userId, paymentMethod: "bank", ...bankDetails }
        : { userId, paymentMethod: "upi", upiId: upiDetails.upiId };

    try {
      const res = await fetch("http://127.0.0.1:5000/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        Swal.fire("Success", data.message, "success");
        setEditingPayment(null);
        setBankDetails({ accountHolder: "", accountNumber: "", ifsc: "", bankName: "" });
        setUpiDetails({ upiId: "" });
        fetchPaymentMethods(userId); // Refresh payment methods
        setShowModal(false);
      } else {
        Swal.fire("Error", data.message || "Error submitting payment details", "error");
      }
    } catch {
      Swal.fire("Error", "Submission failed.", "error");
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!userId) {
      Swal.fire("Error", "User not found. Please log in again.", "error");
      return;
    }

    const confirmDelete = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to recover this payment method!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirmDelete.isConfirmed) {
      try {
        const res = await fetch("http://127.0.0.1:5000/payment/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, paymentId }),
        });
        const data = await res.json();

        if (res.ok && data.success) {
          Swal.fire("Deleted!", data.message, "success");
          fetchPaymentMethods(userId);
        } else {
          Swal.fire("Error", data.message || "Error deleting payment method", "error");
        }
      } catch (error) {
        Swal.fire("Error", "Failed to delete the payment method.", "error");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-green-50 dark:bg-zinc-950 p-6 text-gray-800 dark:text-gray-100">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl border border-green-200 dark:border-green-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-green-900 dark:text-green-200">My Payment Methods</h2>
          <button
            onClick={() => {
              setEditingPayment(null);
              setShowModal(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Add Payment Method
          </button>
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
        ) : paymentMethods.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <span className="text-6xl mb-4">💳</span>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              No Payment Method Added Yet!
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please add your preferred payment method to start receiving payouts.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {paymentMethods.map((payment) => (
              <div
                key={payment.paymentId}
                className="bg-white dark:bg-zinc-800 border border-green-200 dark:border-green-700 rounded-xl shadow-sm hover:shadow-md transition p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-200">
                      {payment.paymentMethod === 1 ? (
                        <span className="bg-green-100 dark:bg-green-700 text-green-700 dark:text-green-100 text-xs px-2 py-0.5 rounded">
                          Bank
                        </span>
                      ) : (
                        <span className="bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-100 text-xs px-2 py-0.5 rounded">
                          UPI
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Added on: {new Date(payment.created_at).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        setExpandedPayment(
                          expandedPayment === payment.paymentId ? null : payment.paymentId
                        )
                      }
                      className="text-green-600 dark:text-green-300 hover:text-green-800"
                    >
                      {expandedPayment === payment.paymentId ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                    <button
                      onClick={() => handleEditPayment(payment)}
                      className="text-green-600 dark:text-green-300 hover:text-green-800"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeletePayment(payment.paymentId)}
                      className="text-red-600 dark:text-red-300 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                {expandedPayment === payment.paymentId && (
                  <div className="mt-4 pt-3 text-sm text-green-800 dark:text-green-200 border-t border-green-200 dark:border-green-600 space-y-1">
                    {payment.paymentMethod === 1 ? (
                      <>
                        <p>
                          <strong>Account Holder:</strong> {payment.accountHolder}
                        </p>
                        <p>
                          <strong>Account Number:</strong> {payment.accountNumber}
                        </p>
                        <p>
                          <strong>IFSC:</strong> {payment.ifsc}
                        </p>
                        <p>
                          <strong>Bank Name:</strong> {payment.bankName}
                        </p>
                      </>
                    ) : (
                      <p>
                        <strong>UPI ID:</strong> {payment.upiId}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        showModal={showModal}
        editingPayment={editingPayment}
        paymentMethod={paymentMethod}
        bankDetails={bankDetails}
        upiDetails={upiDetails}
        recaptchaToken={recaptchaToken}
        onPaymentMethodChange={handlePaymentMethodChange}
        onBankInputChange={handleBankInputChange}
        onUpiInputChange={handleUpiInputChange}
        onIfscBlur={handleIfscBlur}
        onRecaptchaChange={(token) => setRecaptchaToken(token)}
        onSubmit={handleSubmit}
        onCancel={() => setShowModal(false)}
      />
    </div>
  );
}

export default PaymentPage;
