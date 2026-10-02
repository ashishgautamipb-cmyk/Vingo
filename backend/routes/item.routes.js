import express from "express";

import isAuth from "../middlewares/isAuth.js";

import {
    addItem,
    editItem,
    deleteItem,
    getItemsByCity,
} from "../controllers/item.controllers.js";

import { upload } from "../middlewares/multer.js";

const itemRouter = express.Router();


// ==========================================
// GET ITEMS BY CITY
// ==========================================

itemRouter.get(
    "/get-items-by-city",
    getItemsByCity
);


// ==========================================
// ADD ITEM
// ==========================================

itemRouter.post(
    "/add-item",
    isAuth,
    upload.single("image"),
    addItem
);


// ==========================================
// EDIT ITEM
// ==========================================

itemRouter.post(
    "/edit-item/:itemId",
    isAuth,
    upload.single("image"),
    editItem
);


// ==========================================
// DELETE ITEM
// ==========================================

itemRouter.delete(
    "/delete-item/:itemId",
    isAuth,
    deleteItem
);


export default itemRouter;