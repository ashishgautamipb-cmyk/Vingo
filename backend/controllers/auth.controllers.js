import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/token.js";
import { sendOtpMail } from "../utils/mail.js";


// ======================================================
// COOKIE OPTIONS
// ======================================================

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};


// ======================================================
// SIGN UP
// ======================================================

export const signUp = async (req, res) => {
    try {
        const {
            fullName,
            email,
            password,
            mobile,
            role
        } = req.body;

        let existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "user already exist"
            });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({
                message: "password must be at least 6 characters"
            });
        }

        if (!mobile || mobile.length < 10) {
            return res.status(400).json({
                message: "mobile no. should be of 10 digits"
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const user = await User.create({
            fullName,
            email,
            role,
            mobile,
            password: hashedPassword
        });

        const token = await genToken(user._id);

        // Set cookie
        res.cookie(
            "token",
            token,
            cookieOptions
        );

        // Don't send password to frontend
        const safeUser = user.toObject();

        delete safeUser.password;

        return res.status(201).json({
            user: safeUser,
            token
        });

    } catch (error) {
        console.error("SIGNUP ERROR:", error);

        return res.status(500).json({
            message: error.message
        });
    }
};


// ======================================================
// SIGN IN
// ======================================================

export const signIn = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "user does not exist"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "incorrect password"
            });
        }

        const token = await genToken(user._id);

        // Set cookie
        res.cookie(
            "token",
            token,
            cookieOptions
        );

        // Don't send password to frontend
        const safeUser = user.toObject();

        delete safeUser.password;

        return res.status(200).json({
            user: safeUser,
            token
        });

    } catch (error) {
        console.error("SIGN IN ERROR:", error);

        return res.status(500).json({
            message: `sign in error ${error.message}`
        });
    }
};


// ======================================================
// SIGN OUT
// ======================================================

export const signOut = async (req, res) => {
    try {

        res.clearCookie(
            "token",
            cookieOptions
        );

        return res.status(200).json({
            message: "log out successfully"
        });

    } catch (error) {

        return res.status(500).json({
            message: `log out error ${error.message}`
        });
    }
};


// ======================================================
// SEND OTP
// ======================================================

export const sendOtp = async (req, res) => {
    try {

        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "user does not exist."
            });
        }

        const otp = Math.floor(
            1000 + Math.random() * 9000
        ).toString();

        user.resetOtp = otp;

        user.OtpExpires =
            Date.now() + 5 * 60 * 1000;

        user.isOtpVerified = false;

        await user.save();

        await sendOtpMail(
            email,
            otp
        );

        return res.status(200).json({
            message: "otp sent successfully"
        });

    } catch (error) {

        return res.status(500).json({
            message: `send otp error ${error.message}`
        });
    }
};


// ======================================================
// VERIFY OTP
// ======================================================

export const verifyOtp = async (req, res) => {
    try {

        const {
            email,
            otp
        } = req.body;

        const user = await User.findOne({ email });

        if (
            !user ||
            user.resetOtp !== otp ||
            user.OtpExpires < Date.now()
        ) {
            return res.status(400).json({
                message: "invalid or expired OTP"
            });
        }

        user.isOtpVerified = true;

        user.resetOtp = undefined;

        user.OtpExpires = undefined;

        await user.save();

        return res.status(200).json({
            message: "otp verified successfully"
        });

    } catch (error) {

        return res.status(500).json({
            message: `verify otp error ${error.message}`
        });
    }
};


// ======================================================
// RESET PASSWORD
// ======================================================

export const resetPassword = async (req, res) => {
    try {

        const {
            email,
            newPassword
        } = req.body;

        const user = await User.findOne({ email });

        if (
            !user ||
            !user.isOtpVerified
        ) {
            return res.status(400).json({
                message: "OTP verification required"
            });
        }

        if (
            !newPassword ||
            newPassword.length < 6
        ) {
            return res.status(400).json({
                message: "password must be at least 6 characters"
            });
        }

        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                10
            );

        user.password = hashedPassword;

        user.isOtpVerified = false;

        await user.save();

        return res.status(200).json({
            message: "password reset successfully"
        });

    } catch (error) {

        return res.status(500).json({
            message: `reset password error ${error.message}`
        });
    }
};


// ======================================================
// GOOGLE AUTH
// ======================================================

export const googleAuth = async (req, res) => {
    try {

        const {
            fullName,
            email,
            mobile,
            role
        } = req.body;

        let user = await User.findOne({
            email
        });

        if (!user) {

            user = await User.create({
                fullName,
                email,
                mobile,
                role
            });

        } else {

            // Update missing information if available
            if (!user.fullName && fullName) {
                user.fullName = fullName;
            }

            if (!user.mobile && mobile) {
                user.mobile = mobile;
            }

            if (!user.role && role) {
                user.role = role;
            }

            await user.save();
        }

        const token =
            await genToken(user._id);

        // Set cookie
        res.cookie(
            "token",
            token,
            cookieOptions
        );

        // Don't send password
        const safeUser = user.toObject();

        delete safeUser.password;

        return res.status(200).json({
            user: safeUser,
            token
        });

    } catch (error) {

        console.error(
            "GOOGLE AUTH ERROR:",
            error
        );

        return res.status(500).json({
            message: `google auth error ${error.message}`
        });
    }
};