import mongoose from "mongoose";

const shopOrderItemSchema = new mongoose.Schema(
    {
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            required: true
        },

        price: {
            type: Number,
            required: true
        },

        quantity: {
            type: Number,
            required: true
        }
    },
    { timestamps: true }
);


const shopOrderSchema = new mongoose.Schema(
    {
        shop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shop",
            required: true
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        subtotal: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: [
                "pending",
                "preparing",
                "out for delivery",
                "delivered"
            ],
            default: "pending"
        },

        deliveryAssignment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeliveryAssignment",
            default: null
        },

        // =========================================
        // DELIVERY OTP
        // =========================================

        deliveryOtp: {
            type: String,
            default: null
        },

        deliveryOtpExpiresAt: {
            type: Date,
            default: null
        },

        deliveryOtpVerified: {
            type: Boolean,
            default: false
        },

        deliveredAt: {
            type: Date,
            default: null
        },

        shopOrderItems: [
            shopOrderItemSchema
        ]
    },
    { timestamps: true }
);


const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        paymentMethod: {
            type: String,
            enum: ["cod", "online"],
            required: true
        },

        deliveryAddress: {
            text: {
                type: String,
                required: true
            },

            latitude: {
                type: Number,
                required: true
            },

            longitude: {
                type: Number,
                required: true
            }
        },

        shopOrders: [
            shopOrderSchema
        ],

        totalAmount: {
            type: Number
        },

        deliveryFee: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);


const Order = mongoose.model(
    "Order",
    orderSchema
);

export default Order;