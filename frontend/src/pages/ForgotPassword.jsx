import { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FiMail, FiLock, FiKey, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";

function ForgotPassword() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const navigate = useNavigate();

    // =========================
    // SEND OTP
    // =========================
    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail) {
            setErr("Please enter your registered email address");
            return;
        }

        try {
            setLoading(true);
            setErr("");
            setSuccessMsg("");

            await axios.post(
                `${serverUrl}/api/auth/send-otp`,
                { email: cleanEmail },
                { withCredentials: true }
            );

            setSuccessMsg(`OTP sent to ${cleanEmail}`);
            setStep(2);
        } catch (error) {
            console.error("SEND OTP ERROR:", error);
            setErr(
                error.response?.data?.message ||
                    "Could not send OTP. Make sure the email is registered."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // VERIFY OTP
    // =========================
    const handleVerifyOtp = async (e) => {
        if (e) e.preventDefault();
        const cleanOtp = otp.trim();
        if (!cleanOtp || cleanOtp.length !== 4) {
            setErr("Please enter the 4-digit OTP");
            return;
        }

        try {
            setLoading(true);
            setErr("");
            setSuccessMsg("");

            await axios.post(
                `${serverUrl}/api/auth/verify-otp`,
                {
                    email: email.trim().toLowerCase(),
                    otp: cleanOtp,
                },
                { withCredentials: true }
            );

            setSuccessMsg("OTP verified! Set your new password.");
            setStep(3);
        } catch (error) {
            console.error("VERIFY OTP ERROR:", error);
            setErr(
                error.response?.data?.message ||
                    "Invalid or expired OTP. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // RESET PASSWORD
    // =========================
    const handleResetPassword = async (e) => {
        if (e) e.preventDefault();
        if (!newPassword || !confirmPassword) {
            setErr("Please enter both password fields");
            return;
        }

        if (newPassword.length < 6) {
            setErr("Password must be at least 6 characters long");
            return;
        }

        if (newPassword !== confirmPassword) {
            setErr("Passwords do not match");
            return;
        }

        try {
            setLoading(true);
            setErr("");
            setSuccessMsg("");

            await axios.post(
                `${serverUrl}/api/auth/reset-password`,
                {
                    email: email.trim().toLowerCase(),
                    newPassword,
                },
                { withCredentials: true }
            );

            setSuccessMsg("Password reset successfully! Redirecting to sign in...");
            setTimeout(() => {
                navigate("/signin");
            }, 800);
        } catch (error) {
            console.error("RESET PASSWORD ERROR:", error);
            setErr(
                error.response?.data?.message ||
                    "Password reset failed. Please retry."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff7f3] via-[#ffede3] to-[#ffe5d9] px-4 py-8 relative overflow-hidden">
            {/* Background blur effects */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-red-400/20 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-xl shadow-orange-500/10 border border-orange-100/60 p-7 sm:p-9 relative z-10 transition-all">
                {/* Back button */}
                <div className="flex items-center gap-3 mb-5">
                    <button
                        type="button"
                        onClick={() => navigate("/signin")}
                        className="p-1.5 -ml-1.5 rounded-full hover:bg-orange-50 text-gray-500 hover:text-[#ff4d2d] transition cursor-pointer"
                        aria-label="Back to sign in"
                    >
                        <IoIosArrowRoundBack size={28} />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                            Reset Password
                        </h1>
                        <p className="text-xs text-gray-500">
                            Step {step} of 3: {step === 1 ? "Enter Email" : step === 2 ? "Verify OTP" : "New Password"}
                        </p>
                    </div>
                </div>

                {/* Step indicator pills */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className={`h-1.5 rounded-full transition-all ${step >= 1 ? "bg-[#ff4d2d]" : "bg-gray-200"}`} />
                    <div className={`h-1.5 rounded-full transition-all ${step >= 2 ? "bg-[#ff4d2d]" : "bg-gray-200"}`} />
                    <div className={`h-1.5 rounded-full transition-all ${step >= 3 ? "bg-[#ff4d2d]" : "bg-gray-200"}`} />
                </div>

                {/* Notifications */}
                {err && (
                    <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200/80 flex items-start gap-2.5 text-red-700 text-xs sm:text-sm animate-fade-in">
                        <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                        <span className="flex-1 font-medium leading-relaxed">{err}</span>
                    </div>
                )}

                {successMsg && (
                    <div className="mb-4 p-3.5 rounded-xl bg-green-50 border border-green-200/80 flex items-center gap-2.5 text-green-700 text-xs sm:text-sm animate-fade-in">
                        <FiCheckCircle className="w-5 h-5 flex-shrink-0 text-green-500" />
                        <span className="font-semibold">{successMsg}</span>
                    </div>
                )}

                {/* =========================
                    STEP 1 - EMAIL
                ========================= */}
                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <p className="text-sm text-gray-600 mb-2">
                            Enter the email associated with your account and we&apos;ll send you a 4-digit verification code.
                        </p>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <FiMail className="w-4 h-4" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setErr("");
                                    }}
                                    placeholder="Enter your email"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none transition focus:border-[#ff4d2d] focus:ring-4 focus:ring-[#ff4d2d]/10 bg-gray-50/50 hover:bg-white focus:bg-white text-gray-800"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#ff4d2d] to-[#ff6342] text-white py-3 rounded-xl font-bold text-sm tracking-wide shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/35 active:scale-[0.99] transition duration-150 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    <span>Sending OTP...</span>
                                </>
                            ) : (
                                <span>Send Verification Code</span>
                            )}
                        </button>
                    </form>
                )}

                {/* =========================
                    STEP 2 - OTP
                ========================= */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <p className="text-sm text-gray-600 mb-2">
                            Enter the 4-digit code sent to <strong className="text-gray-900">{email}</strong>.
                        </p>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                                Verification Code
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <FiKey className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    maxLength="4"
                                    value={otp}
                                    onChange={(e) => {
                                        setOtp(e.target.value.replace(/\D/g, ""));
                                        setErr("");
                                    }}
                                    placeholder="4-digit code"
                                    autoFocus
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm tracking-widest text-center font-bold text-lg outline-none transition focus:border-[#ff4d2d] focus:ring-4 focus:ring-[#ff4d2d]/10 bg-gray-50/50 hover:bg-white focus:bg-white text-gray-800"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#ff4d2d] to-[#ff6342] text-white py-3 rounded-xl font-bold text-sm tracking-wide shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/35 active:scale-[0.99] transition duration-150 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <span>Verify Code</span>
                            )}
                        </button>

                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={loading}
                                className="text-xs font-semibold text-[#ff4d2d] hover:underline"
                            >
                                Didn&apos;t get code? Resend OTP
                            </button>
                        </div>
                    </form>
                )}

                {/* =========================
                    STEP 3 - RESET PASSWORD
                ========================= */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <p className="text-sm text-gray-600 mb-2">
                            Enter your new password below.
                        </p>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                                New Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <FiLock className="w-4 h-4" />
                                </div>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter at least 6 characters"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none transition focus:border-[#ff4d2d] focus:ring-4 focus:ring-[#ff4d2d]/10 bg-gray-50/50 hover:bg-white focus:bg-white text-gray-800"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <FiLock className="w-4 h-4" />
                                </div>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter your new password"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none transition focus:border-[#ff4d2d] focus:ring-4 focus:ring-[#ff4d2d]/10 bg-gray-50/50 hover:bg-white focus:bg-white text-gray-800"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#ff4d2d] to-[#ff6342] text-white py-3 rounded-xl font-bold text-sm tracking-wide shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/35 active:scale-[0.99] transition duration-150 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    <span>Resetting Password...</span>
                                </>
                            ) : (
                                <span>Reset Password & Finish</span>
                            )}
                        </button>
                    </form>
                )}

                {/* Back to sign in link */}
                <div className="mt-6 text-center text-xs text-gray-500">
                    Remembered your password?{" "}
                    <Link
                        to="/signin"
                        className="font-bold text-[#ff4d2d] hover:underline"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;