"use client";

import React, { useEffect, useState } from "react";
import { Send, Users } from "lucide-react";
import Swal from "sweetalert2";

const ReferEarn: React.FC = () => {
  const [referralCode, setReferralCode] = useState("");
  const [referralCount, setReferralCount] = useState(0);

  const REFERRAL_LINK = `https://sharemitra.com?ref=${referralCode}`;

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) return;

    const user = JSON.parse(userData);
    const userId = user.userId;
    if (!userId) return;

    const fetchReferralData = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/user/referrals?userId=${userId}`);
        const json = await res.json();
        if (res.ok && json.success) {
          // Access referral details from json.data
          const { referralCode, referralCount } = json.data;
          setReferralCode(referralCode);
          setReferralCount(referralCount);
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: json.message || "Failed to fetch referral data",
            timer: 1500,
            showConfirmButton: false,
          });
        }
      } catch (error) {
        console.error("Failed to fetch referral data", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch referral data",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    };

    fetchReferralData();
  }, []);

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `Hey! Check out this awesome app and earn rewards with me!\n\nUse my referral link: ${REFERRAL_LINK}`
    );
    window.open(`https://api.whatsapp.com/send?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-green-50 dark:bg-zinc-900 p-6 text-gray-800 dark:text-white">
      <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-800 rounded-3xl shadow-lg p-8 md:p-10 border border-green-200 dark:border-green-700">
        <h2 className="text-4xl font-extrabold text-center text-green-900 dark:text-green-100 mb-6">
          Refer & Earn 💸
        </h2>

        <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
          Invite your friends to join{" "}
          <span className="font-semibold text-green-800 dark:text-green-200">ShareMitra</span>{" "}
          and earn rewards when they sign up using your referral!
        </p>

        {/* Referral Info */}
        <div className="bg-green-100 dark:bg-green-800 border border-green-300 dark:border-green-600 rounded-xl p-5 mb-6 text-center">
          <p className="text-green-900 dark:text-green-100 font-semibold mb-1">Your Referral Link</p>
          <a
            href={REFERRAL_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm sm:text-base text-green-800 dark:text-green-200 break-all font-medium"
          >
            {REFERRAL_LINK}
          </a>
        </div>

        {/* Referral Count */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Users className="w-5 h-5 text-green-700 dark:text-green-200" />
          <span className="text-green-800 dark:text-green-100 font-medium">
            Total Friends Referred:{" "}
            <strong className="text-green-900 dark:text-white">{referralCount}</strong>
          </span>
        </div>

        {/* WhatsApp Share */}
        <button
          onClick={handleWhatsAppShare}
          className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          <Send className="w-5 h-5" />
          Share on WhatsApp
        </button>
      </div>
    </div>
  );
};

export default ReferEarn;
