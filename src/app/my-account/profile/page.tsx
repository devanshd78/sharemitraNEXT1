"use client";

import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { useRouter } from "next/navigation";

interface ProfileType {
  userId: string;
  name: string;
  email: string;
  phone: string;
  dob?: string;
  stateId?: string;
  stateName?: string;
  cityId?: string;
  cityName?: string;
  referralCode?: string;
  totalPayoutAmount?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CityOption {
  value: string; // cityId
  label: string; // city name
}

interface StateOption {
  value: string; // stateId
  label: string; // state name
  cities: CityOption[];
}

const Profile: React.FC = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileType>({
    userId: "",
    name: "",
    email: "",
    phone: "",
    dob: "",
    stateId: "",
    stateName: "",
    cityId: "",
    cityName: "",
    referralCode: "",
    totalPayoutAmount: 0,
  });
  const [originalProfile, setOriginalProfile] = useState<ProfileType | null>(null);
  const [emailVerified, setEmailVerified] = useState(true);
  const [phoneVerified, setPhoneVerified] = useState(true);
  const [stateOptions, setStateOptions] = useState<StateOption[]>([]);
  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);

  // Function to show error via SweetAlert
  const showError = (msg: string) => {
    Swal.fire("Error", msg, "error");
  };

  // Fetch state options for the select inputs from API
  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/contact/india_states")
      .then((res) => {
        // Expecting a centralized response:
        // { success: true, message: "...", data: { states: [...] } }
        if (res.data && res.data.success) {
          const options: StateOption[] = res.data.data.states.map((state: any) => ({
            value: state.stateId,
            label: state.state,
            cities: (state.cities || []).map((city: any) => ({
              value: city.cityId,
              label: city.name,
            })),
          }));
          setStateOptions(options);
        } else {
          console.error("Failed to fetch states:", res.data.message);
        }
      })
      .catch((err) => console.error("Error fetching state options:", err));
  }, []);

  // Fetch user profile from API
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user.userId);
      fetchProfile(user.userId);
    }
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/user/getbyid?userId=${userId}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        showError(json.message || "Failed to fetch profile.");
      } else {
        // Assuming centralized response returns user details in json.data
        setProfile(json.data);
        setOriginalProfile(json.data);
        localStorage.setItem("user", JSON.stringify(json.data));
      }
    } catch (err: any) {
      showError("Failed to fetch profile.");
    } finally {
      setLoading(false);
    }
  };

  // Update city options when profile.stateId changes.
  useEffect(() => {
    if (profile.stateId && stateOptions.length > 0) {
      const matchedState = stateOptions.find((s) => s.value === profile.stateId);
      if (matchedState) {
        setCityOptions(matchedState.cities);
      } else {
        setCityOptions([]);
      }
    }
  }, [profile.stateId, stateOptions]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // For phone field, remove non-digits.
    const processedValue = name === "phone" ? value.replace(/\D/g, "") : value;
    setProfile((prev) => ({ ...prev, [name]: processedValue }));
    
    if (name === "email" && originalProfile && value !== originalProfile.email) {
      setEmailVerified(false);
    }
    if (name === "phone" && originalProfile && value !== originalProfile.phone) {
      setPhoneVerified(false);
    }
    if (name === "stateId") {
      // When state changes, find matching state and update city options.
      const selectedState = stateOptions.find((s) => s.value === value);
      if (selectedState) {
        setCityOptions(selectedState.cities);
        setProfile((prev) => ({
          ...prev,
          stateName: selectedState.label,
          cityId: "",
          cityName: "",
        }));
      } else {
        setCityOptions([]);
        setProfile((prev) => ({ ...prev, stateName: "", cityId: "", cityName: "" }));
      }
    }
    if (name === "cityId") {
      // When city changes, update cityName.
      const selectedCity = cityOptions.find((city) => city.value === value);
      setProfile((prev) => ({
        ...prev,
        cityName: selectedCity ? selectedCity.label : "",
      }));
    }
  };

  const handleVerifyEmail = async () => {
    try {
      const sendRes = await fetch("http://localhost:5000/user/send_email_otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile.email }),
      });
      const sendData = await sendRes.json();
      if (!sendRes.ok) {
        return showError(sendData.error || "Failed to send email OTP.");
      }
      const { value: otp } = await Swal.fire({
        title: "Enter Email OTP",
        input: "text",
        inputPlaceholder: "Enter OTP",
        showCancelButton: true,
      });
      if (otp) {
        const verifyRes = await fetch("http://localhost:5000/user/verify_email_otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: profile.email, otp }),
        });
        const verifyData = await verifyRes.json();
        if (verifyRes.ok) {
          Swal.fire("Verified!", "Email verified successfully.", "success");
          setEmailVerified(true);
        } else {
          showError(verifyData.error || "Email verification failed.");
        }
      }
    } catch (error) {
      showError("Error verifying email.");
    }
  };

  // Verify phone using SweetAlert2 modal
  const handleVerifyPhone = async () => {
    try {
      const sendRes = await fetch("http://localhost:5000/user/sendOTP", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: profile.phone }),
      });
      const sendData = await sendRes.json();
      if (!sendRes.ok) {
        return showError(sendData.error || "Failed to send phone OTP.");
      }
      const { value: otp } = await Swal.fire({
        title: "Enter Phone OTP",
        input: "text",
        inputPlaceholder: "Enter OTP",
        showCancelButton: true,
      });
      if (otp) {
        const verifyRes = await fetch("http://localhost:5000/user/verifyOTP", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: profile.phone, otp }),
        });
        const verifyData = await verifyRes.json();
        if (verifyRes.ok) {
          Swal.fire("Verified!", "Phone verified successfully.", "success");
          setPhoneVerified(true);
        } else {
          showError(verifyData.error || "Phone verification failed.");
        }
      }
    } catch (error) {
      showError("Error verifying phone.");
    }
  };

  const handleSave = async () => {
    if (profile.phone.length !== 10) {
      return showError("Phone number must be exactly 10 digits.");
    }
    if (
      originalProfile &&
      profile.email !== originalProfile.email &&
      !emailVerified
    ) {
      return showError("Please verify your new email before updating details.");
    }
    if (
      originalProfile &&
      profile.phone !== originalProfile.phone &&
      !phoneVerified
    ) {
      return showError("Please verify your new phone before updating details.");
    }
    try {
      const res = await fetch("http://localhost:5000/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        localStorage.setItem("user", JSON.stringify(json.data || profile));
        setIsEditing(false);
        await fetchProfile(profile.userId);
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: json.message || "Profile updated successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        showError(json.message || "Error updating profile.");
      }
    } catch (error) {
      showError("Error updating profile.");
    }
  };

  const handleCancel = () => {
    if (originalProfile) {
      setProfile(originalProfile);
      setEmailVerified(profile.email === originalProfile.email);
      setPhoneVerified(profile.phone === originalProfile.phone);
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="text-center mt-24 text-gray-700 dark:text-gray-300">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 dark:bg-zinc-950 p-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl shadow-lg border border-green-200 dark:border-green-700 p-8 md:p-10">
        <h2 className="text-4xl font-bold text-center mb-10 text-green-800 dark:text-green-200">
          Profile Settings
        </h2>
        {/* Row 1: Name & DOB */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full px-4 py-3 border rounded-md transition focus:outline-none focus:ring-2 ring-green-400 ${
                isEditing ? "bg-white dark:bg-zinc-800 border-gray-300" : "bg-gray-100 dark:bg-zinc-900 cursor-not-allowed"
              } text-gray-800 dark:text-white`}
            />
          </div>
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
              className={`w-full px-4 py-3 border rounded-md transition focus:outline-none focus:ring-2 ring-green-400 ${
                isEditing ? "bg-white dark:bg-zinc-800 border-gray-300" : "bg-gray-100 dark:bg-zinc-900 cursor-not-allowed"
              } text-gray-800 dark:text-white`}
            />
          </div>
        </div>
        {/* Row 2: Email & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-3 border rounded-md transition focus:outline-none focus:ring-2 ring-green-400 ${
                  isEditing ? "bg-white dark:bg-zinc-800 border-gray-300" : "bg-gray-100 dark:bg-zinc-900 cursor-not-allowed"
                } text-gray-800 dark:text-white`}
              />
              {isEditing &&
                originalProfile &&
                profile.email !== originalProfile.email &&
                !emailVerified && (
                  <button
                    onClick={handleVerifyEmail}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md"
                  >
                    Verify
                  </button>
                )}
            </div>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                disabled={!isEditing}
                minLength={10}
                maxLength={10}
                className={`w-full px-4 py-3 border rounded-md transition focus:outline-none focus:ring-2 ring-green-400 ${
                  isEditing ? "bg-white dark:bg-zinc-800 border-gray-300" : "bg-gray-100 dark:bg-zinc-900 cursor-not-allowed"
                } text-gray-800 dark:text-white`}
              />
              {isEditing &&
                originalProfile &&
                profile.phone !== originalProfile.phone &&
                !phoneVerified && (
                  <button
                    onClick={handleVerifyPhone}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md"
                  >
                    Verify
                  </button>
                )}
            </div>
          </div>
        </div>
        {/* Row 3: State & City */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              State
            </label>
            {isEditing ? (
              <select
                name="stateId"
                value={profile.stateId || ""}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-md transition focus:outline-none focus:ring-2 ring-green-400 ${
                  isEditing ? "bg-white dark:bg-zinc-800 border-gray-300" : "bg-gray-100 dark:bg-zinc-900 cursor-not-allowed"
                } text-gray-800 dark:text-white`}
              >
                <option value="">Select State</option>
                {stateOptions.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
            ) : (
              <div
                className={`w-full px-4 py-3 border rounded-md transition ${
                  false ? "bg-white dark:bg-zinc-800 border-gray-300" : "bg-gray-100 dark:bg-zinc-900"
                } text-gray-800 dark:text-white`}
              >
                {profile.stateName || ""}
              </div>
            )}
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              City
            </label>
            {isEditing ? (
              <select
                name="cityId"
                value={profile.cityId || ""}
                onChange={handleChange}
                disabled={!profile.stateId}
                className={`w-full px-4 py-3 border rounded-md transition focus:outline-none focus:ring-2 ring-green-400 ${
                  isEditing
                    ? "bg-white dark:bg-zinc-800 border-gray-300"
                    : "bg-gray-100 dark:bg-zinc-900 cursor-not-allowed"
                } text-gray-800 dark:text-white`}
              >
                <option value="">
                  {cityOptions.length === 0
                    ? "Select a state first"
                    : "Select City"}
                </option>
                {cityOptions.map((city) => (
                  <option key={city.value} value={city.value}>
                    {city.label}
                  </option>
                ))}
              </select>
            ) : (
              <div
                className={`w-full px-4 py-3 border rounded-md transition ${
                  false ? "bg-white dark:bg-zinc-800 border-gray-300" : "bg-gray-100 dark:bg-zinc-900"
                } text-gray-800 dark:text-white`}
              >
                {profile.cityName || ""}
              </div>
            )}
          </div>
        </div>
        {/* Action Buttons */}
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
                onClick={handleCancel}
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
  );
};

export default Profile;
