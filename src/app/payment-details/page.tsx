"use client";

import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import Swal from "sweetalert2";
import ReCAPTCHA from "react-google-recaptcha";
import { FaChevronDown, FaChevronUp, FaEdit } from "react-icons/fa";

interface PaymentMethod {
  _id: string;
  userId: string;
  paymentMethod: number;
  accountHolder?: string;
  accountNumber?: string;
  ifsc?: string;
  bankName?: string;
  ifscDetails?: any;
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
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user._id) {
        setUserId(user._id);
        fetchPaymentMethods(user._id);
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
      }``
    } catch (err) {
      console.error("Error fetching payment methods:", err);
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
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

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

    const payload = paymentMethod === "bank"
      ? { userId, paymentMethod: "bank", ...bankDetails }
      : { userId, paymentMethod: "upi", upiId: upiDetails.upiId };

    try {
      const res = await fetch("http://127.0.0.1:5000/payment/payment-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        Swal.fire("Success", data.msg, "success");
        setEditingPayment(null);
        setBankDetails({ accountHolder: "", accountNumber: "", ifsc: "", bankName: "" });
        setUpiDetails({ upiId: "" });
        fetchPaymentMethods(userId);
      } else {
        Swal.fire("Error", data.msg, "error");
      }
    } catch {
      Swal.fire("Error", "Submission failed.", "error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-green-50 dark:bg-zinc-950 p-4 mt-20 text-gray-800 dark:text-gray-100">
      <div className="w-full max-w-4xl mx-auto mb-6">
        <h2 className="text-3xl font-bold mb-4 text-green-900 dark:text-green-200">My Payment Methods</h2>

        {paymentMethods.length === 0 ? (
          <p className="text-green-700 dark:text-green-300">No payment methods added yet.</p>
        ) : (
          <div className="grid gap-4">
            {paymentMethods.map((payment) => (
              <div key={payment._id} className="bg-white dark:bg-zinc-800 border border-green-200 dark:border-green-700 rounded-xl shadow-sm hover:shadow-md transition p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-200">
                      {payment.paymentMethod === 1 ? (
                        <span className="bg-green-100 dark:bg-green-700 text-green-700 dark:text-green-100 text-xs px-2 py-0.5 rounded">Bank</span>
                      ) : (
                        <span className="bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-100 text-xs px-2 py-0.5 rounded">UPI</span>
                      )}
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Added on: {new Date(payment.created_at).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setExpandedPayment(expandedPayment === payment._id ? null : payment._id)} className="text-green-600 dark:text-green-300 hover:text-green-800">
                      {expandedPayment === payment._id ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                    <button onClick={() => handleEditPayment(payment)} className="text-green-600 dark:text-green-300 hover:text-green-800">
                      <FaEdit />
                    </button>
                  </div>
                </div>

                {expandedPayment === payment._id && (
                  <div className="mt-4 pt-3 text-sm text-green-800 dark:text-green-200 border-t border-green-200 dark:border-green-600 space-y-1">
                    {payment.paymentMethod === 1 ? (
                      <>
                        <p><strong>Account Holder:</strong> {payment.accountHolder}</p>
                        <p><strong>Account Number:</strong> {payment.accountNumber}</p>
                        <p><strong>IFSC:</strong> {payment.ifsc}</p>
                        <p><strong>Bank Name:</strong> {payment.bankName}</p>
                      </>
                    ) : (
                      <p><strong>UPI ID:</strong> {payment.upiId}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Form */}
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded shadow p-6 mx-auto border border-green-200 dark:border-green-700">
        <h2 className="text-2xl font-bold mb-4 text-green-900 dark:text-green-200">
          {editingPayment ? "Edit Payment Details" : "Add Payment Details"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-lg font-medium mb-2 text-green-800 dark:text-green-200">
              Select Payment Method:
            </label>
            <div className="flex items-center gap-4 text-green-700 dark:text-green-300">
              <label className="flex items-center gap-2">
                <input type="radio" name="paymentMethod" value="bank" checked={paymentMethod === "bank"} onChange={handlePaymentMethodChange} />
                Bank
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="paymentMethod" value="upi" checked={paymentMethod === "upi"} onChange={handlePaymentMethodChange} />
                UPI
              </label>
            </div>
          </div>

          {paymentMethod === "bank" ? (
            <>
              {["accountHolder", "accountNumber", "ifsc", "bankName"].map((field) => (
                <div key={field} className="mb-4">
                  <label htmlFor={field} className="block text-sm font-medium mb-1 text-green-700 dark:text-green-300">
                    {field === "accountHolder" ? "Account Holder Name" :
                     field === "accountNumber" ? "Account Number" :
                     field === "ifsc" ? "IFSC Code" : "Bank Name"}
                  </label>
                  <input
                    type="text"
                    id={field}
                    name={field}
                    value={(bankDetails as any)[field]}
                    onChange={handleBankInputChange}
                    onBlur={field === "ifsc" ? handleIfscBlur : undefined}
                    className={`w-full border px-3 py-2 rounded ${field === "bankName" ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" : "border-green-300"}`}
                    required={field !== "bankName"}
                    disabled={field === "bankName"}
                  />
                </div>
              ))}
            </>
          ) : (
            <div className="mb-4">
              <label htmlFor="upiId" className="block text-sm font-medium mb-1 text-green-700 dark:text-green-300">UPI ID</label>
              <input
                type="text"
                id="upiId"
                name="upiId"
                value={upiDetails.upiId}
                onChange={handleUpiInputChange}
                className="w-full border border-green-300 rounded px-3 py-2"
                required
              />
            </div>
          )}

          <div className="flex justify-center mb-4">
            <div className="transform scale-90 md:scale-100 origin-center">
              <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY!}
                onChange={(token) => setRecaptchaToken(token)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            disabled={!recaptchaToken}
          >
            {editingPayment ? "Update Payment Details" : "Submit Payment Details"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;
