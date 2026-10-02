import Shop from "../models/shop.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import DeliveryAssignment from "../models/deliveryAssignment.model.js";

// ======================================================
// HELPER FUNCTIONS
// ======================================================

const getDistanceInMeters = (
    latitude1,
    longitude1,
    latitude2,
    longitude2
) => {
    const earthRadius = 6371000;

    const lat1 =
        Number(latitude1) * Math.PI / 180;

    const lat2 =
        Number(latitude2) * Math.PI / 180;

    const differenceLatitude =
        (Number(latitude2) - Number(latitude1)) *
        Math.PI / 180;

    const differenceLongitude =
        (Number(longitude2) - Number(longitude1)) *
        Math.PI / 180;

    const a =
        Math.sin(differenceLatitude / 2) *
        Math.sin(differenceLatitude / 2) +
        Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(differenceLongitude / 2) *
        Math.sin(differenceLongitude / 2);

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return earthRadius * c;
};

const generateOtp = () => {
    return Math.floor(
        100000 + Math.random() * 900000
    ).toString();
};


// ======================================================
// POPULATE ORDER
// ======================================================

const populateOrder = async (order) => {

    await order.populate(
        "user",
        "fullName email mobile location"
    );

    await order.populate(
        "shopOrders.shop"
    );

    await order.populate(
        "shopOrders.shopOrderItems.item"
    );

    await order.populate({
        path:
            "shopOrders.deliveryAssignment",

        populate: [
            {
                path:
                    "assignedTo",

                select:
                    "fullName email mobile location"
            },
            {
                path:
                    "broadcastedTo",

                select:
                    "fullName email mobile location"
            }
        ]
    });

    return order;
};


// ======================================================
// FIND CURRENT ASSIGNMENT
// ======================================================
//
// This is the important fix.
//
// If frontend sends an old assignmentId,
// we first inspect that assignment.
//
// If it doesn't belong to the current delivery boy,
// we use its order + shopOrderId to find the
// currently assigned assignment for that delivery boy.
//
// This prevents:
//
// OLD ASSIGNMENT ID
//       ↓
// assignedTo mismatch
//       ↓
// "This delivery is not assigned to you"
//
// ======================================================

const findCurrentAssignedAssignment = async (
    assignmentId,
    deliveryBoyId
) => {

    let originalAssignment = null;

    if (assignmentId) {

        originalAssignment =
            await DeliveryAssignment.findById(
                assignmentId
            );
    }

    // ==================================================
    // CASE 1:
    // Assignment ID is already correct
    // ==================================================

    if (
        originalAssignment &&
        originalAssignment.assignedTo &&
        String(
            originalAssignment.assignedTo
        ) === String(deliveryBoyId) &&
        originalAssignment.status === "assigned"
    ) {

        return originalAssignment;
    }


    // ==================================================
    // CASE 2:
    // Frontend has stale assignment ID
    // ==================================================

    if (originalAssignment) {

        console.log(
            "Stale assignment detected."
        );

        console.log(
            "Old assignment:",
            originalAssignment._id.toString()
        );

        console.log(
            "Old assignedTo:",
            originalAssignment.assignedTo
                ? originalAssignment.assignedTo.toString()
                : null
        );

        console.log(
            "Current delivery boy:",
            deliveryBoyId.toString()
        );


        const currentAssignment =
            await DeliveryAssignment.findOne({

                order:
                    originalAssignment.order,

                shop:
                    originalAssignment.shop,

                shopOrderId:
                    originalAssignment.shopOrderId,

                assignedTo:
                    deliveryBoyId,

                status:
                    "assigned"

            });

        if (currentAssignment) {

            console.log(
                "CURRENT ASSIGNMENT FOUND:",
                currentAssignment._id.toString()
            );

            return currentAssignment;
        }
    }


    // ==================================================
    // CASE 3:
    // If assignment ID itself is unavailable,
    // try finding any active assignment for
    // this delivery boy.
    // ==================================================

    if (!originalAssignment) {

        const currentAssignment =
            await DeliveryAssignment.findOne({

                assignedTo:
                    deliveryBoyId,

                status:
                    "assigned"

            }).sort({
                createdAt: -1
            });

        if (currentAssignment) {

            return currentAssignment;
        }
    }


    return null;
};


// ======================================================
// PLACE ORDER
// ======================================================

export const placeOrder = async (req, res) => {

    try {

        const userId = req.userId;

        const {
            items,
            paymentMethod,
            deliveryAddress
        } = req.body;


        if (
            !items ||
            items.length === 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }


        if (!deliveryAddress) {

            return res.status(400).json({
                success: false,
                message:
                    "Delivery address is required"
            });
        }


        const shopGroups = {};


        items.forEach((item) => {

            const shopId = item.shop;

            if (!shopGroups[shopId]) {
                shopGroups[shopId] = [];
            }

            shopGroups[shopId].push(item);
        });


        const shopOrders = [];

        let totalAmount = 0;


        for (
            const shopId in shopGroups
        ) {

            const shop =
                await Shop.findById(
                    shopId
                );


            if (!shop) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Shop not found"
                });
            }


            let subtotal = 0;


            const shopOrderItems =
                shopGroups[shopId].map(
                    (item) => {

                        const itemTotal =
                            Number(item.price) *
                            Number(item.quantity);

                        subtotal +=
                            itemTotal;


                        return {

                            item:
                                item._id,

                            price:
                                Number(
                                    item.price
                                ),

                            quantity:
                                Number(
                                    item.quantity
                                )
                        };
                    }
                );


            totalAmount += subtotal;


            shopOrders.push({

                shop:
                    shop._id,

                owner:
                    shop.owner,

                subtotal,

                status:
                    "pending",

                shopOrderItems
            });
        }


        const deliveryFee =
            totalAmount > 500
                ? 40
                : 0;


        totalAmount +=
            deliveryFee;


        const order =
            await Order.create({

                user:
                    userId,

                paymentMethod,

                deliveryAddress: {

                    text:
                        deliveryAddress.text,

                    latitude:
                        Number(
                            deliveryAddress.latitude
                        ),

                    longitude:
                        Number(
                            deliveryAddress.longitude
                        )
                },

                shopOrders,

                totalAmount,

                deliveryFee
            });


        await populateOrder(order);


        return res.status(201).json({

            success:
                true,

            message:
                "Order placed successfully",

            order
        });

    } catch (error) {

        console.error(
            "Place order error:",
            error
        );

        return res.status(500).json({

            success:
                false,

            message:
                `Place order error: ${error.message}`
        });
    }
};


// ======================================================
// GET MY ORDERS
// ======================================================

export const getMyOrders = async (
    req,
    res
) => {

    try {

        const userId =
            req.userId;


        const user =
            await User.findById(
                userId
            );


        if (!user) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "User not found"
            });
        }


        let orders = [];


        // ==================================================
        // NORMAL USER
        // ==================================================

        if (
            user.role === "user"
        ) {

            orders =
                await Order.find({

                    user:
                        userId

                })
                    .populate(
                        "user",
                        "fullName email mobile location"
                    )
                    .populate(
                        "shopOrders.shop"
                    )
                    .populate(
                        "shopOrders.shopOrderItems.item"
                    )
                    .populate({

                        path:
                            "shopOrders.deliveryAssignment",

                        populate: [

                            {
                                path:
                                    "assignedTo",

                                select:
                                    "fullName email mobile location"
                            },

                            {
                                path:
                                    "broadcastedTo",

                                select:
                                    "fullName email mobile location"
                            }
                        ]
                    })
                    .sort({
                        createdAt:
                            -1
                    });
        }


        // ==================================================
        // OWNER
        // ==================================================

        else if (
            user.role === "owner"
        ) {

            const allOrders =
                await Order.find({

                    "shopOrders.owner":
                        userId

                })
                    .populate(
                        "user",
                        "fullName email mobile location"
                    )
                    .populate(
                        "shopOrders.shop"
                    )
                    .populate(
                        "shopOrders.shopOrderItems.item"
                    )
                    .populate({

                        path:
                            "shopOrders.deliveryAssignment",

                        populate: [

                            {
                                path:
                                    "assignedTo",

                                select:
                                    "fullName email mobile location"
                            },

                            {
                                path:
                                    "broadcastedTo",

                                select:
                                    "fullName email mobile location"
                            }
                        ]
                    })
                    .sort({
                        createdAt:
                            -1
                    });


            orders =
                allOrders.map(
                    (order) => {

                        const orderObject =
                            order.toObject();


                        orderObject.shopOrders =
                            orderObject.shopOrders.filter(
                                (shopOrder) =>
                                    String(
                                        shopOrder.owner
                                    ) ===
                                    String(
                                        userId
                                    )
                            );


                        return orderObject;
                    }
                );
        }


        // ==================================================
        // DELIVERY BOY
        // ==================================================

        else if (
            user.role ===
            "deliveryBoy"
        ) {

            const assignments =
                await DeliveryAssignment.find({

                    $or: [

                        {
                            assignedTo:
                                userId,

                            status:
                                "assigned"
                        },

                        {
                            assignedTo:
                                userId,

                            status:
                                "completed"
                        },

                        {
                            broadcastedTo:
                                userId,

                            status:
                                "broadcasted"
                        }
                    ]
                });


            const orderIds =
                assignments.map(
                    (assignment) =>
                        assignment.order
                );


            if (
                orderIds.length > 0
            ) {

                orders =
                    await Order.find({

                        _id: {
                            $in:
                                orderIds
                        }

                    })
                        .populate({

                            path:
                                "user",

                            select:
                                "fullName email mobile location"
                        })
                        .populate(
                            "shopOrders.shop"
                        )
                        .populate(
                            "shopOrders.shopOrderItems.item"
                        )
                        .populate({

                            path:
                                "shopOrders.deliveryAssignment",

                            populate: [

                                {
                                    path:
                                        "assignedTo",

                                    select:
                                        "fullName email mobile location"
                                },

                                {
                                    path:
                                        "broadcastedTo",

                                    select:
                                        "fullName email mobile location"
                                }
                            ]
                        })
                        .sort({
                            createdAt:
                                -1
                        });
            }
        }


        return res.status(200).json({

            success:
                true,

            orders
        });

    } catch (error) {

        console.error(
            "Get my orders error:",
            error
        );

        return res.status(500).json({

            success:
                false,

            message:
                `Get my orders error: ${error.message}`
        });
    }
};


// ======================================================
// UPDATE ORDER STATUS
// OWNER
// ======================================================

export const updateOrderStatus = async (
    req,
    res
) => {

    try {

        const {
            orderId,
            shopId
        } = req.params;

        const {
            status
        } = req.body;


        console.log(
            "UPDATE ORDER STATUS:",
            {
                orderId,
                shopId,
                status,
                ownerId:
                    req.userId
            }
        );


        const allowedStatuses = [

            "pending",

            "preparing",

            "out for delivery"

        ];


        if (
            !allowedStatuses.includes(
                status
            )
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Invalid order status"
            });
        }


        const order =
            await Order.findById(
                orderId
            );


        if (!order) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Order not found"
            });
        }


        const shopOrder =
            order.shopOrders.find(
                (item) => {

                    const itemShopId =
                        item.shop?._id ||
                        item.shop;

                    return (
                        String(
                            itemShopId
                        ) ===
                        String(
                            shopId
                        )
                    );
                }
            );


        if (!shopOrder) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Shop order not found"
            });
        }


        if (
            String(
                shopOrder.owner
            ) !==
            String(
                req.userId
            )
        ) {

            return res.status(403).json({

                success:
                    false,

                message:
                    "You are not the owner of this shop order"
            });
        }


        // ==================================================
        // DELIVERED ORDER CANNOT GO BACK
        // ==================================================

        if (
            shopOrder.status ===
            "delivered"
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Delivered order cannot be changed"
            });
        }


        // ==================================================
        // OUT FOR DELIVERY
        // ==================================================

        if (
            status ===
            "out for delivery"
        ) {

            let existingAssignment =
                null;


            // ==================================================
            // FIRST:
            // USE ASSIGNMENT STORED IN SHOP ORDER
            // ==================================================

            if (
                shopOrder.deliveryAssignment
            ) {

                existingAssignment =
                    await DeliveryAssignment.findOne({

                        _id:
                            shopOrder.deliveryAssignment,

                        status: {
                            $in: [
                                "broadcasted",
                                "assigned"
                            ]
                        }
                    });
            }


            // ==================================================
            // SECOND:
            // SEARCH BY ORDER + SHOP + SHOP ORDER
            //
            // This handles stale assignment reference.
            // ==================================================

            if (
                !existingAssignment
            ) {

                existingAssignment =
                    await DeliveryAssignment.findOne({

                        order:
                            order._id,

                        shop:
                            shopOrder.shop,

                        shopOrderId:
                            shopOrder._id,

                        status: {
                            $in: [
                                "broadcasted",
                                "assigned"
                            ]
                        }

                    }).sort({
                        createdAt:
                            -1
                    });
            }


            // ==================================================
            // ACTIVE ASSIGNMENT ALREADY EXISTS
            // ==================================================

            if (
                existingAssignment
            ) {

                console.log(
                    "REUSING EXISTING ASSIGNMENT:",
                    existingAssignment._id.toString()
                );


                shopOrder.deliveryAssignment =
                    existingAssignment._id;

                shopOrder.status =
                    "out for delivery";


                await order.save();


                await populateOrder(
                    order
                );


                const updatedShopOrder =
                    order.shopOrders.find(
                        (item) =>
                            String(
                                item._id
                            ) ===
                            String(
                                shopOrder._id
                            )
                    );


                return res.status(200).json({

                    success:
                        true,

                    message:
                        existingAssignment.status ===
                        "assigned"

                            ? "Delivery is already assigned"

                            : "Delivery request is already active",

                    order,

                    shopOrder:
                        updatedShopOrder,

                    assignment:
                        existingAssignment
                });
            }


            // ==================================================
            // NO ACTIVE ASSIGNMENT
            //
            // Expire old assignments.
            // ==================================================

            await DeliveryAssignment.updateMany(

                {

                    order:
                        order._id,

                    shop:
                        shopOrder.shop,

                    shopOrderId:
                        shopOrder._id,

                    status: {
                        $in: [
                            "broadcasted",
                            "assigned"
                        ]
                    }

                },

                {

                    $set: {

                        status:
                            "expired"
                    }
                }
            );


            // ==================================================
            // FIND DELIVERY BOYS
            // ==================================================

            const deliveryBoys =
                await User.find({

                    role:
                        "deliveryBoy",

                    "location.type":
                        "Point"

                });


            const availableBoys =
                [];


            const customerLatitude =
                Number(
                    order
                        .deliveryAddress
                        ?.latitude
                );


            const customerLongitude =
                Number(
                    order
                        .deliveryAddress
                        ?.longitude
                );


            if (
                !Number.isFinite(
                    customerLatitude
                ) ||
                !Number.isFinite(
                    customerLongitude
                )
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Customer delivery location is invalid"
                });
            }


            // ==================================================
            // FIND BOYS WITHIN 5 KM
            // ==================================================

            for (
                const boy of deliveryBoys
            ) {

                const coordinates =
                    boy.location
                        ?.coordinates;


                if (
                    !coordinates ||
                    coordinates.length !== 2
                ) {
                    continue;
                }


                const boyLongitude =
                    Number(
                        coordinates[0]
                    );


                const boyLatitude =
                    Number(
                        coordinates[1]
                    );


                if (
                    !Number.isFinite(
                        boyLatitude
                    ) ||
                    !Number.isFinite(
                        boyLongitude
                    )
                ) {
                    continue;
                }


                if (
                    boyLatitude === 0 &&
                    boyLongitude === 0
                ) {
                    continue;
                }


                const distance =
                    getDistanceInMeters(

                        boyLatitude,

                        boyLongitude,

                        customerLatitude,

                        customerLongitude
                    );


                console.log(
                    "Delivery boy distance:",
                    {
                        name:
                            boy.fullName,

                        distance:
                            Math.round(
                                distance
                            )
                    }
                );


                if (
                    distance <= 5000
                ) {

                    availableBoys.push(
                        boy._id
                    );
                }
            }


            // ==================================================
            // CREATE ASSIGNMENT
            // ==================================================

            const assignment =
                await DeliveryAssignment.create({

                    order:
                        order._id,

                    shop:
                        shopOrder.shop,

                    shopOrderId:
                        shopOrder._id,

                    broadcastedTo:
                        availableBoys,

                    assignedTo:
                        null,

                    status:
                        "broadcasted",

                    acceptedAt:
                        null
                });


            // ==================================================
            // SAVE ASSIGNMENT
            // ==================================================

            shopOrder.deliveryAssignment =
                assignment._id;

            shopOrder.status =
                "out for delivery";


            shopOrder.deliveryOtp =
                null;

            shopOrder.deliveryOtpExpiresAt =
                null;

            shopOrder.deliveryOtpVerified =
                false;

            shopOrder.deliveredAt =
                null;


            await order.save();


            await populateOrder(
                order
            );


            const updatedShopOrder =
                order.shopOrders.find(
                    (item) =>
                        String(
                            item._id
                        ) ===
                        String(
                            shopOrder._id
                        )
                );


            return res.status(200).json({

                success:
                    true,

                message:
                    availableBoys.length > 0

                        ? "Order is out for delivery"

                        : "Order is out for delivery, but no delivery boy is currently within 5 km",

                order,

                shopOrder:
                    updatedShopOrder,

                assignment,

                availableBoys
            });
        }


        // ==================================================
        // PENDING / PREPARING
        // ==================================================

        if (
            status === "pending" ||
            status === "preparing"
        ) {

            await DeliveryAssignment.updateMany(

                {

                    order:
                        order._id,

                    shop:
                        shopOrder.shop,

                    shopOrderId:
                        shopOrder._id,

                    status: {
                        $in: [
                            "broadcasted",
                            "assigned"
                        ]
                    }

                },

                {

                    $set: {

                        status:
                            "expired"
                    }
                }
            );


            shopOrder.deliveryAssignment =
                null;

            shopOrder.deliveryOtp =
                null;

            shopOrder.deliveryOtpExpiresAt =
                null;

            shopOrder.deliveryOtpVerified =
                false;

            shopOrder.deliveredAt =
                null;
        }


        shopOrder.status =
            status;


        await order.save();


        await populateOrder(
            order
        );


        const updatedShopOrder =
            order.shopOrders.find(
                (item) =>
                    String(
                        item._id
                    ) ===
                    String(
                        shopOrder._id
                    )
            );


        return res.status(200).json({

            success:
                true,

            message:
                "Order status updated successfully",

            order,

            shopOrder:
                updatedShopOrder
        });

    } catch (error) {

        console.error(
            "Update order status error:",
            error
        );

        return res.status(500).json({

            success:
                false,

            message:
                `Update order status error: ${error.message}`
        });
    }
};


// ======================================================
// GET DELIVERY REQUESTS
// ======================================================

export const getDeliveryRequests = async (
    req,
    res
) => {

    try {

        const deliveryBoyId =
            req.userId;


        const deliveryBoy =
            await User.findById(
                deliveryBoyId
            );


        if (!deliveryBoy) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Delivery boy not found"
            });
        }


        if (
            deliveryBoy.role !==
            "deliveryBoy"
        ) {

            return res.status(403).json({

                success:
                    false,

                message:
                    "Only delivery boys can access delivery requests"
            });
        }


        const coordinates =
            deliveryBoy.location
                ?.coordinates;


        if (
            !coordinates ||
            coordinates.length !== 2
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Delivery boy location is not available"
            });
        }


        const deliveryBoyLongitude =
            Number(
                coordinates[0]
            );


        const deliveryBoyLatitude =
            Number(
                coordinates[1]
            );


        const assignments =
            await DeliveryAssignment.find({

                status:
                    "broadcasted",

                broadcastedTo:
                    deliveryBoyId

            })
                .populate(
                    "shop"
                )
                .populate({

                    path:
                        "order",

                    populate: [

                        {
                            path:
                                "user",

                            select:
                                "fullName email mobile location"
                        },

                        {
                            path:
                                "shopOrders.shop"
                        },

                        {
                            path:
                                "shopOrders.shopOrderItems.item"
                        }
                    ]
                });


        const requests = [];


        assignments.forEach(
            (assignment) => {

                const order =
                    assignment.order;


                if (!order) {
                    return;
                }


                const customerLatitude =
                    Number(
                        order
                            .deliveryAddress
                            ?.latitude
                    );


                const customerLongitude =
                    Number(
                        order
                            .deliveryAddress
                            ?.longitude
                    );


                if (
                    !Number.isFinite(
                        customerLatitude
                    ) ||
                    !Number.isFinite(
                        customerLongitude
                    )
                ) {
                    return;
                }


                const distance =
                    getDistanceInMeters(

                        deliveryBoyLatitude,

                        deliveryBoyLongitude,

                        customerLatitude,

                        customerLongitude
                    );


                if (
                    distance <= 5000
                ) {

                    const shopOrder =
                        order.shopOrders.find(
                            (item) =>
                                String(
                                    item._id
                                ) ===
                                String(
                                    assignment.shopOrderId
                                )
                        );


                    if (!shopOrder) {
                        return;
                    }


                    requests.push({

                        ...assignment.toObject(),

                        distance:
                            Math.round(
                                distance
                            ),

                        shopOrder
                    });
                }
            }
        );


        return res.status(200).json({

            success:
                true,

            requests
        });

    } catch (error) {

        console.error(
            "Get delivery requests error:",
            error
        );

        return res.status(500).json({

            success:
                false,

            message:
                `Get delivery requests error: ${error.message}`
        });
    }
};


// ======================================================
// ACCEPT DELIVERY
// ======================================================

export const acceptDelivery = async (
    req,
    res
) => {

    try {

        const {
            assignmentId
        } = req.params;


        const deliveryBoyId =
            req.userId;


        const deliveryBoy =
            await User.findById(
                deliveryBoyId
            );


        if (!deliveryBoy) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Delivery boy not found"
            });
        }


        if (
            deliveryBoy.role !==
            "deliveryBoy"
        ) {

            return res.status(403).json({

                success:
                    false,

                message:
                    "Only delivery boys can accept delivery"
            });
        }


        const coordinates =
            deliveryBoy.location
                ?.coordinates;


        if (
            !coordinates ||
            coordinates.length !== 2
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Delivery boy location is not available"
            });
        }


        const assignment =
            await DeliveryAssignment.findOne({

                _id:
                    assignmentId,

                status:
                    "broadcasted",

                broadcastedTo:
                    deliveryBoyId

            });


        if (!assignment) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Delivery request is no longer available"
            });
        }


        const order =
            await Order.findById(
                assignment.order
            );


        if (!order) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Order not found"
            });
        }


        const customerLatitude =
            Number(
                order
                    .deliveryAddress
                    ?.latitude
            );


        const customerLongitude =
            Number(
                order
                    .deliveryAddress
                    ?.longitude
            );


        const deliveryBoyLongitude =
            Number(
                coordinates[0]
            );


        const deliveryBoyLatitude =
            Number(
                coordinates[1]
            );


        const distance =
            getDistanceInMeters(

                deliveryBoyLatitude,

                deliveryBoyLongitude,

                customerLatitude,

                customerLongitude
            );


        if (
            distance > 5000
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    `You are ${Math.round(distance)} meters away from the customer`
            });
        }


        const shopOrder =
            order.shopOrders.find(
                (item) =>
                    String(
                        item._id
                    ) ===
                    String(
                        assignment.shopOrderId
                    )
            );


        if (!shopOrder) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Shop order not found"
            });
        }


        // ==================================================
        // ASSIGN DELIVERY BOY
        // ==================================================

        assignment.assignedTo =
            deliveryBoyId;

        assignment.status =
            "assigned";

        assignment.acceptedAt =
            new Date();

        assignment.broadcastedTo =
            [];


        await assignment.save();


        // ==================================================
        // UPDATE SHOP ORDER
        // ==================================================

        shopOrder.deliveryAssignment =
            assignment._id;

        shopOrder.status =
            "out for delivery";

        shopOrder.deliveryOtp =
            null;

        shopOrder.deliveryOtpExpiresAt =
            null;

        shopOrder.deliveryOtpVerified =
            false;

        shopOrder.deliveredAt =
            null;


        await order.save();


        await assignment.populate(
            "assignedTo",
            "fullName email mobile location"
        );

        await assignment.populate(
            "shop"
        );


        return res.status(200).json({

            success:
                true,

            message:
                "Delivery accepted successfully",

            assignment,

            distance:
                Math.round(
                    distance
                )
        });

    } catch (error) {

        console.error(
            "Accept delivery error:",
            error
        );

        return res.status(500).json({

            success:
                false,

            message:
                `Accept delivery error: ${error.message}`
        });
    }
};


// ======================================================
// MARK DELIVERY
// GENERATE OTP
// ======================================================

export const markDelivery = async (
    req,
    res
) => {

    try {

        const {
            assignmentId
        } = req.params;


        const deliveryBoyId =
            req.userId;


        if (!assignmentId) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Assignment ID is required"
            });
        }


        // ==================================================
        // IMPORTANT FIX:
        // FIND CURRENT ASSIGNMENT
        // ==================================================

        const assignment =
            await findCurrentAssignedAssignment(
                assignmentId,
                deliveryBoyId
            );


        if (!assignment) {

            return res.status(403).json({

                success:
                    false,

                message:
                    "This delivery is not currently assigned to you"
            });
        }


        console.log(
            "MARK DELIVERY:",
            {

                assignmentId:
                    assignment._id.toString(),

                assignedTo:
                    assignment.assignedTo?.toString(),

                currentDeliveryBoy:
                    deliveryBoyId.toString(),

                status:
                    assignment.status
            }
        );


        // ==================================================
        // FIND ORDER
        // ==================================================

        const order =
            await Order.findById(
                assignment.order
            );


        if (!order) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Order not found"
            });
        }


        // ==================================================
        // FIND SHOP ORDER
        // ==================================================

        const shopOrder =
            order.shopOrders.find(
                (item) =>
                    String(
                        item._id
                    ) ===
                    String(
                        assignment.shopOrderId
                    )
            );


        if (!shopOrder) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Shop order not found"
            });
        }


        // ==================================================
        // MAKE SURE SHOP ORDER USES CURRENT ASSIGNMENT
        // ==================================================

        if (
            !shopOrder.deliveryAssignment ||
            String(
                shopOrder.deliveryAssignment
            ) !==
            String(
                assignment._id
            )
        ) {

            // Repair stale assignment reference.
            shopOrder.deliveryAssignment =
                assignment._id;

            await order.save();
        }


        // ==================================================
        // CHECK STATUS
        // ==================================================

        if (
            shopOrder.status !==
            "out for delivery"
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "This order is not out for delivery"
            });
        }


        // ==================================================
        // DELIVERY BOY
        // ==================================================

        const deliveryBoy =
            await User.findById(
                deliveryBoyId
            );


        if (!deliveryBoy) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Delivery boy not found"
            });
        }


        const coordinates =
            deliveryBoy.location
                ?.coordinates;


        if (
            !coordinates ||
            coordinates.length !== 2
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Delivery boy location is unavailable"
            });
        }


        const deliveryBoyLongitude =
            Number(
                coordinates[0]
            );


        const deliveryBoyLatitude =
            Number(
                coordinates[1]
            );


        // ==================================================
        // CUSTOMER LOCATION
        // ==================================================

        const customerLatitude =
            Number(
                order
                    .deliveryAddress
                    ?.latitude
            );


        const customerLongitude =
            Number(
                order
                    .deliveryAddress
                    ?.longitude
            );


        // ==================================================
        // DISTANCE
        // ==================================================

        const distance =
            getDistanceInMeters(

                deliveryBoyLatitude,

                deliveryBoyLongitude,

                customerLatitude,

                customerLongitude
            );


        console.log(
            "MARK DELIVERY DISTANCE:",
            Math.round(distance),
            "meters"
        );


        // ==================================================
        // MUST BE WITHIN 200 METERS
        // ==================================================

        if (
            distance > 200
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    `You are ${Math.round(distance)} meters away from the customer. Reach within 200 meters to generate OTP.`,

                distance:
                    Math.round(
                        distance
                    ),

                within200m:
                    false
            });
        }


        // ==================================================
        // OTP ALREADY GENERATED
        // ==================================================

        if (
            shopOrder.deliveryOtp &&
            shopOrder.deliveryOtpExpiresAt &&
            new Date(
                shopOrder.deliveryOtpExpiresAt
            ) > new Date()
        ) {

            return res.status(200).json({

                success:
                    true,

                message:
                    "Delivery OTP has already been generated. Ask the customer for the OTP.",

                otpGenerated:
                    true,

                assignmentId:
                    assignment._id,

                distance:
                    Math.round(
                        distance
                    ),

                within200m:
                    true
            });
        }


        // ==================================================
        // GENERATE OTP
        // ==================================================

        const otp =
            generateOtp();


        shopOrder.deliveryOtp =
            otp;


        shopOrder.deliveryOtpExpiresAt =
            new Date(
                Date.now() +
                10 * 60 * 1000
            );


        shopOrder.deliveryOtpVerified =
            false;


        await order.save();


        console.log(
            "DELIVERY OTP GENERATED:",
            otp
        );


        return res.status(200).json({

            success:
                true,

            message:
                "Delivery OTP generated. Ask the customer for the OTP.",

            otpGenerated:
                true,

            assignmentId:
                assignment._id,

            expiresAt:
                shopOrder.deliveryOtpExpiresAt,

            distance:
                Math.round(
                    distance
                ),

            within200m:
                true
        });

    } catch (error) {

        console.error(
            "Mark delivery error:",
            error
        );

        return res.status(500).json({

            success:
                false,

            message:
                `Mark delivery error: ${error.message}`
        });
    }
};


// ======================================================
// VERIFY DELIVERY OTP
// ======================================================

export const verifyDeliveryOtp = async (
    req,
    res
) => {

    try {

        const {
            assignmentId
        } = req.params;


        const {
            otp
        } = req.body;


        const deliveryBoyId =
            req.userId;


        if (!assignmentId) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Assignment ID is required"
            });
        }


        if (!otp) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "OTP is required"
            });
        }


        console.log(
            "================================="
        );

        console.log(
            "VERIFY OTP REQUEST"
        );

        console.log(
            "Frontend assignment ID:",
            assignmentId
        );

        console.log(
            "Logged in delivery boy:",
            deliveryBoyId.toString()
        );


        // ==================================================
        // IMPORTANT FIX:
        // FIND CURRENT ASSIGNMENT
        // ==================================================

        const assignment =
            await findCurrentAssignedAssignment(
                assignmentId,
                deliveryBoyId
            );


        if (!assignment) {

            console.log(
                "NO CURRENT ASSIGNMENT FOUND"
            );


            return res.status(403).json({

                success:
                    false,

                message:
                    "This delivery is not currently assigned to you"
            });
        }


        console.log(
            "CURRENT ASSIGNMENT:",
            {

                assignmentId:
                    assignment._id.toString(),

                assignedTo:
                    assignment.assignedTo?.toString(),

                deliveryBoy:
                    deliveryBoyId.toString(),

                status:
                    assignment.status,

                order:
                    assignment.order.toString(),

                shopOrderId:
                    assignment.shopOrderId.toString()
            }
        );


        // ==================================================
        // CHECK ASSIGNMENT STATUS
        // ==================================================

        if (
            assignment.status !==
            "assigned"
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    `Delivery assignment is ${assignment.status}`
            });
        }


        // ==================================================
        // FIND ORDER
        // ==================================================

        const order =
            await Order.findById(
                assignment.order
            );


        if (!order) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Order not found"
            });
        }


        // ==================================================
        // FIND SHOP ORDER
        // ==================================================

        const shopOrder =
            order.shopOrders.find(
                (item) =>
                    String(
                        item._id
                    ) ===
                    String(
                        assignment.shopOrderId
                    )
            );


        if (!shopOrder) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Shop order not found"
            });
        }


        // ==================================================
        // IMPORTANT:
        // REPAIR SHOP ORDER ASSIGNMENT REFERENCE
        // ==================================================

        if (
            !shopOrder.deliveryAssignment ||
            String(
                shopOrder.deliveryAssignment
            ) !==
            String(
                assignment._id
            )
        ) {

            console.log(
                "Repairing shop order assignment reference"
            );


            shopOrder.deliveryAssignment =
                assignment._id;
        }


        // ==================================================
        // CHECK SHOP ORDER STATUS
        // ==================================================

        if (
            shopOrder.status !==
            "out for delivery"
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "This order is not out for delivery"
            });
        }


        // ==================================================
        // CHECK OTP EXISTS
        // ==================================================

        if (
            !shopOrder.deliveryOtp
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Delivery OTP has not been generated"
            });
        }


        // ==================================================
        // CHECK OTP EXPIRY
        // ==================================================

        if (
            !shopOrder.deliveryOtpExpiresAt ||
            new Date(
                shopOrder.deliveryOtpExpiresAt
            ) < new Date()
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Delivery OTP has expired"
            });
        }


        // ==================================================
        // CHECK OTP
        // ==================================================

        console.log(
            "OTP FROM DELIVERY BOY:",
            String(otp).trim()
        );

        console.log(
            "OTP STORED IN ORDER:",
            String(
                shopOrder.deliveryOtp
            ).trim()
        );


        if (
            String(otp).trim() !==
            String(
                shopOrder.deliveryOtp
            ).trim()
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Invalid delivery OTP"
            });
        }


        // ==================================================
        // OTP CORRECT
        // ==================================================

        console.log(
            "OTP VERIFIED SUCCESSFULLY"
        );


        // ==================================================
        // MARK SHOP ORDER DELIVERED
        // ==================================================

        shopOrder.status =
            "delivered";


        shopOrder.deliveryOtpVerified =
            true;


        shopOrder.deliveredAt =
            new Date();


        // ==================================================
        // CLEAR OTP
        // ==================================================

        shopOrder.deliveryOtp =
            null;


        shopOrder.deliveryOtpExpiresAt =
            null;


        // ==================================================
        // COMPLETE ASSIGNMENT
        // ==================================================

        assignment.status =
            "completed";


        // Keep assignedTo for history.

        assignment.broadcastedTo =
            [];


        await assignment.save();

        await order.save();


        // ==================================================
        // POPULATE EVERYTHING
        // ==================================================

        await populateOrder(
            order
        );


        console.log(
            "DELIVERY COMPLETED:",
            assignment._id.toString()
        );


        console.log(
            "================================="
        );


        return res.status(200).json({

            success:
                true,

            message:
                "Delivery verified successfully. Order marked as delivered.",

            status:
                "delivered",

            assignmentId:
                assignment._id,

            deliveredAt:
                shopOrder.deliveredAt,

            order
        });

    } catch (error) {

        console.error(
            "Verify delivery OTP error:",
            error
        );

        return res.status(500).json({

            success:
                false,

            message:
                `Verify delivery OTP error: ${error.message}`
        });
    }
};