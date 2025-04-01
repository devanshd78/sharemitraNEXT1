"use client";

import React, { ChangeEvent, FormEvent } from "react";
import Swal from "sweetalert2";
import ReCAPTCHA from "react-google-recaptcha";

interface BankDetails {
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
}

interface UpiDetails {
  upiId: string;
}

export interface PaymentModalProps {
  showModal: boolean;
  editingPayment: any | null; // replace with your PaymentMethod interface if needed
  paymentMethod: "bank" | "upi";
  bankDetails: BankDetails;
  upiDetails: UpiDetails;
  recaptchaToken: string | null;
  onPaymentMethodChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBankInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onUpiInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onIfscBlur: () => void;
  onRecaptchaChange: (token: string | null) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  showModal,
  editingPayment,
  paymentMethod,
  bankDetails,
  upiDetails,
  recaptchaToken,
  onPaymentMethodChange,
  onBankInputChange,
  onUpiInputChange,
  onIfscBlur,
  onRecaptchaChange,
  onSubmit,
  onCancel,
}) => {
  if (!showModal) return null;

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-sm" onClick={handleBackdropClick}>
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded shadow p-6 mx-auto border border-green-200 dark:border-green-700">
        <h2 className="text-2xl font-bold mb-4 text-green-900 dark:text-green-200">
          {editingPayment ? "Edit Payment Details" : "Add Payment Details"}
        </h2>

        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-lg font-medium mb-2 text-green-800 dark:text-green-200">
              Select Payment Method:
            </label>
            <div className="flex items-center gap-4 text-green-700 dark:text-green-300">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank"
                  checked={paymentMethod === "bank"}
                  onChange={onPaymentMethodChange}
                />
                Bank
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={paymentMethod === "upi"}
                  onChange={onPaymentMethodChange}
                />
                UPI
              </label>
            </div>
          </div>

          {paymentMethod === "bank" ? (
            <>
              {["accountHolder", "accountNumber", "ifsc", "bankName"].map((field) => (
                <div key={field} className="mb-4">
                  <label
                    htmlFor={field}
                    className="block text-sm font-medium mb-1 text-green-700 dark:text-green-300"
                  >
                    {field === "accountHolder"
                      ? "Account Holder Name"
                      : field === "accountNumber"
                        ? "Account Number"
                        : field === "ifsc"
                          ? "IFSC Code"
                          : "Bank Name"}
                  </label>
                  <input
                    type="text"
                    id={field}
                    name={field}
                    value={(bankDetails as any)[field]}
                    onChange={onBankInputChange}
                    onBlur={field === "ifsc" ? onIfscBlur : undefined}
                    className={`w-full border px-3 py-2 rounded ${field === "bankName"
                        ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                        : "border-green-300"
                      }`}
                    required={field !== "bankName"}
                    disabled={field === "bankName"}
                  />
                </div>
              ))}
            </>
          ) : (
            <div className="mb-4">
              <label
                htmlFor="upiId"
                className="block text-sm font-medium mb-1 text-green-700 dark:text-green-300"
              >
                UPI ID
              </label>
              <input
                type="text"
                id="upiId"
                name="upiId"
                value={upiDetails.upiId}
                onChange={onUpiInputChange}
                className="w-full border border-green-300 rounded px-3 py-2"
                required
              />
            </div>
          )}

          <div className="flex justify-center mb-4">
            <div className="transform scale-90 md:scale-100 origin-center">
              <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY!}
                onChange={onRecaptchaChange}
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

        <button
          onClick={onCancel}
          className="mt-4 w-full text-center text-green-600 hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;
