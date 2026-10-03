import express from "express";

import isAuth from "../middlewares/isAuth.js";

import {
    placeOrder,
    getMyOrders,
    updateOrderStatus,
    getDeliveryRequests,
    acceptDelivery,
    markDelivery,
    verifyDeliveryOtp
} from "../controllers/order.controller.js";

const orderRouter = express.Router();

orderRouter.post(
    "/place-order",
    isAuth,
    placeOrder
);

orderRouter.get(
    "/my-orders",
    isAuth,
    getMyOrders
);

orderRouter.put(
    "/update-status/:orderId/:shopId",
    isAuth,
    updateOrderStatus
);

orderRouter.get(
    "/delivery-requests",
    isAuth,
    getDeliveryRequests
);

orderRouter.put(
    "/accept-delivery/:assignmentId",
    isAuth,
    acceptDelivery
);

orderRouter.put(
    "/mark-delivery/:assignmentId",
    isAuth,
    markDelivery
);

orderRouter.put(
    "/verify-delivery-otp/:assignmentId",
    isAuth,
    verifyDeliveryOtp
);

export default orderRouter;