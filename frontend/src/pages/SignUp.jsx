import React, { useState } from "react";
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

import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

function SignUp() {
  const primaryColor = "#ff4d2d";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";

  // ================================
  // STATES
  // ================================

  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");

  const [googleLoading, setGoogleLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [err, setErr] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // =====================================
  // NORMAL SIGN UP
  // =====================================

  const handleSignUp = async () => {
    setErr("");

    // Validation
    if (!fullName || !email || !password || !mobile) {
      setErr("Please fill all fields");
      return;
    }

    if (password.length < 6) {
      setErr("Password must be at least 6 characters");
      return;
    }

    if (mobile.length !== 10) {
      setErr("Mobile number must be 10 digits");
      return;
    }

    try {
      setLoading(true);

      const result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        {
          fullName,
          email,
          password,
          mobile,
          role,
        },
        {
          withCredentials: true,
        }
      );

      console.log("SIGNUP RESPONSE:", result.data);

      // =====================================
      // SAVE BEARER TOKEN
      // =====================================

      if (result.data?.token) {
        localStorage.setItem(
          "token",
          result.data.token
        );
      }

      // =====================================
      // SAVE USER DATA IN REDUX
      // =====================================

      dispatch(
        setUserData(
          result.data?.user || result.data
        )
      );

      alert("Account created successfully");

      // User is already logged in
      navigate("/");
    } catch (error) {
      console.log("SIGNUP ERROR:", error);

      console.log(
        "STATUS:",
        error.response?.status
      );

      console.log(
        "DATA:",
        error.response?.data
      );

      setErr(
        error.response?.data?.message ||
          "Something went wrong while creating account"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // GOOGLE SIGN UP / AUTH
  // =====================================

  const handleGoogleAuth = async () => {
    setErr("");

    // Mobile is required because backend needs it
    if (!mobile) {
      setErr("Mobile number is required");
      return;
    }

    if (mobile.length !== 10) {
      setErr("Mobile number must be 10 digits");
      return;
    }

    try {
      setGoogleLoading(true);

      // =====================================
      // GOOGLE PROVIDER
      // =====================================

      const provider = new GoogleAuthProvider();

      // Open Google popup
      const result = await signInWithPopup(
        auth,
        provider
      );

      console.log(
        "GOOGLE FIREBASE USER:",
        result.user
      );

      const googleUser = result.user;

      // =====================================
      // GOOGLE DATA
      // =====================================

      const googleData = {
        fullName: googleUser.displayName,
        email: googleUser.email,
        role: role,
        mobile: mobile,
      };

      console.log(
        "SENDING GOOGLE DATA:",
        googleData
      );

      // =====================================
      // SEND TO BACKEND
      // =====================================

      const response = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        googleData,
        {
          withCredentials: true,
        }
      );

      console.log(
        "GOOGLE BACKEND RESPONSE:",
        response.data
      );

      // =====================================
      // SAVE BEARER TOKEN
      // =====================================

      if (response.data?.token) {
        localStorage.setItem(
          "token",
          response.data.token
        );
      }

      // =====================================
      // SAVE USER DATA
      // =====================================

      dispatch(
        setUserData(
          response.data?.user ||
            response.data
        )
      );

      alert("Google authentication successful");

      navigate("/");
    } catch (error) {
      console.log(
        "GOOGLE AUTH ERROR:",
        error
      );

      console.log(
        "STATUS:",
        error.response?.status
      );

      console.log(
        "DATA:",
        error.response?.data
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

  // =====================================
  // UI
  // =====================================

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{
        backgroundColor: bgColor,
      }}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-8"
        style={{
          border: `1px solid ${borderColor}`,
        }}
      >

        {/* ================================
            HEADER
        ================================= */}

        <h1
          className="text-3xl font-bold mb-2"
          style={{
            color: primaryColor,
          }}
        >
          Vingo
        </h1>

        <p className="text-gray-600 mb-8">
          Create your account to get started
          with delicious food deliveries
        </p>

        {/* ================================
            FULL NAME
        ================================= */}

        <div className="mb-4">
          <label
            htmlFor="fullName"
            className="block text-gray-700 font-medium mb-1"
          >
            Full Name
          </label>

          <input
            id="fullName"
            type="text"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
            placeholder="Enter Your Full Name"
            value={fullName}
            onChange={(e) =>
              setFullName(e.target.value)
            }
          />
        </div>

        {/* ================================
            EMAIL
        ================================= */}

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 font-medium mb-1"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
            placeholder="Enter Your Email Id"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />
        </div>

        {/* ================================
            PASSWORD
        ================================= */}

        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-gray-700 font-medium mb-1"
          >
            Password
          </label>

          <div className="relative">
            <input
              id="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              className="w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:border-orange-500"
              placeholder="Enter Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              {showPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>
          </div>
        </div>

        {/* ================================
            MOBILE
        ================================= */}

        <div className="mb-4">
          <label
            htmlFor="mobile"
            className="block text-gray-700 font-medium mb-1"
          >
            Mobile
          </label>

          <input
            id="mobile"
            type="text"
            maxLength="10"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
            placeholder="Enter Mobile No."
            value={mobile}
            required
            onChange={(e) =>
              setMobile(
                e.target.value.replace(
                  /\D/g,
                  ""
                )
              )
            }
          />
        </div>

        {/* ================================
            ROLE
        ================================= */}

        <div className="mb-4">
          <label
            htmlFor="role"
            className="block text-gray-700 font-medium mb-1"
          >
            Role
          </label>

          <div className="flex gap-2">
            {[
              "user",
              "owner",
              "deliveryBoy",
            ].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className="flex-1 border rounded-lg px-3 py-2 text-center font-medium transition-colors cursor-pointer"
                style={
                  role === r
                    ? {
                        backgroundColor:
                          primaryColor,
                        color: "white",
                        border: `1px solid ${primaryColor}`,
                      }
                    : {
                        border: `1px solid ${primaryColor}`,
                        color: "#333",
                      }
                }
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* ================================
            ERROR
        ================================= */}

        {err && (
          <p className="text-red-500 text-center mb-3">
            {err}
          </p>
        )}

        {/* ================================
            SIGN UP
        ================================= */}

        <button
          type="button"
          onClick={handleSignUp}
          disabled={
            loading || googleLoading
          }
          className="w-full mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer disabled:opacity-50"
        >
          {loading
            ? "Creating Account..."
            : "Sign Up"}
        </button>

        {/* ================================
            GOOGLE
        ================================= */}

        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={
            loading || googleLoading
          }
          className="w-full mt-4 flex items-center gap-2 justify-center border rounded-lg px-4 py-2 transition duration-200 border-gray-200 hover:bg-gray-100 cursor-pointer disabled:opacity-50"
        >
          <FcGoogle size={20} />

          <span className="text-center">
            {googleLoading
              ? "Connecting to Google..."
              : "Sign Up with Google"}
          </span>
        </button>

        {/* ================================
            SIGN IN
        ================================= */}

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{" "}

          <span
            className="text-[#ff4d2d] hover:cursor-pointer font-medium"
            onClick={() =>
              navigate("/signin")
            }
          >
            Sign In
          </span>
        </p>

      </div>
    </div>
  );
}

export default SignUp;