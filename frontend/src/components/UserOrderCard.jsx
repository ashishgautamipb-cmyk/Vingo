import React from "react";

import DeliveryTrackingMap
    from "./DeliveryTrackingMap";


const UserOrderCard = ({
    order
}) => {


    const getStatusStyle = (
        status
    ) => {

        if (
            status === "pending"
        ) {

            return "text-yellow-600 bg-yellow-50";

        }


        if (
            status === "preparing"
        ) {

            return "text-blue-600 bg-blue-50";

        }


        if (
            status === "out for delivery"
        ) {

            return "text-purple-600 bg-purple-50";

        }


        if (
            status === "delivered"
        ) {

            return "text-green-600 bg-green-50";

        }


        return "text-gray-600 bg-gray-50";

    };


    return (

        <div
            className="
                bg-white
                rounded-xl
                shadow-sm
                border
                border-gray-100
                p-4
            "
        >

            <div
                className="
                    flex
                    justify-between
                    items-center
                    border-b
                    pb-3
                "
            >

                <div>

                    <h2
                        className="
                            font-semibold
                            text-gray-800
                        "
                    >
                        Order #
                        {order._id?.slice(-6)}
                    </h2>


                    <p
                        className="
                            text-xs
                            text-gray-500
                        "
                    >
                        {new Date(
                            order.createdAt
                        ).toLocaleDateString()}
                    </p>

                </div>


                <div
                    className="
                        text-right
                    "
                >

                    <p
                        className="
                            text-xs
                            text-gray-500
                            uppercase
                        "
                    >
                        {order.paymentMethod}
                    </p>

                </div>

            </div>


            <div
                className="
                    mt-4
                    space-y-5
                "
            >

                {order.shopOrders?.map(
                    (shopOrder) => {

                        const assignment =
                            shopOrder.deliveryAssignment;


                        const deliveryBoy =
                            assignment?.assignedTo;


                        const customerPosition =
                            order.deliveryAddress
                                ?.latitude !== undefined &&
                            order.deliveryAddress
                                ?.longitude !== undefined

                                ? [
                                    Number(
                                        order.deliveryAddress.latitude
                                    ),

                                    Number(
                                        order.deliveryAddress.longitude
                                    )
                                ]

                                : null;


                        const deliveryBoyPosition =
                            deliveryBoy?.location
                                ?.coordinates
                                ?.length === 2

                                ? [
                                    Number(
                                        deliveryBoy.location.coordinates[1]
                                    ),

                                    Number(
                                        deliveryBoy.location.coordinates[0]
                                    )
                                ]

                                : null;


                        return (

                            <div
                                key={
                                    shopOrder._id
                                }
                                className="
                                    border-b
                                    pb-4
                                    last:border-b-0
                                "
                            >

                                <div
                                    className="
                                        flex
                                        justify-between
                                        items-center
                                        mb-3
                                    "
                                >

                                    <h3
                                        className="
                                            font-semibold
                                            text-gray-800
                                        "
                                    >
                                        {
                                            shopOrder
                                                .shop
                                                ?.name
                                        }
                                    </h3>


                                    <span
                                        className={`
                                            text-xs
                                            px-2
                                            py-1
                                            rounded-full
                                            font-medium
                                            ${getStatusStyle(
                                                shopOrder.status
                                            )}
                                        `}
                                    >
                                        {
                                            shopOrder.status
                                        }
                                    </span>

                                </div>


                                <div
                                    className="
                                        flex
                                        flex-wrap
                                        gap-3
                                    "
                                >

                                    {shopOrder
                                        .shopOrderItems
                                        ?.map(
                                            (
                                                orderItem
                                            ) => (

                                                <div
                                                    key={
                                                        orderItem._id
                                                    }
                                                    className="
                                                        w-[115px]
                                                        border
                                                        border-gray-300
                                                        rounded-lg
                                                        p-1.5
                                                    "
                                                >

                                                    <img
                                                        src={
                                                            orderItem
                                                                .item
                                                                ?.image
                                                        }
                                                        alt={
                                                            orderItem
                                                                .item
                                                                ?.name
                                                        }
                                                        className="
                                                            w-full
                                                            h-[80px]
                                                            object-cover
                                                            rounded-md
                                                        "
                                                    />


                                                    <p
                                                        className="
                                                            text-xs
                                                            font-medium
                                                            mt-1
                                                            truncate
                                                        "
                                                    >
                                                        {
                                                            orderItem
                                                                .item
                                                                ?.name
                                                        }
                                                    </p>


                                                    <p
                                                        className="
                                                            text-[10px]
                                                            text-gray-500
                                                        "
                                                    >
                                                        Qty:
                                                        {" "}
                                                        {
                                                            orderItem.quantity
                                                        }

                                                        {" "}x ₹

                                                        {
                                                            orderItem.price
                                                        }
                                                    </p>

                                                </div>

                                            )
                                        )}

                                </div>


                                <div
                                    className="
                                        flex
                                        justify-between
                                        mt-3
                                        text-sm
                                    "
                                >

                                    <span
                                        className="
                                            font-medium
                                        "
                                    >
                                        Subtotal
                                    </span>


                                    <span
                                        className="
                                            font-semibold
                                        "
                                    >
                                        ₹
                                        {
                                            shopOrder.subtotal
                                        }
                                    </span>

                                </div>


                                {/* =====================================
                                    DELIVERY BOY
                                ====================================== */}

                                {(
                                    shopOrder.status ===
                                    "out for delivery" ||
                                    shopOrder.status ===
                                    "delivered"
                                ) &&
                                    deliveryBoy && (

                                    <div
                                        className="
                                            mt-4
                                            bg-purple-50
                                            border
                                            border-purple-100
                                            rounded-xl
                                            p-3
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                items-center
                                                justify-between
                                                mb-2
                                            "
                                        >

                                            <h4
                                                className="
                                                    font-semibold
                                                    text-purple-800
                                                "
                                            >
                                                Delivery Partner
                                            </h4>


                                            <span
                                                className="
                                                    text-xs
                                                    px-2
                                                    py-1
                                                    rounded-full
                                                    bg-purple-100
                                                    text-purple-700
                                                "
                                            >
                                                {shopOrder.status ===
                                                "delivered"
                                                    ? "Delivered"
                                                    : "Assigned"}
                                            </span>

                                        </div>


                                        <div
                                            className="
                                                space-y-1
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    justify-between
                                                    gap-3
                                                "
                                            >

                                                <span
                                                    className="
                                                        text-xs
                                                        text-gray-500
                                                    "
                                                >
                                                    Name
                                                </span>


                                                <span
                                                    className="
                                                        text-sm
                                                        font-medium
                                                        text-gray-800
                                                    "
                                                >
                                                    {
                                                        deliveryBoy.fullName
                                                    }
                                                </span>

                                            </div>


                                            <div
                                                className="
                                                    flex
                                                    justify-between
                                                    gap-3
                                                "
                                            >

                                                <span
                                                    className="
                                                        text-xs
                                                        text-gray-500
                                                    "
                                                >
                                                    Mobile
                                                </span>


                                                <span
                                                    className="
                                                        text-sm
                                                        font-medium
                                                        text-gray-800
                                                    "
                                                >
                                                    {
                                                        deliveryBoy.mobile
                                                    }
                                                </span>

                                            </div>


                                            <div
                                                className="
                                                    flex
                                                    justify-between
                                                    gap-3
                                                "
                                            >

                                                <span
                                                    className="
                                                        text-xs
                                                        text-gray-500
                                                    "
                                                >
                                                    Email
                                                </span>


                                                <span
                                                    className="
                                                        text-sm
                                                        font-medium
                                                        text-gray-800
                                                        break-all
                                                        text-right
                                                    "
                                                >
                                                    {
                                                        deliveryBoy.email
                                                    }
                                                </span>

                                            </div>

                                        </div>


                                        {/* =================================
                                            OTP
                                        ================================== */}

                                        {shopOrder.status ===
                                            "out for delivery" &&
                                            shopOrder.deliveryOtp && (

                                            <div
                                                className="
                                                    mt-4
                                                    bg-white
                                                    border-2
                                                    border-purple-200
                                                    rounded-xl
                                                    p-4
                                                    text-center
                                                "
                                            >

                                                <p
                                                    className="
                                                        text-xs
                                                        text-gray-500
                                                    "
                                                >
                                                    Delivery OTP
                                                </p>


                                                <p
                                                    className="
                                                        text-3xl
                                                        font-bold
                                                        tracking-[8px]
                                                        text-[#ff4d2d]
                                                        mt-1
                                                    "
                                                >
                                                    {
                                                        shopOrder.deliveryOtp
                                                    }
                                                </p>


                                                <p
                                                    className="
                                                        text-xs
                                                        text-gray-500
                                                        mt-2
                                                    "
                                                >
                                                    Share this OTP with the
                                                    delivery partner only when
                                                    you receive your order.
                                                </p>

                                            </div>

                                        )}


                                        {/* =================================
                                            MAP
                                        ================================== */}

                                        {customerPosition &&
                                            deliveryBoyPosition && (

                                            <DeliveryTrackingMap
                                                customerPosition={
                                                    customerPosition
                                                }
                                                deliveryBoyPosition={
                                                    deliveryBoyPosition
                                                }
                                            />

                                        )}

                                    </div>

                                )}


                                {shopOrder.status ===
                                    "out for delivery" &&
                                    !deliveryBoy && (

                                    <div
                                        className="
                                            mt-4
                                            bg-yellow-50
                                            border
                                            border-yellow-100
                                            rounded-xl
                                            p-3
                                        "
                                    >

                                        <p
                                            className="
                                                text-sm
                                                font-medium
                                                text-yellow-700
                                            "
                                        >
                                            Finding a delivery partner...
                                        </p>


                                        <p
                                            className="
                                                text-xs
                                                text-yellow-600
                                                mt-1
                                            "
                                        >
                                            Your order is ready and we are
                                            assigning a delivery partner.
                                        </p>

                                    </div>

                                )}

                            </div>

                        );

                    }
                )}

            </div>


            <div
                className="
                    flex
                    justify-between
                    items-center
                    pt-3
                    border-t
                    mt-2
                "
            >

                <div>

                    <p
                        className="
                            text-xs
                            text-gray-500
                        "
                    >
                        Delivery Address
                    </p>


                    <p
                        className="
                            text-xs
                            text-gray-700
                        "
                    >
                        {
                            order.deliveryAddress?.text
                        }
                    </p>

                </div>


                <div
                    className="
                        text-right
                    "
                >

                    <p
                        className="
                            text-xs
                            text-gray-500
                        "
                    >
                        Total
                    </p>


                    <p
                        className="
                            font-bold
                            text-gray-800
                        "
                    >
                        ₹
                        {order.shopOrders?.reduce(
                            (
                                total,
                                shopOrder
                            ) =>
                                total +
                                Number(
                                    shopOrder.subtotal ||
                                    0
                                ),

                            0
                        )}
                    </p>

                </div>

            </div>

        </div>

    );

};


export default UserOrderCard;