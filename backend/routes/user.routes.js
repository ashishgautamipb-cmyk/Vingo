import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
    getCurrentUser,
    updateUserLocation
} from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.get(
    "/current-user",
    isAuth,
    getCurrentUser
);

userRouter.put(
    "/update-location",
    isAuth,
    updateUserLocation
);

export default userRouter;