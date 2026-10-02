import express from "express";

import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";

import {
    createShop,
    editShop,
    getMyShop,
    getShops
} from "../controllers/shop.controllers.js";

const shopRouter =
    express.Router();


// ==========================================
// CREATE SHOP
// ==========================================

shopRouter.post(
    "/create",
    isAuth,
    upload.single("image"),
    createShop
);


// ==========================================
// EDIT SHOP
// ==========================================

shopRouter.put(
    "/edit/:shopId",
    isAuth,
    upload.single("image"),
    editShop
);


// ==========================================
// GET MY SHOP
// ==========================================

shopRouter.get(
    "/get-my",
    isAuth,
    getMyShop
);


// ==========================================
// GET ALL SHOPS
// ==========================================

shopRouter.get(
    "/get-shops",
    isAuth,
    getShops
);


export default shopRouter;