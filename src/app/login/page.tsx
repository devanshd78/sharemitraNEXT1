"use client";

import React, {
  useState,
  FormEvent,
  ChangeEvent,
  useRef,
  useCallback,
  useEffect,
} from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";

interface LoginData {
  email: string;
  password: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  phone: string;
  referralCode:string
}

interface Errors {
  [key: string]: string;
}

function checkPasswordRequirements(password: string) {
  return {
    length: password.length >= 8 && password.length <= 16,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

function Login() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [signupData, setSignupData] = useState<SignupData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    referralCode:""
  });
  const [errors, setErrors] = useState<Errors>({});

  // reCAPTCHA v2 Invisible reference
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  // Controls for showing/hiding password
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // Forgot password modal states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotUserId, setForgotUserId] = useState<number | null>(null);
  const [forgotOldPassword, setForgotOldPassword] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref");

    if (ref) {
      localStorage.setItem("referralCode", ref);
      setSignupData(prev => ({ ...prev, referralCode: ref }));
    }
  }, []);

  // Validate login
  const validateLogin = (): boolean => {
    const tempErrors: Errors = {};
    if (!loginData.email) tempErrors.email = "Email is required";
    if (!loginData.password) tempErrors.password = "Password is required";
    else if (loginData.password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Validate signup
  const validateSignup = (): boolean => {
    const tempErrors: Errors = {};
    if (!signupData.name) tempErrors.fullName = "Full Name is required";
    if (!signupData.email) tempErrors.email = "Email is required";
    if (!signupData.phone) tempErrors.phone = "Phone number is required";
    if (!signupData.password) {
      tempErrors.password = "Password is required";
    } else if (signupData.password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Generic change handler
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // For phone number, allow only numeric input
    const processedValue = name === "phone" ? value.replace(/\D/g, "") : value;

    if (isLogin) {
      setLoginData((prev) => ({ ...prev, [name]: processedValue }));
    } else {
      setSignupData((prev) => ({ ...prev, [name]: processedValue }));
    }

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };


  // reCAPTCHA v2 Invisible: trigger it before form submission
  const executeRecaptcha = useCallback(async () => {
    if (recaptchaRef.current) {
      const token = await recaptchaRef.current.executeAsync();
      setRecaptchaToken(token);
      // Optionally reset after each execution
      recaptchaRef.current.reset();
    }
  }, []);

  // Main form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const url = isLogin
      ? "http://127.0.0.1:5000/user/login"
      : "http://127.0.0.1:5000/user/register";
    const data = isLogin ? loginData : signupData;

    // Acquire the invisible reCAPTCHA token
    await executeRecaptcha();

    if (!recaptchaToken) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Could not validate reCAPTCHA. Please try again.",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    // Validate input fields
    const valid = isLogin ? validateLogin() : validateSignup();
    if (!valid) return;

    try {
      // Submit to backend
      const response = await axios.post(url, data, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("Success:", response.data);

      if (isLogin) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("isLoggedIn", "true");
        router.push("/home");
      } else {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Signup successful. Please log in.",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          setIsLogin(true);
          setSignupData({
            name: "",
            email: "",
            phone: "",
            password: "",
            referralCode:""
          });
        });
      }
    } catch (error: any) {
      console.error(
        "Error:",
        error.response ? error.response.data.message : error.message
      );
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response
          ? error.response.data.message
          : error.message,
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  // Forgot password: Step 1 – Verify email
  const handleForgotVerify = async () => {
    if (!forgotEmail) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please enter your email.",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/user/get_id_by_email?email=${forgotEmail}`
      );
      if (response.data.status === 200) {
        setForgotUserId(response.data.id);
        setForgotStep(2);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Email verified.",
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

  // Forgot password: Step 2 – Update password
  const handleForgotPasswordUpdate = async () => {
    if (!forgotOldPassword || !forgotNewPassword) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please enter both old and new passwords.",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/user/update_password",
        {
          _id: forgotUserId,
          old_password: forgotOldPassword,
          new_password: forgotNewPassword,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Password updated successfully.",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          setForgotStep(1);
          setForgotEmail("");
          setForgotUserId(null);
          setForgotOldPassword("");
          setForgotNewPassword("");
          setShowForgotModal(false);
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

  // Real-time checks for sign-up password
  const passwordChecks = checkPasswordRequirements(signupData.password);
  const reqClass = (condition: boolean) =>
    condition ? "text-green-600" : "text-red-600";

  return (
    <div
      className="flex items-center justify-center min-h-screen relative"
      style={{ backgroundColor: "#E8F5E9" }} // Light green background
    >
      {/* Main Container */}
      <div className="bg-white shadow-lg rounded-[15px] flex flex-col md:flex-row w-3/4 md:w-1/2 overflow-hidden">

        {/* Mobile toggle (Login | Sign Up) */}
        <div className="flex md:hidden justify-center p-3">
          <div
            className="cursor-pointer px-5 py-2 border"
            style={{
              borderColor: "#388e3c",
              borderTopLeftRadius: "20px",
              borderBottomLeftRadius: "20px",
              backgroundColor: isLogin ? "#388e3c" : "#fff",
              color: isLogin ? "#fff" : "#388e3c",
            }}
            onClick={() => setIsLogin(true)}
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
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </div>
        </div>

        {/* Left Panel (Desktop) */}
        <div
          className="hidden md:flex flex-col items-center justify-center p-5 w-1/2"
          style={{
            color: "#1b5e20",
            borderTopLeftRadius: "15px",
            borderBottomLeftRadius: "15px",
            background: "linear-gradient(to bottom, #ffffff, #A5D6A7)",
          }}
        >
          <h3 className="text-xl font-semibold">
            {isLogin ? "New Here?" : "Already have an account?"}
          </h3>
          <button
            className="mt-3 px-4 py-2 bg-white rounded shadow-sm text-[#1b5e20] hover:bg-green-100 transition-colors"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </div>

        {/* Right Panel */}
        <div
          className="p-5 w-full md:w-1/2"
          style={{ borderRadius: "15px 15px 0 0" }}
        >
          <h2
            className="mb-4 text-center text-2xl font-semibold"
            style={{ color: "#388e3c" }}
          >
            {isLogin ? "Login" : "Sign Up"}
          </h2>
          <form onSubmit={handleSubmit}>
            {/* Full Name (Signup Only) */}
            {!isLogin && (
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
                {errors.fullName && (
                  <small className="text-red-600">{errors.name}</small>
                )}
              </div>
            )}

            {/* Email */}
            <div className="mb-4">
              <label className="block mb-1 text-black">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={isLogin ? loginData.email : signupData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-2 text-gray-600"
              />
              {errors.email && (
                <small className="text-red-600">{errors.email}</small>
              )}
            </div>

            {/* Phone Number (Signup Only) */}
            {!isLogin && (
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
                    className="flex-1 p-2 outline-none text-gray-600"
                    placeholder="Enter phone number"
                    maxLength={10}
                    minLength={10}
                    value={signupData.phone}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/\D/g, '');
                      setSignupData((prev) => ({ ...prev, phone: numericValue }));
                      setErrors((prev) => ({ ...prev, phone: "" }));
                    }}
                    
                  />

                </div>
                {errors.phone && (
                  <small className="text-red-600">{errors.phone}</small>
                )}
              </div>
            )}

            {/* Password */}
            <div className="mb-4">
              <label className="block mb-1 text-black">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showSignUpPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter password"
                  value={isLogin ? loginData.password : signupData.password}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded p-2 pr-10 text-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label="Toggle Password Visibility"
                >
                  {!showSignUpPassword ? (
                    <FaRegEyeSlash className="w-5 h-5" />
                  ) : (
                    <FaRegEye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <small className="text-red-600">{errors.password}</small>
              )}
            </div>

            {isLogin && (
              <button
                type="button"
                className="mt-3 w-full text-right text-sm"
                style={{ color: "#388e3c" }}
                onClick={() => setShowForgotModal(true)}
              >
                Forgot Password?
              </button>
            )}

            {/* Password Requirements (Sign Up Only) */}
            {!isLogin && (
              <div className="mb-4 text-sm">
                <p className={reqClass(passwordChecks.length)}>• 8-16 characters</p>
                <p className={reqClass(passwordChecks.uppercase)}>• At least 1 uppercase letter</p>
                <p className={reqClass(passwordChecks.lowercase)}>• At least 1 lowercase letter</p>
                <p className={reqClass(passwordChecks.number)}>• At least 1 number</p>
                <p className={reqClass(passwordChecks.special)}>• At least 1 special character</p>
              </div>
            )}

            {/* Invisible reCAPTCHA v2 */}
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY!}
              size="invisible"
            />

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2 rounded text-white mt-4 hover:bg-green-700 transition-colors"
              style={{ backgroundColor: "#388e3c" }}
            >
              {isLogin ? "Login" : "Sign Up"}
            </button>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {/* {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-80 relative">
            <button
              className="absolute top-2 right-2 text-gray-500"
              onClick={() => {
                setShowForgotModal(false);
                setForgotStep(1);
                setForgotEmail("");
                setForgotUserId(null);
                setForgotOldPassword("");
                setForgotNewPassword("");
              }}
            >
              &times;
            </button>
            {forgotStep === 1 && (
              <div>
                <h3 className="text-xl font-bold mb-4 text-black">Forgot Password</h3>
                <div className="mb-4">
                  <label className="block mb-1 text-gray-800">Enter your email:</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded p-2 text-gray-600"
                    placeholder="you@example.com"
                  />
                </div>
                <button
                  onClick={handleForgotVerify}
                  className="w-full py-2 rounded text-white hover:bg-green-700 transition-colors"
                  style={{ backgroundColor: "#388e3c" }}
                >
                  Verify Email
                </button>
              </div>
            )}
            {forgotStep === 2 && (
              <div>
                <h3 className="text-xl font-bold mb-4 text-black">Reset Password</h3>
                <div className="mb-4">
                  <label className="block mb-1 text-gray-800">Old Password:</label>
                  <input
                    type="password"
                    value={forgotOldPassword}
                    onChange={(e) => setForgotOldPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded p-2 text-gray-600"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 text-gray-800">New Password:</label>
                  <input
                    type="password"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded p-2 text-gray-600"
                  />
                </div>
                <button
                  onClick={handleForgotPasswordUpdate}
                  className="w-full py-2 rounded text-white hover:bg-green-700 transition-colors"
                  style={{ backgroundColor: "#388e3c" }}
                >
                  Update Password
                </button>
              </div>
            )}
          </div>
        </div>
      )} */}
    </div>
  );
}

export default Login;
