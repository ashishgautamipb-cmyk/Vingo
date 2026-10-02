import React, { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const serverUrl = "http://localhost:5000";

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [err, setErr] = useState("");

  const navigate = useNavigate();

  // =========================
  // SEND OTP
  // =========================
  const handleSendOtp = async () => {
    if (!email) {
      setErr("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      setErr("");

      console.log("Sending OTP to:", email);

      const result = await axios.post(
        `${serverUrl}/api/auth/send-otp`,
        { email },
        { withCredentials: true }
      );

      console.log("SEND OTP RESPONSE:", result.data);

      setStep(2);
      setErr("");

    } catch (error) {
      console.log("SEND OTP ERROR:", error);
      console.log("STATUS:", error.response?.status);
      console.log("DATA:", error.response?.data);

      setErr(
        error.response?.data?.message ||
        "Something went wrong while sending OTP"
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================
  // VERIFY OTP
  // =========================
  const handleVerifyOtp = async () => {
    if (!otp) {
      setErr("Please enter OTP");
      return;
    }

    try {
      setLoading(true);
      setErr("");

      console.log("Verifying OTP:", otp);

      const result = await axios.post(
        `${serverUrl}/api/auth/verify-otp`,
        {
          email,
          otp,
        },
        { withCredentials: true }
      );

      console.log("VERIFY OTP RESPONSE:", result.data);

      setStep(3);
      setErr("");

    } catch (error) {
      console.log("VERIFY OTP ERROR:", error);
      console.log("STATUS:", error.response?.status);
      console.log("DATA:", error.response?.data);

      setErr(
        error.response?.data?.message ||
        "Invalid or expired OTP"
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RESET PASSWORD
  // =========================
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setErr("Please enter both passwords");
      return;
    }

    if (newPassword.length < 6) {
      setErr("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErr("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setErr("");

      const result = await axios.post(
        `${serverUrl}/api/auth/reset-password`,
        {
          email,
          newPassword,
        },
        { withCredentials: true }
      );

      console.log("RESET PASSWORD RESPONSE:", result.data);

      alert("Password reset successfully");

      navigate("/signin");

    } catch (error) {
      console.log("RESET PASSWORD ERROR:", error);
      console.log("STATUS:", error.response?.status);
      console.log("DATA:", error.response?.data);

      setErr(
        error.response?.data?.message ||
        "Password reset failed"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full items-center justify-center min-h-screen p-4 bg-[#fff9f6]">

      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-6">

          <IoIosArrowRoundBack
            size={30}
            className="text-[#ff4d2d] cursor-pointer"
            onClick={() => navigate("/signin")}
          />

          <h1 className="text-2xl font-bold text-[#ff4d2d]">
            Forgot Password
          </h1>

        </div>


        {/* ERROR MESSAGE */}
        {err && (
          <p className="text-red-500 text-center mb-4 font-medium">
            {err}
          </p>
        )}


        {/* =========================
            STEP 1 - EMAIL
        ========================= */}

        {step === 1 && (
          <div>

            <div className="mb-6">

              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-1"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                placeholder="Enter your email"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErr("");
                }}
                value={email}
              />

            </div>

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer disabled:opacity-50"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>

          </div>
        )}


        {/* =========================
            STEP 2 - OTP
        ========================= */}

        {step === 2 && (
          <div>

            <p className="text-gray-500 text-sm mb-5">
              OTP has been sent to your email.
            </p>

            <div className="mb-6">

              <label
                htmlFor="otp"
                className="block text-gray-700 font-medium mb-1"
              >
                Enter OTP
              </label>

              <input
                id="otp"
                type="text"
                maxLength="4"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                placeholder="Enter 4 digit OTP"
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""));
                  setErr("");
                }}
                value={otp}
              />

            </div>

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

          </div>
        )}


        {/* =========================
            STEP 3 - RESET PASSWORD
        ========================= */}

        {step === 3 && (
          <div>

            {/* NEW PASSWORD */}

            <div className="mb-6">

              <label
                htmlFor="newPassword"
                className="block text-gray-700 font-medium mb-1"
              >
                New Password
              </label>

              <input
                id="newPassword"
                type="password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                placeholder="Enter new password"
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErr("");
                }}
                value={newPassword}
              />

            </div>


            {/* CONFIRM PASSWORD */}

            <div className="mb-6">

              <label
                htmlFor="confirmPassword"
                className="block text-gray-700 font-medium mb-1"
              >
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                placeholder="Confirm your password"
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErr("");
                }}
                value={confirmPassword}
              />

            </div>


            <button
              type="button"
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

          </div>
        )}

      </div>

    </div>
  );
}

export default ForgotPassword;