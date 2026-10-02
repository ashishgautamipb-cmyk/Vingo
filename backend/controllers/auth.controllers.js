import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import genToken from "../utils/token.js"
import { sendOtpMail } from "../utils/mail.js"

export const signUp = async (req, res) => {
    try {
        const { fullName, email, password, mobile, role } = req.body

        let existingUser = await User.findOne({ email })

        if (existingUser) {
            return res.status(400).json({
                message: "user already exist"
            })
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "password must be at least 6 characters"
            })
        }

        if (mobile.length < 10) {
            return res.status(400).json({
                message: "mobile no. should be of 10 digits"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            fullName,
            email,
            role,
            mobile,
            password: hashedPassword
        })

        const token = await genToken(user._id)

        res.cookie("token", token, {
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        })

        return res.status(201).json(user)

    } catch (error) {
        console.error("SIGNUP ERROR:", error)

        return res.status(500).json({
            message: error.message
        })
    }
}


export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({
                message: "user does not exist"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({
                message: "incorrect password"
            })
        }

        const token = await genToken(user._id)

        res.cookie("token", token, {
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        })

        return res.status(200).json(user)

    } catch (error) {
        return res.status(500).json({
            message: `sign in error ${error.message}`
        })
    }
}


export const signOut = async (req, res) => {
    try {
        res.clearCookie("token")

        return res.status(200).json({
            message: "log out successfully"
        })

    } catch (error) {
        return res.status(500).json({
            message: `sign out error ${error.message}`
        })
    }
}


export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({
                message: "user does not exist."
            })
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString()

        user.resetOtp = otp
        user.OtpExpires = Date.now() + 5 * 60 * 1000
        user.isOtpVerified = false

        await user.save()

        await sendOtpMail(email, otp)

        return res.status(200).json({
            message: "otp sent successfully"
        })

    } catch (error) {
        return res.status(500).json({
            message: `send otp error ${error.message}`
        })
    }
}


export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body

        const user = await User.findOne({ email })

        if (
            !user ||
            user.resetOtp !== otp ||
            user.OtpExpires < Date.now()
        ) {
            return res.status(400).json({
                message: "invalid or expired OTP"
            })
        }

        user.isOtpVerified = true
        user.resetOtp = undefined
        user.OtpExpires = undefined

        await user.save()

        return res.status(200).json({
            message: "otp verified successfully"
        })

    } catch (error) {
        return res.status(500).json({
            message: `verify otp error ${error.message}`
        })
    }
}


export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body

        const user = await User.findOne({ email })

        if (!user || !user.isOtpVerified) {
            return res.status(400).json({
                message: "OTP verification required"
            })
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "password must be at least 6 characters"
            })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        user.password = hashedPassword
        user.isOtpVerified = false

        await user.save()

        return res.status(200).json({
            message: "password reset successfully"
        })

    } catch (error) {
        return res.status(500).json({
            message: `reset password error ${error.message}`
        })
    }
}
export const googleAuth=async (req,res)=>{
    try{
        const {fullName,email,mobile,role}=req.body
        let user=await User.findOne({email})
        if(!user){
            user=await User.create({
                fullName,email,mobile,role
            })
        }
        const token = await genToken(user._id)
        res.cookie("token",token,{
            secure:false,
            sameSite:"strict",
            maxAge:7*24*60*60*1000,
            httpOnly:true
        })
        return res.status(200).json(user)
    }
    catch(error){
        return res.status(500).json(`google auth error`)

    }
}
