"use client";

import React, { useState, FormEvent, ChangeEvent, useEffect, useTransition, startTransition } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../../firebase";


interface LoginData {
  identifier: string; // email or phone
  otp: string;
}

interface SignupData {
  name: string;
  email: string;
  emailOtp: string;
  phone: string;
  phoneOtp: string;
  dateOfBirth: string;
  state: string;
  city: string;
  referralCode: string;
}

interface Errors {
  [key: string]: string;
}

interface StateOption {
  value: string;
  label: string;
  cities: string[];
}

export interface LoginModalProps {
  onClose: () => void; // For closing the modal
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);

  // Login states for OTP-based login
  const [loginData, setLoginData] = useState<LoginData>({
    identifier: "",
    otp: "",
  });
  const [loginOtpSent, setLoginOtpSent] = useState(false);

  // Signup states for multi-step signup
  const [signupData, setSignupData] = useState<SignupData>({
    name: "",
    email: "",
    emailOtp: "",
    phone: "",
    phoneOtp: "",
    dateOfBirth: "",
    state: "",
    city: "",
    referralCode: "",
  });
  const [signupStep, setSignupStep] = useState(1);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [showEmailOtpInput, setShowEmailOtpInput] = useState(false);
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
  const [isVerifyingEmailOtp, setIsVerifyingEmailOtp] = useState(false);
  const [showPhoneOtpInput, setShowPhoneOtpInput] = useState(false);
  const [stateOptions, setStateOptions] = useState<StateOption[]>([]);
  const [cityOptions, setCityOptions] = useState<string[]>([]);

  const [resendCountdown, setResendCountdown] = useState(0);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isPending, setTransition] = useTransition();

  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/contact/india_states")
      .then((res) => {
        if (res.data && res.data.states) {
          const options: StateOption[] = res.data.states.map((state: any) => ({
            value: state.name,
            label: state.name,
            cities: state.cities || [],
          }));
          setStateOptions(options);
        }
      })
      .catch((err) => console.error("Error fetching states:", err));
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref");
    if (ref) {
      localStorage.setItem("referralCode", ref);
      setSignupData((prev) => ({ ...prev, referralCode: ref }));
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() =>
        setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  useEffect(() => {
    const recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
      }
    );

    setRecaptchaVerifier(recaptchaVerifier);

    return () => {
      recaptchaVerifier.clear();
    };
  }, [auth])

  // Validate login
  const validateLogin = (): boolean => {
    const tempErrors: Errors = {};
    if (!loginData.identifier)
      tempErrors.identifier = "Email or Phone is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Validate signup for the current step
  const validateSignup = (): boolean => {
    const tempErrors: Errors = {};
    if (signupStep === 1) {
      if (!signupData.name) tempErrors.name = "Full Name is required";
      if (!signupData.email) tempErrors.email = "Email is required";
      if (!emailVerified) tempErrors.emailOtp = "Email not verified";
    } else if (signupStep === 2) {
      if (!signupData.phone) tempErrors.phone = "Phone number is required";
      if (!phoneVerified) tempErrors.phoneOtp = "Phone not verified";
    } else if (signupStep === 3) {
      if (!signupData.dateOfBirth)
        tempErrors.dateOfBirth = "Date of Birth is required";
      if (!signupData.state) tempErrors.state = "State is required";
      if (!signupData.city) tempErrors.city = "City is required";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Handle input changes for both login and signup
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (isLogin) {
      setLoginData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    } else {
      setSignupData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ----- Login OTP Functions -----
  const handleSendLoginOtp = async () => {
    if (!loginData.identifier) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please enter your email or phone.",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/user/send_login_otp",
        {
          identifier: loginData.identifier,
        }
      );
      if (response.data.status === 200) {
        setLoginOtpSent(true);
        Swal.fire({
          icon: "success",
          title: "OTP Sent",
          text: "OTP has been sent to your email/phone.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.data.msg,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response ? error.response.data.msg : error.message,
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;

    if (!loginOtpSent) {
      await handleSendLoginOtp();
      return;
    } else {
      if (!loginData.otp) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Please enter the OTP.",
          timer: 1500,
          showConfirmButton: false,
        });
        return;
      }
      try {
        const response = await axios.post(
          "http://127.0.0.1:5000/user/login_by_otp",
          {
            identifier: loginData.identifier,
            otp: loginData.otp,
          }
        );
        if (response.data.status === 200) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
          localStorage.setItem("isLoggedIn", "true");
          onClose();
          router.refresh();
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.data.msg,
            timer: 1500,
            showConfirmButton: false,
          });
        }
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response ? error.response.data.msg : error.message,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    }
  };

  // ----- Signup OTP Functions for Email -----
  const handleSendEmailOtp = async () => {
    if (!signupData.email) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please enter your email.",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }
    setShowEmailOtpInput(true);
    setIsSendingEmailOtp(true);
    // Your email OTP implementation here
    // For now, we simply simulate the behavior:
    setTimeout(() => {
      Swal.fire({
        icon: "success",
        title: "OTP Sent",
        text: "OTP has been sent to your email.",
        timer: 1500,
        showConfirmButton: false,
      });
      setIsSendingEmailOtp(false);
    }, 1000);
  };

  const handleVerifyEmailOtp = async () => {
    if (!signupData.emailOtp) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please enter the email OTP.",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }
    setIsVerifyingEmailOtp(true);
    // Simulate verification
    setTimeout(() => {
      setEmailVerified(true);
      Swal.fire({
        icon: "success",
        title: "Verified",
        text: "Email verified successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
      setIsVerifyingEmailOtp(false);
    }, 1000);
  };

  const handleSendPhoneOtp = async () => {
    if (!signupData.phone) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please enter your phone number.",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }
  
    setResendCountdown(60);
    startTransition(async () => {
      if (!recaptchaVerifier) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Recaptcha Verifier is not initialized.",
          timer: 1500,
          showConfirmButton: false,
        });
        return;
      }
  
      try {
        const phoneWithCountryCode = "+91" + signupData.phone;
        const confirmationResult = await signInWithPhoneNumber(
          auth,
          phoneWithCountryCode,
          recaptchaVerifier
        );
  
        setConfirmationResult(confirmationResult);
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message,
          timer: 1500,
          showConfirmButton: false,
        });
        setResendCountdown(0);
      }
    });
  };
  

  const handleVerifyPhoneOtp = async () => {
    if (!signupData.phoneOtp) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please enter the phone OTP.",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }
    try {
      const confirmationResult = window.confirmationResult;
      if (!confirmationResult) {
        throw new Error("No OTP request found. Please resend OTP.");
      }
      // Confirm the OTP entered by the user.
      await confirmationResult.confirm(signupData.phoneOtp);
      setPhoneVerified(true);
      Swal.fire({
        icon: "success",
        title: "Verified",
        text: "Phone verified successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  // Handle signup form submission (multi-step)
  const handleSignupSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateSignup()) return;

    if (signupStep < 3) {
      // Move to the next step if current step is validated
      setSignupStep((prev) => prev + 1);
    } else {
      // Final step: submit registration
      try {
        const response = await axios.post(
          "http://127.0.0.1:5000/user/register",
          signupData,
          { headers: { "Content-Type": "application/json" } }
        );
        if (response.data.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Signup successful. Please log in.",
            timer: 1500,
            showConfirmButton: false,
          }).then(() => {
            setIsLogin(true);
            setSignupStep(1);
            setEmailVerified(false);
            setPhoneVerified(false);
            setSignupData({
              name: "",
              email: "",
              emailOtp: "",
              phone: "",
              phoneOtp: "",
              dateOfBirth: "",
              state: "",
              city: "",
              referralCode: "",
            });
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.data.msg,
            timer: 1500,
            showConfirmButton: false,
          });
        }
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response ? error.response.data.msg : error.message,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    }
  };

  // ----- Render -----
  return (
    <>
      {/* Modal Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/30 backdrop-blur-sm">
        {/* Modal Container */}
        <div className="relative bg-white rounded-[15px] w-full max-w-xl overflow-hidden shadow-lg">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-4 text-2xl text-gray-600"
          >
            &times;
          </button>

          {/* Mobile toggle (Login | Sign Up) */}
          <div className="flex justify-center p-4">
            <div
              className="cursor-pointer px-5 py-2 border"
              style={{
                borderColor: "#388e3c",
                borderTopLeftRadius: "20px",
                borderBottomLeftRadius: "20px",
                backgroundColor: isLogin ? "#388e3c" : "#fff",
                color: isLogin ? "#fff" : "#388e3c",
              }}
              onClick={() => {
                setIsLogin(true);
                setErrors({});
              }}
            >
              Login
            </div>
            <div
              className="cursor-pointer px-5 py-2 border"
              style={{
                borderColor: "#388e3c",
                borderTopRightRadius: "20px",
                borderBottomRightRadius: "20px",
                backgroundColor: !isLogin ? "#388e3c" : "#fff",
                color: !isLogin ? "#fff" : "#388e3c",
              }}
              onClick={() => {
                setIsLogin(false);
                setErrors({});
              }}
            >
              Sign Up
            </div>
          </div>

          {/* Main Content */}
          <div className="p-5">
            {isLogin ? (
              <form onSubmit={handleLoginSubmit}>
                {/* Identifier Field */}
                <div className="mb-4">
                  <label className="block mb-1 text-black">
                    Email or Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="identifier"
                    placeholder="Enter email or phone"
                    value={loginData.identifier}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded p-2 text-gray-600"
                  />
                  {errors.identifier && (
                    <small className="text-red-600">
                      {errors.identifier}
                    </small>
                  )}
                </div>

                {/* OTP Field (visible after OTP sent) */}
                {loginOtpSent && (
                  <div className="mb-4">
                    <label className="block mb-1 text-black">
                      OTP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="otp"
                      placeholder="Enter OTP"
                      value={loginData.otp}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded p-2 text-gray-600"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2 rounded text-white mt-4 hover:bg-green-700 transition-colors"
                  style={{ backgroundColor: "#388e3c" }}
                >
                  {loginOtpSent ? "Login" : "Send OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignupSubmit}>
                {/* Step Indicator */}
                <div className="flex items-center justify-center mb-6">
                  {[1, 2, 3].map((step) => (
                    <React.Fragment key={step}>
                      <div
                        className={`w-4 h-4 rounded-full ${signupStep >= step ? "bg-green-600" : "bg-gray-300"
                          }`}
                      ></div>
                      {step < 3 && <div className="w-8 h-1 bg-gray-300 mx-2"></div>}
                    </React.Fragment>
                  ))}
                </div>

                {signupStep === 1 && (
                  <>
                    <div className="mb-4">
                      <label className="block mb-1 text-black">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Enter full name"
                        value={signupData.name}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded p-2 text-gray-600"
                      />
                      {errors.name && (
                        <small className="text-red-600">{errors.name}</small>
                      )}
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1 text-black">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          placeholder="Enter email"
                          value={signupData.email}
                          onChange={handleChange}
                          disabled={showEmailOtpInput}
                          className={`w-full border border-gray-300 rounded p-2 text-gray-600 ${showEmailOtpInput ? "pr-4 cursor-not-allowed" : "pr-32"
                            }`}
                        />
                        {!showEmailOtpInput && (
                          <button
                            type="button"
                            onClick={handleSendEmailOtp}
                            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white font-medium rounded px-3 py-1 shadow transition"
                          >
                            Send OTP
                          </button>
                        )}
                      </div>
                      {errors.email && (
                        <small className="text-red-600">{errors.email}</small>
                      )}
                      {showEmailOtpInput && (
                        <div className="mt-2 relative">
                          <input
                            type="text"
                            name="emailOtp"
                            placeholder="Enter Email OTP"
                            value={signupData.emailOtp}
                            onChange={handleChange}
                            disabled={emailVerified}
                            className={`w-full border border-gray-300 rounded p-2 text-gray-600 ${emailVerified ? "pr-4 cursor-not-allowed" : "pr-32"
                              }`}
                          />
                          {!emailVerified ? (
                            <button
                              type="button"
                              onClick={handleVerifyEmailOtp}
                              className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white font-medium rounded px-3 py-1 shadow transition"
                            >
                              Verify
                            </button>
                          ) : (
                            <div className="absolute top-1/2 right-2 transform -translate-y-1/2 flex items-center space-x-1">
                              <svg
                                className="w-5 h-5 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              <span className="text-green-600 font-medium">Verified</span>
                            </div>
                          )}
                          {errors.emailOtp && (
                            <small className="text-red-600">{errors.emailOtp}</small>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {signupStep === 2 && (
                  <div>
                    {!confirmationResult && (
                      <>
                        <div className="mb-4">
                          <label className="block mb-1 text-black">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <div className="flex border border-gray-300 rounded overflow-hidden">
                            <span className="bg-gray-200 px-3 py-2 text-gray-600 flex items-center">
                              +91
                            </span>
                            <input
                              type="text"
                              name="phone"
                              placeholder="Enter phone number"
                              value={signupData.phone}
                              onChange={(e) => {
                                const numericValue = e.target.value.replace(/\D/g, "");
                                setSignupData((prev) => ({
                                  ...prev,
                                  phone: numericValue,
                                }));
                                setErrors((prev) => ({ ...prev, phone: "" }));
                              }}
                              disabled={showPhoneOtpInput}
                              className={`flex-1 p-2 outline-none text-gray-600 ${showPhoneOtpInput ? "cursor-not-allowed" : ""
                                }`}
                              maxLength={10}
                            />
                          </div>
                          {errors.phone && (
                            <small className="text-red-600">{errors.phone}</small>
                          )}
                        </div>

                        <div className="mt-2 relative">
                          {!showPhoneOtpInput && (
                            <button
                              type="button"
                              onClick={handleSendPhoneOtp}
                              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded shadow transition"
                            >
                              Send Phone OTP
                            </button>
                          )}
                          {showPhoneOtpInput && (
                            <div className="relative">
                              <input
                                type="text"
                                name="phoneOtp"
                                placeholder="Enter Phone OTP"
                                value={signupData.phoneOtp}
                                onChange={handleChange}
                                disabled={phoneVerified}
                                className={`w-full border border-gray-300 rounded p-2 text-gray-600 ${phoneVerified ? "pr-4 cursor-not-allowed" : "pr-32"
                                  }`}
                              />
                              {!phoneVerified ? (
                                <button
                                  type="button"
                                  onClick={handleVerifyPhoneOtp}
                                  className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white font-medium rounded px-3 py-1 shadow transition"
                                >
                                  Verify OTP
                                </button>
                              ) : (
                                <div className="absolute top-1/2 right-2 transform -translate-y-1/2 flex items-center space-x-1">
                                  <svg
                                    className="w-5 h-5 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  <span className="text-green-600 font-medium">Verified</span>
                                </div>
                              )}
                              {errors.phoneOtp && (
                                <small className="text-red-600">{errors.phoneOtp}</small>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                    
                  </div>
                )}

                {signupStep === 3 && (
                  <>
                    {/* Date of Birth */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={signupData.dateOfBirth}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-green-600 focus:ring-2 focus:ring-green-600 transition duration-150 ease-in-out text-gray-700"
                      />
                      {errors.dateOfBirth && (
                        <p className="mt-1 text-xs text-red-600">{errors.dateOfBirth}</p>
                      )}
                    </div>

                    {/* State Select */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={signupData.state}
                        onChange={(e) => {
                          const selectedValue = e.target.value;
                          setSignupData((prev) => ({ ...prev, state: selectedValue, city: "" }));
                          // Update city options for the selected state.
                          const selectedState = stateOptions.find(
                            (s) => s.value === selectedValue
                          );
                          if (selectedState) {
                            setCityOptions(selectedState.cities);
                          } else {
                            setCityOptions([]);
                          }
                        }}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-green-600 focus:ring-2 focus:ring-green-600 transition duration-150 ease-in-out"
                      >
                        <option value="">Select state</option>
                        {stateOptions.map((state) => (
                          <option key={state.value} value={state.value}>
                            {state.label}
                          </option>
                        ))}
                      </select>
                      {errors.state && (
                        <p className="mt-1 text-xs text-red-600">{errors.state}</p>
                      )}
                    </div>

                    {/* City Select */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={signupData.city}
                        onChange={(e) =>
                          setSignupData((prev) => ({ ...prev, city: e.target.value }))
                        }
                        disabled={cityOptions.length === 0 || !signupData.state}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-green-600 focus:ring-2 focus:ring-green-600 transition duration-150 ease-in-out"
                      >
                        <option value="">
                          {cityOptions.length === 0 ? "Select a state first" : "Select city"}
                        </option>
                        {cityOptions.map((city, index) => (
                          <option key={index} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                      {errors.city && (
                        <p className="mt-1 text-xs text-red-600">{errors.city}</p>
                      )}
                    </div>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Referral Code
                      </label>
                      <input
                        type="text"
                        name="referralCode"
                        value={signupData.referralCode}
                        onChange={handleChange}
                        placeholder="Enter referral code (optional)"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-green-600 focus:ring-2 focus:ring-green-600 transition duration-150 ease-in-out"
                      />
                      {errors.referralCode && (
                        <p className="mt-1 text-xs text-red-600">{errors.referralCode}</p>
                      )}
                    </div>
                  </>
                )}

                <div className="flex justify-between mt-6">
                  {signupStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setSignupStep((prev) => prev - 1)}
                      className="py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded shadow transition"
                    >
                      Back
                    </button>
                  )}
                  <button
                    type="submit"
                    className="ml-auto py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded shadow transition"
                  >
                    {signupStep < 3 ? "Next" : "Sign Up"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        <div id="recaptcha-container" />
      </div>
    </>
  );
};

export default LoginModal;
