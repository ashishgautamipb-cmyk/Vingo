import { useState } from "react";
import { FaEyeSlash, FaEye, FaStore, FaMotorcycle, FaUser, FaStar } from "react-icons/fa";
import { FiMail, FiLock, FiPhone, FiAlertCircle, FiCheckCircle, FiArrowRight, FiZap } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

function SignUp() {
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState("user");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mobile, setMobile] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [err, setErr] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const navigate = useNavigate();
    const dispatch = useDispatch();

    // =====================================
    // NORMAL SIGN UP
    // =====================================
    const handleSignUp = async (e) => {
        if (e) e.preventDefault();
        setErr("");
        setSuccessMsg("");

        const cleanEmail = email.trim().toLowerCase();
        const cleanName = fullName.trim();
        const cleanMobile = mobile.trim();

        if (!cleanName || !cleanEmail || !password || !cleanMobile) {
            setErr("Please fill all required fields");
            return;
        }

        if (password.length < 6) {
            setErr("Password must be at least 6 characters long");
            return;
        }

        if (cleanMobile.length !== 10) {
            setErr("Mobile number must be exactly 10 digits");
            return;
        }

        try {
            setLoading(true);

            const result = await axios.post(
                `${serverUrl}/api/auth/signup`,
                {
                    fullName: cleanName,
                    email: cleanEmail,
                    password,
                    mobile: cleanMobile,
                    role,
                },
                {
                    withCredentials: true,
                }
            );

            if (result.data?.token) {
                localStorage.setItem("token", result.data.token);
            }

            const newUser = result.data?.user || result.data;
            dispatch(setUserData(newUser));

            setSuccessMsg("Account created successfully! Redirecting...");

            setTimeout(() => {
                navigate("/");
            }, 500);
        } catch (error) {
            console.error("SIGNUP ERROR:", error);

            if (error.code === "ERR_NETWORK") {
                setErr(
                    `Cannot connect to backend server (${serverUrl}). Check if backend is running.`
                );
            } else {
                setErr(
                    error.response?.data?.message ||
                        "Something went wrong while creating your account"
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // =====================================
    // GOOGLE SIGN UP / AUTH
    // =====================================
    const handleGoogleAuth = async () => {
        setErr("");
        setSuccessMsg("");

        try {
            setGoogleLoading(true);

            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const googleUser = result.user;

            const googleData = {
                fullName: googleUser.displayName || fullName || "User",
                email: googleUser.email?.toLowerCase(),
                role: role,
                mobile: mobile || googleUser.phoneNumber || "",
            };

            const response = await axios.post(
                `${serverUrl}/api/auth/google-auth`,
                googleData,
                {
                    withCredentials: true,
                }
            );

            if (response.data?.token) {
                localStorage.setItem("token", response.data.token);
            }

            const newUser = response.data?.user || response.data;
            dispatch(setUserData(newUser));

            setSuccessMsg("Google sign-up successful! Redirecting...");

            setTimeout(() => {
                navigate("/");
            }, 500);
        } catch (error) {
            console.error("GOOGLE AUTH ERROR:", error);

            if (error.code === "auth/popup-closed-by-user") {
                setErr("Google sign-up was cancelled.");
            } else if (error.code === "ERR_NETWORK") {
                setErr(
                    `Cannot connect to backend server (${serverUrl}). Check backend status.`
                );
            } else {
                setErr(
                    error.response?.data?.message ||
                        error.message ||
                        "Something went wrong with Google authentication"
                );
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#faf4ee] via-[#f7ebe1] to-[#fceee7] p-4 sm:p-6 lg:p-10">
            {/* Main Container Card */}
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl shadow-orange-950/10 border border-orange-100/80 overflow-hidden flex flex-col lg:flex-row min-h-[680px]">
                
                {/* LEFT HERO PANEL (Desktop & Tablet) */}
                <div className="hidden lg:flex lg:w-5/12 relative bg-gray-950 flex-col justify-between p-10 overflow-hidden">
                    <img
                        src="/food-hero.jpg"
                        alt="Delicious Gourmet Food Spread"
                        className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105 transition-transform duration-1000 ease-out hover:scale-110"
                    />

                    {/* Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-950/70 to-transparent" />

                    {/* Brand */}
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff4d2d] to-[#ff7d59] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-600/40">
                                V
                            </div>
                            <span className="text-2xl font-black text-white tracking-tight">
                                Vingo<span className="text-[#ff4d2d]">.</span>
                            </span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-xs font-semibold">
                            <FiZap className="text-[#ffb703]" /> Live Orders
                        </div>
                    </div>

                    {/* Bottom Content */}
                    <div className="relative z-10 space-y-4">
                        <div className="inline-flex items-center gap-1 text-[#ffb703] text-sm font-bold bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full">
                            <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                            <span className="text-white text-xs ml-1.5 font-medium">Over 50,000+ Happy Customers</span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-white leading-tight">
                            Join the fastest growing<br />
                            <span className="bg-gradient-to-r from-[#ff6b4a] to-[#ffb703] bg-clip-text text-transparent">
                                food delivery community.
                            </span>
                        </h2>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Sign up today and get exclusive discounts, lightning-quick delivery, and delicious dining choices.
                        </p>
                    </div>
                </div>

                {/* RIGHT SIGN UP FORM PANEL */}
                <div className="w-full lg:w-7/12 flex flex-col justify-center p-7 sm:p-10 lg:p-12 relative bg-white">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="lg:hidden flex items-center gap-2.5 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ff4d2d] to-[#ff7d59] flex items-center justify-center text-white font-black text-lg shadow-md shadow-orange-500/30">
                                V
                            </div>
                            <span className="text-2xl font-black text-gray-900 tracking-tight">
                                Vingo<span className="text-[#ff4d2d]">.</span>
                            </span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                            Create your Account
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Choose your role and enter your details to get started
                        </p>
                    </div>

                    {/* Alerts */}
                    {err && (
                        <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200/90 flex items-start gap-2.5 text-red-700 text-xs sm:text-sm animate-fade-in">
                            <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                            <span className="flex-1 font-medium leading-relaxed">{err}</span>
                        </div>
                    )}

                    {successMsg && (
                        <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-800 text-xs sm:text-sm animate-fade-in">
                            <FiCheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                            <span className="font-semibold">{successMsg}</span>
                        </div>
                    )}

                    {/* ROLE SELECTOR */}
                    <div className="mb-4">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                            Select Account Type
                        </label>
                        <div className="grid grid-cols-3 gap-2.5">
                            {[
                                { id: "user", label: "Customer", icon: FaUser },
                                { id: "owner", label: "Restaurant", icon: FaStore },
                                { id: "deliveryBoy", label: "Delivery Partner", icon: FaMotorcycle },
                            ].map((item) => {
                                const Icon = item.icon;
                                const isSelected = role === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setRole(item.id)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                                            isSelected
                                                ? "border-[#ff4d2d] bg-orange-50/90 text-[#ff4d2d] shadow-sm ring-2 ring-[#ff4d2d]/20 font-bold"
                                                : "border-gray-200 bg-gray-50/60 hover:bg-white text-gray-600 font-medium"
                                        }`}
                                    >
                                        <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? "text-[#ff4d2d]" : "text-gray-400"}`} />
                                        <span className="text-xs truncate">{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSignUp} className="space-y-3.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {/* FULL NAME */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <FaUser className="w-3.5 h-3.5" />
                                    </div>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Full Name"
                                        required
                                        className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 border border-gray-200 rounded-2xl text-sm outline-none transition duration-150 focus:border-[#ff4d2d] focus:ring-4 focus:ring-[#ff4d2d]/10 bg-gray-50/70 hover:bg-white focus:bg-white text-gray-800 placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            {/* MOBILE */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                                    Mobile Number
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <FiPhone className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="tel"
                                        maxLength="10"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                                        placeholder="10 Digits"
                                        required
                                        className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 border border-gray-200 rounded-2xl text-sm outline-none transition duration-150 focus:border-[#ff4d2d] focus:ring-4 focus:ring-[#ff4d2d]/10 bg-gray-50/70 hover:bg-white focus:bg-white text-gray-800 placeholder-gray-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* EMAIL */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <FiMail className="w-4 h-4" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    autoComplete="email"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-2xl text-sm outline-none transition duration-150 focus:border-[#ff4d2d] focus:ring-4 focus:ring-[#ff4d2d]/10 bg-gray-50/70 hover:bg-white focus:bg-white text-gray-800 placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                                Password (Min. 6 chars)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <FiLock className="w-4 h-4" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create password"
                                    autoComplete="new-password"
                                    required
                                    className="w-full pl-10 pr-11 py-2.5 sm:py-3 border border-gray-200 rounded-2xl text-sm outline-none transition duration-150 focus:border-[#ff4d2d] focus:ring-4 focus:ring-[#ff4d2d]/10 bg-gray-50/70 hover:bg-white focus:bg-white text-gray-800 placeholder-gray-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer transition"
                                >
                                    {showPassword ? (
                                        <FaEyeSlash className="w-4 h-4" />
                                    ) : (
                                        <FaEye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* SUBMIT BUTTON */}
                        <button
                            type="submit"
                            disabled={loading || googleLoading}
                            className="w-full mt-2 bg-gradient-to-r from-[#ff4d2d] via-[#ff5a3b] to-[#ff6b4a] text-white py-3.5 rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/35 hover:brightness-105 active:scale-[0.99] transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    <span>Creating Account...</span>
                                </>
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <FiArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* DIVIDER */}
                    <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs uppercase font-semibold text-gray-400 tracking-wider">
                            or
                        </span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* GOOGLE SIGN UP */}
                    <button
                        type="button"
                        onClick={handleGoogleAuth}
                        disabled={googleLoading || loading}
                        className="w-full bg-white border border-gray-200 py-2.5 sm:py-3 rounded-2xl flex items-center justify-center gap-3 font-semibold text-sm text-gray-700 shadow-sm hover:bg-gray-50/80 hover:border-gray-300 transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <FcGoogle className="w-5 h-5 flex-shrink-0" />
                        <span>
                            {googleLoading ? "Connecting with Google..." : "Continue with Google"}
                        </span>
                    </button>

                    {/* SIGN IN LINK */}
                    <div className="mt-5 text-center text-sm text-gray-600">
                        Already have an account?{" "}
                        <Link
                            to="/signin"
                            className="font-bold text-[#ff4d2d] hover:text-[#d8381a] hover:underline transition ml-1 inline-flex items-center gap-1"
                        >
                            <span>Sign in instead</span>
                            <FiArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUp;