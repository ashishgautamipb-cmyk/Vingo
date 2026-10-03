import { useState } from "react";

import {
    FaEyeSlash,
    FaEye
} from "react-icons/fa";

import {
    FcGoogle
} from "react-icons/fc";

import {
    useNavigate
} from "react-router-dom";

import axios from "axios";

import {
    serverUrl
} from "../App";

import {
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";

import {
    auth
} from "../../firebase";

import {
    useDispatch,
    useSelector
} from "react-redux";

import {
    setUserData,
    setCurrentCity
} from "../redux/userSlice";


function SignIn() {

    const navigate = useNavigate();

    const dispatch = useDispatch();

    const {
        currentCity
    } = useSelector(
        (state) => state.user
    );


    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [googleLoading, setGoogleLoading] =
        useState(false);

    const [err, setErr] =
        useState("");


    // ======================================================
    // NORMAL SIGN IN
    // ======================================================

    const handleSignIn = async () => {

        setErr("");

        if (!email || !password) {
            setErr(
                "Please enter email and password"
            );

            return;
        }

        try {

            setLoading(true);

            const result =
                await axios.post(
                    `${serverUrl}/api/auth/signin`,
                    {
                        email,
                        password
                    },
                    {
                        withCredentials: true
                    }
                );


            // Save bearer token
            if (result.data?.token) {

                localStorage.setItem(
                    "token",
                    result.data.token
                );
            }


            // Save user
            dispatch(
                setUserData(
                    result.data.user ||
                    result.data
                )
            );


            if (currentCity) {

                dispatch(
                    setCurrentCity(
                        currentCity
                    )
                );
            }


            alert(
                "Login successful"
            );

            navigate("/");


        } catch (error) {

            console.error(
                "SIGN IN ERROR:",
                error
            );

            setErr(
                error.response?.data?.message ||
                "Something went wrong while signing in"
            );

        } finally {

            setLoading(false);
        }
    };


    // ======================================================
    // GOOGLE AUTH
    // ======================================================

    const handleGoogleAuth = async () => {

        setErr("");

        const cityBeforeGoogle =
            currentCity ||
            localStorage.getItem("city") ||
            null;


        try {

            setGoogleLoading(true);

            const provider =
                new GoogleAuthProvider();


            const result =
                await signInWithPopup(
                    auth,
                    provider
                );


            const response =
                await axios.post(
                    `${serverUrl}/api/auth/google-auth`,
                    {
                        email:
                            result.user.email,

                        fullName:
                            result.user.displayName ||
                            "",

                        mobile:
                            result.user.phoneNumber ||
                            "",

                        role: "user"
                    },
                    {
                        withCredentials: true
                    }
                );


            // Save bearer token
            if (response.data?.token) {

                localStorage.setItem(
                    "token",
                    response.data.token
                );
            }


            // Save user
            dispatch(
                setUserData(
                    response.data.user ||
                    response.data
                )
            );


            if (cityBeforeGoogle) {

                dispatch(
                    setCurrentCity(
                        cityBeforeGoogle
                    )
                );
            }


            alert(
                "Google authentication successful"
            );

            navigate("/");


        } catch (error) {

            console.error(
                "GOOGLE AUTH ERROR:",
                error
            );

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
        <div className="min-h-screen flex items-center justify-center bg-[#fff7f3] px-4">

            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-7">

                <h1 className="text-3xl font-bold text-center text-[#ff4d2d] mb-2">
                    Welcome Back
                </h1>

                <p className="text-center text-gray-500 mb-6">
                    Sign in to continue to Vingo
                </p>


                {err && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                        {err}
                    </div>
                )}


                {/* EMAIL */}

                <div className="mb-4">

                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                            setEmail(
                                e.target.value
                            )
                        }
                        placeholder="Enter your email"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-[#ff4d2d]"
                    />

                </div>


                {/* PASSWORD */}

                <div className="mb-5">

                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                setPassword(
                                    e.target.value
                                )
                            }
                            placeholder="Enter your password"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 outline-none focus:border-[#ff4d2d]"
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

                            {showPassword
                                ? <FaEyeSlash />
                                : <FaEye />
                            }

                        </button>

                    </div>

                </div>


                {/* SIGN IN */}

                <button
                    onClick={handleSignIn}
                    disabled={loading}
                    className="w-full bg-[#ff4d2d] text-white py-3 rounded-lg font-semibold hover:bg-[#e94325] transition disabled:opacity-60"
                >

                    {loading
                        ? "Signing in..."
                        : "Sign In"
                    }

                </button>


                {/* OR */}

                <div className="flex items-center gap-3 my-5">

                    <div className="flex-1 h-px bg-gray-200" />

                    <span className="text-sm text-gray-400">
                        OR
                    </span>

                    <div className="flex-1 h-px bg-gray-200" />

                </div>


                {/* GOOGLE */}

                <button
                    onClick={handleGoogleAuth}
                    disabled={googleLoading}
                    className="w-full border border-gray-300 py-3 rounded-lg flex items-center justify-center gap-3 font-medium hover:bg-gray-50 transition disabled:opacity-60"
                >

                    <FcGoogle size={22} />

                    {googleLoading
                        ? "Connecting..."
                        : "Continue with Google"
                    }

                </button>

            </div>

        </div>
    );
}


export default SignIn;