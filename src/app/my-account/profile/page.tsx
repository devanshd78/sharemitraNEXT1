"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

interface ProfileType {
  userId: string;
  name: string;
  email: string;
  phone: string;
  dob?: string;
  state?: string;
  city?: string;
  referralCode?: string;
  totalPayoutAmount?: number;
  // createdAt and updatedAt can be added if you wish to display them
  createdAt?: string;
  updatedAt?: string;
}

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileType>({
    userId: "",
    name: "",
    email: "",
    phone: "",
    dob: "",
    state: "",
    city: "",
    referralCode: "",
    totalPayoutAmount: 0,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      fetchProfile(user.userId);
    }
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/user/getbyid?userId=${userId}`);
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        // Store the entire user object in localStorage
        localStorage.setItem("user", JSON.stringify(data));
      } else {
        showError(data.error || "Failed to fetch profile.");
      }
    } catch {
      showError("Failed to fetch profile.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // For phone number, allow only digits
    const processedValue = name === "phone" ? value.replace(/\D/g, "") : value;
    setProfile((prev) => ({ ...prev, [name]: processedValue }));
  };

  const handleSave = async () => {
    // Validate phone number length
    if (profile.phone.length !== 10) {
      return showError("Phone number must be exactly 10 digits.");
    }
    try {
      const res = await fetch("http://localhost:5000/user/updatedetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (data.status === 200) {
        localStorage.setItem("user", JSON.stringify(profile));
        setIsEditing(false);
        Swal.fire("Updated!", "Profile updated successfully.", "success");
      } else {
        showError(data.msg);
      }
    } catch {
      showError("Error updating profile.");
    }
  };

  const showError = (msg: string) => {
    Swal.fire("Error", msg, "error");
  };

  const inputClass = (active: boolean) =>
    `w-full px-4 py-3 rounded-md border transition focus:outline-none focus:ring-2 ring-green-400
     ${active ? "bg-white dark:bg-zinc-800 border-gray-300" : "bg-gray-100 dark:bg-zinc-900 cursor-not-allowed"}
     text-gray-800 dark:text-white`;

  if (loading) {
    return (
      <div className="text-center mt-24 text-gray-700 dark:text-gray-300">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 dark:bg-zinc-950 p-6">
      <div className="max-w-xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl shadow-lg border border-green-200 dark:border-green-700 p-8 md:p-10">
        <h2 className="text-4xl font-bold text-center mb-10 text-green-800 dark:text-green-200">
          Profile Settings
        </h2>

        <div className="space-y-6">
          {["name", "email", "phone"].map((field) => (
            <div key={field}>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                {field === "phone" ? "Phone Number" : field}
              </label>
              <input
                type={field === "email" ? "email" : "text"}
                name={field}
                value={(profile as any)[field]}
                onChange={handleChange}
                disabled={!isEditing}
                minLength={field === "phone" ? 10 : undefined}
                maxLength={field === "phone" ? 10 : undefined}
                className={inputClass(isEditing)}
              />
            </div>
          ))}

          {/* Date of Birth */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              value={profile.dob || ""}
              onChange={handleChange}
              disabled={!isEditing}
              className={inputClass(isEditing)}
            />
          </div>

          {/* State */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              State
            </label>
            <input
              type="text"
              name="state"
              value={profile.state || ""}
              onChange={handleChange}
              disabled={!isEditing}
              className={inputClass(isEditing)}
            />
          </div>

          {/* City */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              City
            </label>
            <input
              type="text"
              name="city"
              value={profile.city || ""}
              onChange={handleChange}
              disabled={!isEditing}
              className={inputClass(isEditing)}
            />
          </div>

          {/* Referral Code (read-only) */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Referral Code
            </label>
            <input
              type="text"
              name="referralCode"
              value={profile.referralCode || ""}
              disabled
              className={inputClass(false)}
            />
          </div>

          {/* Total Payout Amount (read-only) */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Payout Amount
            </label>
            <input
              type="number"
              name="totalPayoutAmount"
              value={profile.totalPayoutAmount || 0}
              disabled
              className={inputClass(false)}
            />
          </div>

          <div className="flex justify-between mt-8">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="w-full mr-2 py-3 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                >
                  ✅ Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="w-full ml-2 py-3 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                >
                  ❌ Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full py-3 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 transition"
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
