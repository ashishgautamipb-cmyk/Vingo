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


const orderRouter =
    express.Router();


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


// OWNER STATUS UPDATE
orderRouter.put(
    "/update-status/:orderId/:shopId",
    isAuth,
    updateOrderStatus
);


// DELIVERY REQUESTS
orderRouter.get(
    "/delivery-requests",
    isAuth,
    getDeliveryRequests
);


// ACCEPT DELIVERY
orderRouter.put(
    "/accept-delivery/:assignmentId",
    isAuth,
    acceptDelivery
);


// DELIVERY BOY -> MARK DELIVERY
orderRouter.put(
    "/mark-delivery/:assignmentId",
    isAuth,
    markDelivery
);


// DELIVERY BOY -> VERIFY CUSTOMER OTP
orderRouter.put(
    "/verify-delivery-otp/:assignmentId",
    isAuth,
    verifyDeliveryOtp
);


export default orderRouter;