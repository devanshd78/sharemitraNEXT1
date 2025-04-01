"use client";

import React from "react";

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-900 py-24 px-6 text-gray-800 dark:text-gray-100">
      <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-800 rounded-3xl shadow-lg p-8 border border-gray-300 dark:border-gray-700">
        <h1 className="text-4xl font-bold text-center text-green-700 dark:text-green-300 mb-6">
          Terms of Service
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Welcome to our website. By accessing or using our services, you agree to be bound by the following terms and conditions.
        </p>
        
        <h2 className="text-2xl font-semibold text-green-600 dark:text-green-400 mt-6">1. Acceptance of Terms</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          By accessing our website, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
        </p>
        
        <h2 className="text-2xl font-semibold text-green-600 dark:text-green-400 mt-6">2. Use of Services</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          You agree to use our services only for lawful purposes and in accordance with all applicable laws and regulations.
        </p>
        
        <h2 className="text-2xl font-semibold text-green-600 dark:text-green-400 mt-6">3. User Accounts</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          If you create an account, you are responsible for maintaining the confidentiality of your credentials and all activities under your account.
        </p>
        
        <h2 className="text-2xl font-semibold text-green-600 dark:text-green-400 mt-6">4. Termination</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          We reserve the right to suspend or terminate your access to our services at any time for violations of these terms.
        </p>
        
        <h2 className="text-2xl font-semibold text-green-600 dark:text-green-400 mt-6">5. Changes to Terms</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          We may update these Terms of Service from time to time. Your continued use of our services constitutes acceptance of any changes.
        </p>
        
        <h2 className="text-2xl font-semibold text-green-600 dark:text-green-400 mt-6">6. Contact Us</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          If you have any questions about these Terms of Service, please contact us at support@example.com.
        </p>
      </div>
    </div>
  );
};

export default TermsOfService;