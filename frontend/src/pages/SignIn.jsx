import { useState } from "react";
import { FaEyeSlash, FaEye, FaStar } from "react-icons/fa";
import { FiMail, FiLock, FiAlertCircle, FiCheckCircle, FiArrowRight, FiZap } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { useDispatch, useSelector } from "react-redux";
import { setUserData, setCurrentCity } from "../redux/userSlice";

function SignIn() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { currentCity } = useSelector((state) => state.user);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [err, setErr] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // ======================================================
    // NORMAL SIGN IN
    // ======================================================
    const handleSignIn = async (e) => {
        if (e) e.preventDefault();

        setErr("");
        setSuccessMsg("");

        const cleanEmail = email.trim().toLowerCase();

        if (!cleanEmail || !password) {
            setErr("Please enter both email and password");
            return;
        }

        try {
            setLoading(true);

            const result = await axios.post(
                `${serverUrl}/api/auth/signin`,
                {
                    email: cleanEmail,
                    password: password,
                },
                {
                    withCredentials: true,
                }
            );

            // Save bearer token
            if (result.data?.token) {
                localStorage.setItem("token", result.data.token);
            }

            // Save user
            const loggedInUser = result.data.user || result.data;
            dispatch(setUserData(loggedInUser));

            if (currentCity) {
                dispatch(setCurrentCity(currentCity));
            }

            setSuccessMsg("Signed in successfully! Redirecting...");

            setTimeout(() => {
                navigate("/");
            }, 500);
        } catch (error) {
            console.error("SIGN IN ERROR:", error);

            if (error.code === "ERR_NETWORK") {
                setErr(
                    `Unable to connect to backend server (${serverUrl}). Please check if the server is running.`
                );
            } else {
                setErr(
                    error.response?.data?.message ||
                        "Invalid credentials or something went wrong while signing in"
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // ======================================================
    // GOOGLE AUTH
    // ======================================================
    const handleGoogleAuth = async () => {
        setErr("");
        setSuccessMsg("");

        const cityBeforeGoogle =
            currentCity || localStorage.getItem("city") || null;

        try {
            setGoogleLoading(true);

            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            const response = await axios.post(
                `${serverUrl}/api/auth/google-auth`,
                {
                    email: result.user.email?.toLowerCase(),
                    fullName: result.user.displayName || "Google User",
                    mobile: result.user.phoneNumber || "",
                    role: "user",
                },
                {
                    withCredentials: true,
                }
            );

            if (response.data?.token) {
                localStorage.setItem("token", response.data.token);
            }

            const loggedInUser = response.data.user || response.data;
            dispatch(setUserData(loggedInUser));

            if (cityBeforeGoogle) {
                dispatch(setCurrentCity(cityBeforeGoogle));
            }

            setSuccessMsg("Google authentication successful! Redirecting...");

            setTimeout(() => {
                navigate("/");
            }, 500);
        } catch (error) {
            console.error("GOOGLE AUTH ERROR:", error);

            if (error.code === "auth/popup-closed-by-user") {
                setErr("Google sign-in was cancelled.");
            } else if (error.code === "ERR_NETWORK") {
                setErr(
                    `Cannot connect to backend server (${serverUrl}). Ensure backend is active.`
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
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl shadow-orange-950/10 border border-orange-100/80 overflow-hidden flex flex-col lg:flex-row min-h-[640px]">
                
                {/* LEFT HERO / SHOWCASE PANEL (Desktop & Tablet) */}
                <div className="hidden lg:flex lg:w-1/2 relative bg-gray-950 flex-col justify-between p-10 overflow-hidden">
                    {/* Background Gourmet Food Image */}
                    <img
                        src="/food-hero.jpg"
                        alt="Delicious Gourmet Food Spread"
                        className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105 transition-transform duration-1000 ease-out hover:scale-110"
                    />

                    {/* Gradient Overlay for crisp readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-950/70 to-transparent" />

                    {/* Top Brand Tag */}
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
                            <FiZap className="text-[#ffb703]" /> 24/7 Delivery
                        </div>
                    </div>

                    {/* Bottom Floating Stats & Testimonials */}
                    <div className="relative z-10 space-y-5">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-1 text-[#ffb703] text-sm font-bold bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full">
                                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                                <span className="text-white text-xs ml-1.5 font-medium">4.9 / 5 Rating</span>
                            </div>
                            <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight">
                                Extraordinary food,<br />
                                <span className="bg-gradient-to-r from-[#ff6b4a] to-[#ffb703] bg-clip-text text-transparent">
                                    delivered fresh to you.
                                </span>
                            </h2>
                            <p className="text-gray-300 text-sm max-w-sm leading-relaxed">
                                Explore top-rated restaurants, track deliveries live, and indulge in your favorite flavors anytime.
                            </p>
                        </div>

                        {/* Glassmorphism Testimonial Card */}
                        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white shadow-xl flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ff4d2d] to-amber-400 flex items-center justify-center font-bold text-white text-sm flex-shrink-0 shadow-md">
                                AG
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-white/95 truncate">
                                    &ldquo;Super fast delivery and sizzling hot pizza every single time!&rdquo;
                                </p>
                                <p className="text-[11px] text-white/60 mt-0.5">
                                    Ashish G. • Verified Foodie
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIGN IN FORM PANEL */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center p-7 sm:p-10 lg:p-12 relative bg-white">
                    {/* Header */}
                    <div className="mb-7">
                        <div className="lg:hidden flex items-center gap-2.5 mb-5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ff4d2d] to-[#ff7d59] flex items-center justify-center text-white font-black text-lg shadow-md shadow-orange-500/30">
                                V
                            </div>
                            <span className="text-2xl font-black text-gray-900 tracking-tight">
                                Vingo<span className="text-[#ff4d2d]">.</span>
                            </span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                            Welcome Back
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Enter your credentials to access your Vingo account
                        </p>
                    </div>

                    {/* Alerts */}
                    {err && (
                        <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200/90 flex items-start gap-2.5 text-red-700 text-xs sm:text-sm animate-fade-in">
                            <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                            <span className="flex-1 font-medium leading-relaxed">{err}</span>
                        </div>
                    )}

                    {successMsg && (
                        <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-800 text-xs sm:text-sm animate-fade-in">
                            <FiCheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                            <span className="font-semibold">{successMsg}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSignIn} className="space-y-4">
                        {/* EMAIL */}
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
                                        if (err) setErr("");
                                    }}
                                    placeholder="Enter your email"
                                    autoComplete="email"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl text-sm outline-none transition duration-150 focus:border-[#ff4d2d] focus:ring-4 focus:ring-[#ff4d2d]/10 bg-gray-50/70 hover:bg-white focus:bg-white text-gray-800 placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                                    Password
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-xs font-semibold text-[#ff4d2d] hover:text-[#d8381a] transition hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <FiLock className="w-4 h-4" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (err) setErr("");
                                    }}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    required
                                    className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-2xl text-sm outline-none transition duration-150 focus:border-[#ff4d2d] focus:ring-4 focus:ring-[#ff4d2d]/10 bg-gray-50/70 hover:bg-white focus:bg-white text-gray-800 placeholder-gray-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer transition"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <FaEyeSlash className="w-4 h-4" />
                                    ) : (
                                        <FaEye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* REMEMBER ME */}
                        <div className="flex items-center pt-1">
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-600 select-none">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-[#ff4d2d] focus:ring-[#ff4d2d]/30 accent-[#ff4d2d] cursor-pointer"
                                />
                                <span>Remember me on this device</span>
                            </label>
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
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In to Vingo</span>
                                    <FiArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* DIVIDER */}
                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs uppercase font-semibold text-gray-400 tracking-wider">
                            or
                        </span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* GOOGLE SIGN IN */}
                    <button
                        type="button"
                        onClick={handleGoogleAuth}
                        disabled={googleLoading || loading}
                        className="w-full bg-white border border-gray-200 py-3 rounded-2xl flex items-center justify-center gap-3 font-semibold text-sm text-gray-700 shadow-sm hover:bg-gray-50/80 hover:border-gray-300 transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <FcGoogle className="w-5 h-5 flex-shrink-0" />
                        <span>
                            {googleLoading ? "Connecting with Google..." : "Continue with Google"}
                        </span>
                    </button>

                    {/* SIGN UP REDIRECT LINK */}
                    <div className="mt-8 text-center text-sm text-gray-600">
                        Don&apos;t have an account yet?{" "}
                        <Link
                            to="/signup"
                            className="font-bold text-[#ff4d2d] hover:text-[#d8381a] hover:underline transition ml-1 inline-flex items-center gap-1"
                        >
                            <span>Create an account</span>
                            <FiArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignIn;