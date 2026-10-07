import {
    useEffect,
    useState
} from "react";

import axios from "axios";

import { MdPhone } from "react-icons/md";

import { serverUrl } from "../App";


function OwnerOrderCard({
    order,
    onStatusUpdate
}) {

    const [
        updating,
        setUpdating
    ] = useState(false);

    const [
        availableBoys,
        setAvailableBoys
    ] = useState([]);


    const user =
        order.user;


    // =====================================================
    // HANDLE STATUS CHANGE
    // =====================================================

    const handleStatusChange = async (
        orderId,
        shopId,
        shopOrderId,
        status
    ) => {

        try {

            setUpdating(true);


            // =================================================
            // GET TOKEN
            // =================================================

            const token =
                localStorage.getItem("token");


            console.log(
                "Updating order:",
                {
                    orderId,
                    shopId,
                    shopOrderId,
                    status,
                    hasToken: !!token
                }
            );


            if (!orderId) {

                alert(
                    "Main Order ID is missing."
                );

                return;

            }


            if (!shopId) {

                alert(
                    "Shop ID is missing."
                );

                return;

            }


            if (!token) {

                alert(
                    "Your login session has expired. Please login again."
                );

                return;

            }


            // =================================================
            // UPDATE ORDER STATUS
            // =================================================

            const result =
                await axios.put(

                    `${serverUrl}/api/order/update-status/${orderId}/${shopId}`,

                    {
                        status
                    },

                    {
                        withCredentials: true,

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }

                );


            console.log(
                "Update status result:",
                result.data
            );


            // =================================================
            // OUT FOR DELIVERY
            // =================================================

            if (
                status ===
                "out for delivery"
            ) {

                setAvailableBoys(

                    result.data
                        .assignment
                        ?.broadcastedTo ||

                    result.data
                        .availableBoys ||

                    []

                );

            } else {

                setAvailableBoys([]);

            }


            // =================================================
            // UPDATE PARENT
            // =================================================

            onStatusUpdate(
                orderId,
                shopOrderId,
                status,
                result.data.shopOrder
            );


        } catch (error) {

            console.log(
                "Update status error:",
                error.response?.data ||
                error.message
            );


            alert(
                error.response?.data?.message ||
                "Failed to update status"
            );

        } finally {

            setUpdating(false);

        }

    };


    // =====================================================
    // KEEP DELIVERY BOYS IN SYNC
    // =====================================================

    useEffect(() => {

        const shopOrders =
            order.shopOrders || [];


        const outForDeliveryShopOrder =
            shopOrders.find(
                (shopOrder) =>
                    shopOrder.status ===
                    "out for delivery"
            );


        if (
            !outForDeliveryShopOrder
        ) {

            setAvailableBoys([]);

            return;

        }


        const assignment =
            outForDeliveryShopOrder
                .deliveryAssignment;


        if (
            assignment?.broadcastedTo &&
            Array.isArray(
                assignment.broadcastedTo
            )
        ) {

            setAvailableBoys(
                assignment.broadcastedTo
            );

        }

    }, [order]);


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

            {/* =================================================
                ORDER HEADER
            ================================================= */}

            <div
                className="
                    border-b
                    pb-3
                "
            >

                <div
                    className="
                        flex
                        justify-between
                        items-start
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
                            {
                                order._id?.slice(-6)
                            }
                        </h2>

                        <p
                            className="
                                text-xs
                                text-gray-500
                                mt-1
                            "
                        >
                            {
                                new Date(
                                    order.createdAt
                                ).toLocaleDateString()
                            }
                        </p>

                    </div>


                    <span
                        className="
                            text-xs
                            text-gray-500
                            uppercase
                        "
                    >
                        {
                            order.paymentMethod
                        }
                    </span>

                </div>

            </div>


            {/* =================================================
                CUSTOMER DETAILS
            ================================================= */}

            <div
                className="
                    bg-[#fff9f6]
                    rounded-lg
                    p-3
                    mt-4
                "
            >

                <h3
                    className="
                        font-semibold
                        text-gray-800
                        text-sm
                    "
                >
                    Customer Details
                </h3>


                <p
                    className="
                        text-sm
                        text-gray-700
                        mt-2
                    "
                >
                    {
                        user?.fullName
                    }
                </p>


                <p
                    className="
                        text-xs
                        text-gray-500
                        mt-1
                    "
                >
                    {
                        user?.email
                    }
                </p>


                <p
                    className="
                        text-xs
                        text-gray-500
                        mt-1
                    "
                >
                    📞{" "}
                    {
                        user?.mobile
                    }
                </p>


                <p
                    className="
                        text-xs
                        text-gray-600
                        mt-2
                    "
                >
                    {
                        order
                            .deliveryAddress
                            ?.text
                    }
                </p>

            </div>


            {/* =================================================
                SHOP ORDERS
            ================================================= */}

            <div
                className="
                    mt-4
                    space-y-5
                "
            >

                {
                    order.shopOrders?.map(
                        (shopOrder) => {

                            const shopId =
                                typeof shopOrder.shop ===
                                    "object"

                                    ? shopOrder.shop?._id

                                    : shopOrder.shop;


                            const assignment =
                                shopOrder
                                    .deliveryAssignment;


                            const assignedDeliveryBoy =
                                assignment?.assignedTo;


                            const broadcastedBoys =
                                assignment
                                    ?.broadcastedTo ||
                                [];


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

                                    {/* =====================================
                                        SHOP HEADER
                                    ====================================== */}

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
                                                typeof shopOrder.shop ===
                                                    "object"
                                                    ? shopOrder
                                                        .shop
                                                        ?.name
                                                    : "Restaurant"
                                            }
                                        </h3>


                                        <select
                                            value={
                                                shopOrder.status ||
                                                "pending"
                                            }

                                            disabled={
                                                updating
                                            }

                                            onChange={(
                                                e
                                            ) =>
                                                handleStatusChange(
                                                    order._id,
                                                    shopId,
                                                    shopOrder._id,
                                                    e.target.value
                                                )
                                            }

                                            className="
                                                text-xs
                                                border
                                                border-gray-300
                                                rounded-md
                                                px-2
                                                py-1
                                                outline-none
                                                bg-white
                                            "
                                        >

                                            <option
                                                value="pending"
                                            >
                                                Pending
                                            </option>


                                            <option
                                                value="preparing"
                                            >
                                                Preparing
                                            </option>


                                            <option
                                                value="out for delivery"
                                            >
                                                Out for Delivery
                                            </option>

                                        </select>

                                    </div>


                                    {/* =====================================
                                        ORDER ITEMS
                                    ====================================== */}

                                    <div
                                        className="
                                            flex
                                            flex-wrap
                                            gap-3
                                        "
                                    >

                                        {
                                            shopOrder
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
                                                                Qty:{" "}
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
                                                )
                                        }

                                    </div>


                                    {/* =====================================
                                        SUBTOTAL
                                    ====================================== */}

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


                                    {/* =================================================
                                        DELIVERY SECTION
                                    ================================================= */}

                                    {
                                        shopOrder.status ===
                                            "out for delivery" && (

                                            <div
                                                className="
                                                    mt-4
                                                    border-t
                                                    pt-3
                                                "
                                            >

                                                {
                                                    assignedDeliveryBoy ? (

                                                        <div
                                                            className="
                                                                bg-green-50
                                                                border
                                                                border-green-200
                                                                rounded-xl
                                                                p-4
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

                                                                <div>

                                                                    <p
                                                                        className="
                                                                            font-semibold
                                                                            text-green-800
                                                                            text-sm
                                                                        "
                                                                    >
                                                                        Delivery Partner
                                                                    </p>

                                                                    <p
                                                                        className="
                                                                            text-xs
                                                                            text-green-600
                                                                            mt-1
                                                                        "
                                                                    >
                                                                        Delivery has been accepted
                                                                    </p>

                                                                </div>


                                                                <span
                                                                    className="
                                                                        text-xs
                                                                        px-2
                                                                        py-1
                                                                        rounded-full
                                                                        bg-green-100
                                                                        text-green-700
                                                                        font-medium
                                                                    "
                                                                >
                                                                    Assigned
                                                                </span>

                                                            </div>


                                                            <div
                                                                className="
                                                                    flex
                                                                    justify-between
                                                                    items-center
                                                                    gap-3
                                                                    mb-2
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
                                                                        assignedDeliveryBoy
                                                                            .fullName ||
                                                                        "Not available"
                                                                    }
                                                                </span>

                                                            </div>


                                                            <div
                                                                className="
                                                                    flex
                                                                    justify-between
                                                                    items-center
                                                                    gap-3
                                                                    mb-2
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


                                                                <div
                                                                    className="
                                                                        flex
                                                                        items-center
                                                                        gap-1
                                                                        text-sm
                                                                        font-medium
                                                                        text-gray-800
                                                                    "
                                                                >

                                                                    <MdPhone
                                                                        size={
                                                                            15
                                                                        }
                                                                    />

                                                                    {
                                                                        assignedDeliveryBoy
                                                                            .mobile ||
                                                                        "Not available"
                                                                    }

                                                                </div>

                                                            </div>


                                                            <div
                                                                className="
                                                                    flex
                                                                    justify-between
                                                                    items-start
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
                                                                        assignedDeliveryBoy
                                                                            .email ||
                                                                        "Not available"
                                                                    }
                                                                </span>

                                                            </div>

                                                        </div>

                                                    ) : (

                                                        (
                                                            broadcastedBoys.length >
                                                                0 ||
                                                            availableBoys.length >
                                                                0
                                                        ) ? (

                                                            <div>

                                                                <p
                                                                    className="
                                                                        font-semibold
                                                                        text-gray-800
                                                                        text-sm
                                                                        mb-3
                                                                    "
                                                                >
                                                                    Delivery Boys Within 5 KM
                                                                </p>


                                                                <div
                                                                    className="
                                                                        space-y-2
                                                                    "
                                                                >

                                                                    {
                                                                        (
                                                                            broadcastedBoys.length >
                                                                                0
                                                                                ? broadcastedBoys
                                                                                : availableBoys
                                                                        ).map(
                                                                            (
                                                                                boy
                                                                            ) => (

                                                                                <div
                                                                                    key={
                                                                                        boy._id
                                                                                    }
                                                                                    className="
                                                                                        flex
                                                                                        justify-between
                                                                                        items-center
                                                                                        bg-orange-50
                                                                                        border
                                                                                        border-orange-100
                                                                                        rounded-lg
                                                                                        p-3
                                                                                    "
                                                                                >

                                                                                    <div>

                                                                                        <p
                                                                                            className="
                                                                                                text-sm
                                                                                                font-medium
                                                                                                text-gray-800
                                                                                            "
                                                                                        >
                                                                                            {
                                                                                                boy.fullName
                                                                                            }
                                                                                        </p>


                                                                                        <p
                                                                                            className="
                                                                                                text-xs
                                                                                                text-gray-500
                                                                                                mt-1
                                                                                            "
                                                                                        >
                                                                                            {
                                                                                                boy.email
                                                                                            }
                                                                                        </p>

                                                                                    </div>


                                                                                    <div
                                                                                        className="
                                                                                            flex
                                                                                            items-center
                                                                                            gap-1
                                                                                            text-xs
                                                                                            text-gray-600
                                                                                        "
                                                                                    >

                                                                                        <MdPhone
                                                                                            size={
                                                                                                14
                                                                                            }
                                                                                        />

                                                                                        {
                                                                                            boy.mobile
                                                                                        }

                                                                                    </div>

                                                                                </div>

                                                                            )
                                                                        )
                                                                    }

                                                                </div>

                                                            </div>

                                                        ) : (

                                                            <div
                                                                className="
                                                                    bg-orange-50
                                                                    border
                                                                    border-orange-100
                                                                    rounded-lg
                                                                    p-4
                                                                    text-center
                                                                "
                                                            >

                                                                <p
                                                                    className="
                                                                        text-sm
                                                                        font-semibold
                                                                        text-gray-800
                                                                    "
                                                                >
                                                                    Waiting for delivery boy...
                                                                </p>


                                                                <p
                                                                    className="
                                                                        text-xs
                                                                        text-gray-500
                                                                        mt-1
                                                                    "
                                                                >
                                                                    No delivery boy is available within 5 KM right now.
                                                                </p>

                                                            </div>

                                                        )

                                                    )
                                                }

                                            </div>

                                        )
                                    }


                                    {/* =================================================
                                        DELIVERED STATUS
                                    ================================================= */}

                                    {
                                        shopOrder.status ===
                                            "delivered" && (

                                            <div
                                                className="
                                                    mt-4
                                                    bg-green-50
                                                    border
                                                    border-green-200
                                                    rounded-xl
                                                    p-4
                                                "
                                            >

                                                <p
                                                    className="
                                                        text-sm
                                                        font-bold
                                                        text-green-700
                                                    "
                                                >
                                                    ✓ Order Delivered
                                                </p>

                                                <p
                                                    className="
                                                        text-xs
                                                        text-green-600
                                                        mt-1
                                                    "
                                                >
                                                    Delivery has been completed successfully.
                                                </p>

                                            </div>

                                        )
                                    }

                                </div>

                            );

                        }
                    )
                }

            </div>


            {/* =================================================
                TOTAL
            ================================================= */}

            <div
                className="
                    flex
                    justify-between
                    items-center
                    mt-4
                    pt-3
                    border-t
                "
            >

                <span
                    className="
                        text-sm
                        font-medium
                        text-gray-700
                    "
                >
                    Total
                </span>


                <span
                    className="
                        text-gray-800
                        font-bold
                        text-sm
                    "
                >
                    ₹

                    {
                        order.shopOrders?.reduce(
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
                        )
                    }

                </span>

            </div>

        </div>

    );

}


export default OwnerOrderCard;