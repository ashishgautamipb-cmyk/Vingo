import { useState } from "react";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";

import {
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";

import { auth } from "../../firebase";

import { useDispatch, useSelector } from "react-redux";

import {
    setUserData,
    setCurrentCity,
} from "../redux/userSlice";

function SignIn() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { currentCity } = useSelector(
        (state) => state.user
    );

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [err, setErr] = useState("");

    const handleSignIn = async () => {
        setErr("");

        if (!email || !password) {
            setErr("Please enter email and password");
            return;
        }

        try {
            setLoading(true);

            const result = await axios.post(
                `${serverUrl}/api/auth/signin`,
                {
                    email,
                    password,
                },
                {
                    withCredentials: true,
                }
            );

            dispatch(setUserData(result.data));

            if (currentCity) {
                dispatch(setCurrentCity(currentCity));
            }

            alert("Login successful");
            navigate("/");
        } catch (error) {
            setErr(
                error.response?.data?.message ||
                "Something went wrong while signing in"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setErr("");

        const cityBeforeGoogle =
            currentCity ||
            localStorage.getItem("city") ||
            null;

        try {
            setGoogleLoading(true);

            const provider = new GoogleAuthProvider();

            const result = await signInWithPopup(
                auth,
                provider
            );

            const response = await axios.post(
                `${serverUrl}/api/auth/google-auth`,
                {
                    email: result.user.email,
                },
                {
                    withCredentials: true,
                }
            );

            dispatch(setUserData(response.data));

            if (cityBeforeGoogle) {
                dispatch(
                    setCurrentCity(cityBeforeGoogle)
                );
            }

            alert("Google authentication successful");
            navigate("/");
        } catch (error) {
            setErr(
                error.response?.data?.message ||
                error.message ||
                "Something went wrong with Google authentication"
            );
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

                <h1 className="text-3xl font-bold text-center mb-2">
                    Welcome Back
                </h1>

                <p className="text-gray-500 text-center mb-8">
                    Sign in to your account
                </p>

                {err && (
                    <div className="bg-red-100 text-red-600 px-4 py-3 rounded-lg mb-4">
                        {err}
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                        Email
                    </label>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        placeholder="Enter your email"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
                    />
                </div>

                <div className="mb-3">
                    <label className="block text-sm font-medium mb-2">
                        Password
                    </label>

                    <div className="relative">
                        <input
                            type={
                                showPassword
                                    ? "text"
                                    : "password"
                            }
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="Enter your password"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 outline-none focus:border-orange-500"
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowPassword(
                                    !showPassword
                                )
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                            {showPassword ? (
                                <FaEyeSlash />
                            ) : (
                                <FaEye />
                            )}
                        </button>
                    </div>
                </div>

                <div className="text-right mb-6">
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/forgot-password")
                        }
                        className="text-orange-500 hover:underline text-sm"
                    >
                        Forgot Password?
                    </button>
                </div>

                <button
                    type="button"
                    onClick={handleSignIn}
                    disabled={loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                >
                    {loading
                        ? "Signing in..."
                        : "Sign In"}
                </button>

                <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-gray-300" />

                    <span className="text-gray-500 text-sm">
                        OR
                    </span>

                    <div className="flex-1 h-px bg-gray-300" />
                </div>

                <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={googleLoading}
                    className="w-full border border-gray-300 py-3 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition disabled:opacity-50"
                >
                    <FcGoogle size={22} />

                    {googleLoading
                        ? "Connecting..."
                        : "Continue with Google"}
                </button>

                <p className="text-center text-gray-500 mt-6">
                    Don't have an account?{" "}

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/signup")
                        }
                        className="text-orange-500 font-semibold hover:underline"
                    >
                        Sign Up
                    </button>
                </p>

            </div>
        </div>
    );
}

export default SignIn;