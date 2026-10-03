import React, {
    useEffect,
    useState
} from "react";

import axios from "axios";

import {
    serverUrl
} from "../App";

import useGetMyOrders from "../hooks/useGetMyOrder";

import DeliveryTrackingMap from "../components/DeliveryTrackingMap";


// ======================================================
// DELIVERY BOY
// ======================================================

function DeliveryBoy() {

    // ==================================================
    // DELIVERY REQUESTS
    // ==================================================

    const [
        assignments,
        setAssignments
    ] = useState([]);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        acceptingId,
        setAcceptingId
    ] = useState(null);

    const [
        error,
        setError
    ] = useState("");


    // ==================================================
    // ACCEPTED ORDERS
    // ==================================================

    const {
        orders,
        loading: ordersLoading,
        refetchOrders
    } = useGetMyOrders();


    // ==================================================
    // DELIVERY BOY GPS LOCATION
    // ==================================================

    const [
        deliveryBoyPosition,
        setDeliveryBoyPosition
    ] = useState(null);

    const [
        locationError,
        setLocationError
    ] = useState("");


    // ==================================================
    // MARK DELIVERY LOADING
    // ==================================================

    const [
        markingDeliveryId,
        setMarkingDeliveryId
    ] = useState(null);


    // ==================================================
    // OTP INPUT
    // ==================================================

    const [
        otpValues,
        setOtpValues
    ] = useState({});


    const [
        verifyingOtpId,
        setVerifyingOtpId
    ] = useState(null);


    // ==================================================
    // OTP GENERATED STATE
    // ==================================================

    const [
        otpGenerated,
        setOtpGenerated
    ] = useState({});


    // ==================================================
    // GET DELIVERY BOY LOCATION
    // ==================================================

    useEffect(() => {

        if (!navigator.geolocation) {

            setLocationError(
                "Geolocation is not supported by your browser."
            );

            return;

        }


        const watchId =
            navigator.geolocation.watchPosition(

                (position) => {

                    const latitude =
                        position.coords.latitude;

                    const longitude =
                        position.coords.longitude;


                    setDeliveryBoyPosition([
                        latitude,
                        longitude
                    ]);

                    setLocationError("");

                },

                (error) => {

                    console.log(
                        "Location error:",
                        error
                    );

                    setLocationError(
                        "Please allow location access to track your delivery."
                    );

                },

                {
                    enableHighAccuracy: true,
                    maximumAge: 5000,
                    timeout: 10000
                }

            );


        return () => {

            navigator.geolocation.clearWatch(
                watchId
            );

        };

    }, []);


    // ==================================================
    // GET DELIVERY REQUESTS
    // ==================================================

    const getDeliveryRequests =
        async () => {

            try {

                const token =
                    localStorage.getItem(
                        "token"
                    );


                const result =
                    await axios.get(
                        `${serverUrl}/api/order/delivery-requests`,
                        {
                            withCredentials: true,

                            headers: token
                                ? {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                                : {}
                        }
                    );


                /*
                 * Backend returns:
                 *
                 * {
                 *   success: true,
                 *   requests: [...]
                 * }
                 */

                setAssignments(
                    result.data.requests ||
                    []
                );


                setError("");

            } catch (error) {

                console.log(
                    "Get delivery requests error:",
                    error.response?.data ||
                    error.message
                );


                setError(
                    error.response
                        ?.data
                        ?.message ||
                    "Unable to get delivery requests"
                );

            } finally {

                setLoading(false);

            }

        };


    // ==================================================
    // POLLING DELIVERY REQUESTS
    // ==================================================

    useEffect(() => {

        getDeliveryRequests();


        const interval =
            setInterval(
                () => {

                    getDeliveryRequests();

                },
                5000
            );


        return () => {

            clearInterval(
                interval
            );

        };

    }, []);


    // ==================================================
    // ACCEPT DELIVERY
    // ==================================================

    const handleAcceptDelivery =
        async (
            assignmentId
        ) => {

            try {

                setAcceptingId(
                    assignmentId
                );


                const token =
                    localStorage.getItem(
                        "token"
                    );


                const result =
                    await axios.put(

                        `${serverUrl}/api/order/accept-delivery/${assignmentId}`,

                        {},

                        {
                            withCredentials: true,

                            headers: token
                                ? {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                                : {}
                        }

                    );


                console.log(
                    "Delivery accepted:",
                    result.data
                );


                // Remove accepted request
                setAssignments(
                    (prev) =>
                        prev.filter(
                            (item) =>
                                String(
                                    item._id
                                ) !==
                                String(
                                    assignmentId
                                )
                        )
                );


                // Immediately fetch accepted order
                await refetchOrders();


                alert(
                    "Delivery accepted successfully"
                );

            } catch (error) {

                console.log(
                    "Accept delivery error:",
                    error.response?.data ||
                    error.message
                );


                alert(
                    error.response
                        ?.data
                        ?.message ||
                    "Unable to accept delivery"
                );

            } finally {

                setAcceptingId(
                    null
                );

            }

        };


    // ==================================================
    // FIND SHOP ORDER
    // ==================================================

    const getShopOrder =
        (
            order
        ) => {

            if (!order) {
                return null;
            }


            if (
                !order.shopOrders ||
                order.shopOrders.length === 0
            ) {
                return null;
            }


            return order.shopOrders.find(
                (shopOrder) => {

                    const assignment =
                        shopOrder.deliveryAssignment;

                    return (
                        assignment &&
                        assignment.status ===
                        "assigned"
                    );

                }
            ) || null;

        };


    // ==================================================
    // GET DELIVERY BOY ACTIVE ORDERS
    // ==================================================

    const activeDeliveries =
        orders
            .map(
                (order) => {

                    const shopOrder =
                        getShopOrder(
                            order
                        );


                    if (!shopOrder) {
                        return null;
                    }


                    return {
                        order,
                        shopOrder
                    };

                }
            )
            .filter(
                Boolean
            );


    // ==================================================
    // GET CUSTOMER POSITION
    // ==================================================

    const getCustomerPosition =
        (
            order
        ) => {

            const latitude =
                Number(
                    order
                        ?.deliveryAddress
                        ?.latitude
                );

            const longitude =
                Number(
                    order
                        ?.deliveryAddress
                        ?.longitude
                );


            if (
                !Number.isFinite(
                    latitude
                ) ||
                !Number.isFinite(
                    longitude
                )
            ) {

                return null;

            }


            return [
                latitude,
                longitude
            ];

        };


    // ==================================================
    // MARK DELIVERY
    // ==================================================

    const handleMarkDelivery =
        async (
            assignmentId
        ) => {

            try {

                setMarkingDeliveryId(
                    assignmentId
                );


                const token =
                    localStorage.getItem(
                        "token"
                    );


                const result =
                    await axios.put(

                        `${serverUrl}/api/order/mark-delivery/${assignmentId}`,

                        {},

                        {
                            withCredentials: true,

                            headers: token
                                ? {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                                : {}
                        }

                    );


                console.log(
                    "Mark delivery response:",
                    result.data
                );


                if (
                    result.data
                        ?.otpGenerated
                ) {

                    setOtpGenerated(
                        (prev) => ({
                            ...prev,
                            [assignmentId]:
                                true
                        })
                    );

                }


                await refetchOrders();


                alert(
                    "Delivery OTP generated. Ask the customer for the OTP."
                );

            } catch (error) {

                console.log(
                    "Mark delivery error:",
                    error.response?.data ||
                    error.message
                );


                alert(
                    error.response
                        ?.data
                        ?.message ||
                    "Unable to generate delivery OTP"
                );

            } finally {

                setMarkingDeliveryId(
                    null
                );

            }

        };


    // ==================================================
    // VERIFY OTP
    // ==================================================

    const handleVerifyOtp =
        async (
            assignmentId
        ) => {

            const otp =
                otpValues[
                    assignmentId
                ] || "";


            if (
                otp.length !== 6
            ) {

                alert(
                    "Please enter the 6 digit OTP."
                );

                return;

            }


            try {

                setVerifyingOtpId(
                    assignmentId
                );


                const token =
                    localStorage.getItem(
                        "token"
                    );


                const result =
                    await axios.put(

                        `${serverUrl}/api/order/verify-delivery-otp/${assignmentId}`,

                        {
                            otp
                        },

                        {
                            withCredentials: true,

                            headers: token
                                ? {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                                : {}
                        }

                    );


                console.log(
                    "OTP verification:",
                    result.data
                );


                alert(
                    "OTP verified. Order delivered successfully."
                );


                setOtpValues(
                    (prev) => {

                        const updated = {
                            ...prev
                        };

                        delete updated[
                            assignmentId
                        ];

                        return updated;

                    }
                );


                setOtpGenerated(
                    (prev) => {

                        const updated = {
                            ...prev
                        };

                        delete updated[
                            assignmentId
                        ];

                        return updated;

                    }
                );


                await refetchOrders();


            } catch (error) {

                console.log(
                    "Verify OTP error:",
                    error.response?.data ||
                    error.message
                );


                alert(
                    error.response
                        ?.data
                        ?.message ||
                    "Invalid OTP"
                );

            } finally {

                setVerifyingOtpId(
                    null
                );

            }

        };


    // ==================================================
    // LOADING
    // ==================================================

    if (
        loading &&
        ordersLoading
    ) {

        return (

            <div
                className="
                    min-h-screen
                    flex
                    items-center
                    justify-center
                    bg-gray-100
                "
            >

                <div
                    className="
                        text-center
                    "
                >

                    <div
                        className="
                            text-5xl
                            mb-4
                        "
                    >
                        🚴
                    </div>


                    <p
                        className="
                            text-gray-600
                            text-lg
                        "
                    >
                        Checking delivery requests...
                    </p>

                </div>

            </div>

        );

    }


    // ==================================================
    // UI
    // ==================================================

    return (

        <div
            className="
                min-h-screen
                bg-gray-100
                px-4
                py-6
            "
        >

            <div
                className="
                    max-w-5xl
                    mx-auto
                "
            >


                {/* ======================================
                    HEADER
                ====================================== */}

                <div
                    className="
                        mb-6
                    "
                >

                    <h1
                        className="
                            text-3xl
                            font-bold
                            text-gray-800
                        "
                    >
                        Delivery Dashboard
                    </h1>


                    <p
                        className="
                            text-gray-500
                            mt-1
                        "
                    >
                        Manage your delivery requests
                        and active deliveries.
                    </p>

                </div>


                {/* ======================================
                    LOCATION ERROR
                ====================================== */}

                {locationError && (

                    <div
                        className="
                            bg-yellow-50
                            border
                            border-yellow-200
                            text-yellow-700
                            rounded-xl
                            p-4
                            mb-5
                        "
                    >

                        📍 {locationError}

                    </div>

                )}


                {/* ======================================
                    ERROR
                ====================================== */}

                {error && (

                    <div
                        className="
                            bg-red-50
                            border
                            border-red-200
                            text-red-600
                            rounded-xl
                            p-4
                            mb-5
                        "
                    >

                        {error}

                    </div>

                )}


                {/* ======================================
                    ACTIVE DELIVERIES
                ====================================== */}

                {activeDeliveries.length > 0 && (

                    <div
                        className="
                            mb-8
                        "
                    >

                        <h2
                            className="
                                text-2xl
                                font-bold
                                text-gray-800
                                mb-4
                            "
                        >
                            Active Delivery
                        </h2>


                        <div
                            className="
                                space-y-6
                            "
                        >

                            {activeDeliveries.map(
                                ({
                                    order,
                                    shopOrder
                                }) => {

                                    const assignment =
                                        shopOrder
                                            ?.deliveryAssignment;


                                    const assignmentId =
                                        assignment?._id;


                                    const customerPosition =
                                        getCustomerPosition(
                                            order
                                        );


                                    const otpIsGenerated =
                                        Boolean(
                                            otpGenerated[
                                                assignmentId
                                            ] ||
                                            shopOrder
                                                ?.deliveryOtpGenerated
                                        );


                                    return (

                                        <div
                                            key={
                                                assignmentId ||
                                                order._id
                                            }
                                            className="
                                                bg-white
                                                rounded-2xl
                                                shadow-sm
                                                p-5
                                            "
                                        >


                                            {/* SHOP */}

                                            <div
                                                className="
                                                    flex
                                                    items-start
                                                    justify-between
                                                    gap-4
                                                "
                                            >

                                                <div>

                                                    <h3
                                                        className="
                                                            text-xl
                                                            font-bold
                                                            text-gray-800
                                                        "
                                                    >
                                                        {
                                                            shopOrder
                                                                ?.shop
                                                                ?.name ||
                                                            "Restaurant"
                                                        }
                                                    </h3>


                                                    <p
                                                        className="
                                                            text-sm
                                                            text-gray-500
                                                            mt-1
                                                        "
                                                    >
                                                        {
                                                            shopOrder
                                                                ?.shop
                                                                ?.address ||
                                                            "Restaurant address unavailable"
                                                        }
                                                    </p>

                                                </div>


                                                <span
                                                    className="
                                                        px-3
                                                        py-1
                                                        rounded-full
                                                        bg-orange-100
                                                        text-orange-600
                                                        text-sm
                                                        font-medium
                                                    "
                                                >
                                                    Out for Delivery
                                                </span>

                                            </div>


                                            {/* CUSTOMER */}

                                            <div
                                                className="
                                                    border-t
                                                    mt-5
                                                    pt-4
                                                "
                                            >

                                                <h4
                                                    className="
                                                        font-semibold
                                                        text-gray-800
                                                        mb-2
                                                    "
                                                >
                                                    Customer
                                                </h4>


                                                <p
                                                    className="
                                                        text-gray-700
                                                    "
                                                >
                                                    {
                                                        order
                                                            ?.user
                                                            ?.fullName ||
                                                        "Customer"
                                                    }
                                                </p>


                                                <p
                                                    className="
                                                        text-sm
                                                        text-gray-500
                                                        mt-1
                                                    "
                                                >
                                                    {
                                                        order
                                                            ?.deliveryAddress
                                                            ?.text ||
                                                        "Address unavailable"
                                                    }
                                                </p>

                                            </div>


                                            {/* MAP */}

                                            {customerPosition &&
                                            deliveryBoyPosition ? (

                                                <DeliveryTrackingMap
                                                    customerPosition={
                                                        customerPosition
                                                    }
                                                    deliveryBoyPosition={
                                                        deliveryBoyPosition
                                                    }
                                                />

                                            ) : (

                                                <div
                                                    className="
                                                        mt-4
                                                        bg-gray-50
                                                        rounded-xl
                                                        p-5
                                                        text-center
                                                    "
                                                >

                                                    <p
                                                        className="
                                                            text-gray-600
                                                            font-medium
                                                        "
                                                    >
                                                        📍 Waiting for location...
                                                    </p>


                                                    <p
                                                        className="
                                                            text-sm
                                                            text-gray-400
                                                            mt-1
                                                        "
                                                    >
                                                        Allow location access
                                                        to see live tracking.
                                                    </p>

                                                </div>

                                            )}


                                            {/* ITEMS */}

                                            <div
                                                className="
                                                    border-t
                                                    mt-5
                                                    pt-4
                                                "
                                            >

                                                <h4
                                                    className="
                                                        font-semibold
                                                        text-gray-800
                                                        mb-3
                                                    "
                                                >
                                                    Order Items
                                                </h4>


                                                {shopOrder
                                                    ?.shopOrderItems
                                                    ?.length > 0 ? (

                                                    <div
                                                        className="
                                                            space-y-2
                                                        "
                                                    >

                                                        {shopOrder
                                                            .shopOrderItems
                                                            .map(
                                                                (
                                                                    orderItem
                                                                ) => (

                                                                    <div
                                                                        key={
                                                                            orderItem._id
                                                                        }
                                                                        className="
                                                                            flex
                                                                            justify-between
                                                                            gap-4
                                                                            text-sm
                                                                        "
                                                                    >

                                                                        <span
                                                                            className="
                                                                                text-gray-600
                                                                            "
                                                                        >

                                                                            {
                                                                                orderItem
                                                                                    .item
                                                                                    ?.name ||
                                                                                "Item"
                                                                            }

                                                                            {" × "}

                                                                            {
                                                                                orderItem.quantity
                                                                            }

                                                                        </span>


                                                                        <span
                                                                            className="
                                                                                font-medium
                                                                                text-gray-800
                                                                            "
                                                                        >

                                                                            ₹
                                                                            {(
                                                                                Number(
                                                                                    orderItem.price
                                                                                ) *
                                                                                Number(
                                                                                    orderItem.quantity
                                                                                )
                                                                            ).toFixed(
                                                                                2
                                                                            )}

                                                                        </span>

                                                                    </div>

                                                                )
                                                            )}

                                                    </div>

                                                ) : (

                                                    <p
                                                        className="
                                                            text-gray-500
                                                            text-sm
                                                        "
                                                    >
                                                        No items found
                                                    </p>

                                                )}

                                            </div>


                                            {/* TOTAL */}

                                            <div
                                                className="
                                                    border-t
                                                    mt-5
                                                    pt-4
                                                    flex
                                                    justify-between
                                                    items-center
                                                "
                                            >

                                                <span
                                                    className="
                                                        font-semibold
                                                        text-gray-700
                                                    "
                                                >
                                                    Order Total
                                                </span>


                                                <span
                                                    className="
                                                        text-xl
                                                        font-bold
                                                        text-orange-500
                                                    "
                                                >

                                                    ₹
                                                    {Number(
                                                        shopOrder
                                                            ?.subtotal ||
                                                        0
                                                    ).toFixed(
                                                        2
                                                    )}

                                                </span>

                                            </div>


                                            {/* ==================================
                                                DELIVERY ACTION
                                            ================================== */}

                                            {customerPosition &&
                                            deliveryBoyPosition ? (

                                                <div
                                                    className="
                                                        mt-5
                                                    "
                                                >

                                                    {/* DISTANCE */}

                                                    <div
                                                        className="
                                                            bg-gray-50
                                                            rounded-xl
                                                            p-4
                                                            text-center
                                                            mb-4
                                                        "
                                                    >

                                                        <p
                                                            className="
                                                                text-sm
                                                                text-gray-500
                                                            "
                                                        >
                                                            Current distance
                                                        </p>


                                                        <p
                                                            className="
                                                                text-2xl
                                                                font-bold
                                                                text-gray-800
                                                                mt-1
                                                            "
                                                        >

                                                            {
                                                                (() => {

                                                                    const R =
                                                                        6371000;


                                                                    const lat1 =
                                                                        customerPosition[
                                                                            0
                                                                        ] *
                                                                        Math.PI /
                                                                        180;


                                                                    const lat2 =
                                                                        deliveryBoyPosition[
                                                                            0
                                                                        ] *
                                                                        Math.PI /
                                                                        180;


                                                                    const dLat =
                                                                        (
                                                                            deliveryBoyPosition[
                                                                                0
                                                                            ] -
                                                                            customerPosition[
                                                                                0
                                                                            ]
                                                                        ) *
                                                                        Math.PI /
                                                                        180;


                                                                    const dLon =
                                                                        (
                                                                            deliveryBoyPosition[
                                                                                1
                                                                            ] -
                                                                            customerPosition[
                                                                                1
                                                                            ]
                                                                        ) *
                                                                        Math.PI /
                                                                        180;


                                                                    const a =
                                                                        Math.sin(
                                                                            dLat /
                                                                            2
                                                                        ) *
                                                                        Math.sin(
                                                                            dLat /
                                                                            2
                                                                        ) +

                                                                        Math.cos(
                                                                            lat1
                                                                        ) *
                                                                        Math.cos(
                                                                            lat2
                                                                        ) *

                                                                        Math.sin(
                                                                            dLon /
                                                                            2
                                                                        ) *
                                                                        Math.sin(
                                                                            dLon /
                                                                            2
                                                                        );


                                                                    const c =
                                                                        2 *
                                                                        Math.atan2(
                                                                            Math.sqrt(
                                                                                a
                                                                            ),
                                                                            Math.sqrt(
                                                                                1 -
                                                                                a
                                                                            )
                                                                        );


                                                                    const distance =
                                                                        R *
                                                                        c;


                                                                    return distance >=
                                                                        1000
                                                                        ? `${(
                                                                            distance /
                                                                            1000
                                                                        ).toFixed(
                                                                            2
                                                                        )} KM`
                                                                        : `${Math.round(
                                                                            distance
                                                                        )} meters`;

                                                                })()
                                                            }

                                                        </p>

                                                    </div>


                                                    {/* MARK DELIVERY */}

                                                    {!otpIsGenerated && (

                                                        <button
                                                            onClick={() =>
                                                                handleMarkDelivery(
                                                                    assignmentId
                                                                )
                                                            }
                                                            disabled={
                                                                markingDeliveryId ===
                                                                assignmentId
                                                            }
                                                            className="
                                                                w-full
                                                                bg-green-500
                                                                hover:bg-green-600
                                                                disabled:bg-gray-400
                                                                text-white
                                                                py-3
                                                                rounded-xl
                                                                font-semibold
                                                                transition
                                                            "
                                                        >

                                                            {markingDeliveryId ===
                                                            assignmentId
                                                                ? "Generating OTP..."
                                                                : "Mark as Delivered"}

                                                        </button>

                                                    )}


                                                    {/* OTP */}

                                                    {otpIsGenerated && (

                                                        <div
                                                            className="
                                                                mt-4
                                                                border
                                                                border-green-200
                                                                bg-green-50
                                                                rounded-xl
                                                                p-4
                                                            "
                                                        >

                                                            <p
                                                                className="
                                                                    font-semibold
                                                                    text-green-700
                                                                "
                                                            >
                                                                🔐 Delivery OTP
                                                            </p>


                                                            <p
                                                                className="
                                                                    text-sm
                                                                    text-gray-600
                                                                    mt-1
                                                                "
                                                            >
                                                                Ask the customer
                                                                for the 6-digit
                                                                OTP.
                                                            </p>


                                                            <input
                                                                type="text"
                                                                inputMode="numeric"
                                                                maxLength={6}
                                                                value={
                                                                    otpValues[
                                                                        assignmentId
                                                                    ] ||
                                                                    ""
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {

                                                                    const value =
                                                                        e.target.value
                                                                            .replace(
                                                                                /\D/g,
                                                                                ""
                                                                            )
                                                                            .slice(
                                                                                0,
                                                                                6
                                                                            );


                                                                    setOtpValues(
                                                                        (
                                                                            prev
                                                                        ) => ({
                                                                            ...prev,
                                                                            [assignmentId]:
                                                                                value
                                                                        })
                                                                    );

                                                                }}
                                                                placeholder="Enter 6 digit OTP"
                                                                className="
                                                                    w-full
                                                                    mt-3
                                                                    px-4
                                                                    py-3
                                                                    border
                                                                    border-gray-300
                                                                    rounded-xl
                                                                    text-center
                                                                    text-xl
                                                                    tracking-[0.4em]
                                                                    outline-none
                                                                    focus:ring-2
                                                                    focus:ring-green-400
                                                                "
                                                            />


                                                            <button
                                                                onClick={() =>
                                                                    handleVerifyOtp(
                                                                        assignmentId
                                                                    )
                                                                }
                                                                disabled={
                                                                    verifyingOtpId ===
                                                                    assignmentId
                                                                }
                                                                className="
                                                                    w-full
                                                                    mt-3
                                                                    bg-green-600
                                                                    hover:bg-green-700
                                                                    disabled:bg-gray-400
                                                                    text-white
                                                                    py-3
                                                                    rounded-xl
                                                                    font-semibold
                                                                "
                                                            >

                                                                {verifyingOtpId ===
                                                                assignmentId
                                                                    ? "Verifying..."
                                                                    : "Verify OTP & Complete Delivery"}

                                                            </button>

                                                        </div>

                                                    )}

                                                </div>

                                            ) : (

                                                <div
                                                    className="
                                                        mt-5
                                                        bg-yellow-50
                                                        border
                                                        border-yellow-200
                                                        rounded-xl
                                                        p-4
                                                        text-center
                                                        text-yellow-700
                                                    "
                                                >
                                                    Waiting for both locations
                                                    before delivery verification.
                                                </div>

                                            )}

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    </div>

                )}


                {/* ======================================
                    DELIVERY REQUESTS
                ====================================== */}

                <div>

                    <h2
                        className="
                            text-2xl
                            font-bold
                            text-gray-800
                            mb-4
                        "
                    >
                        Delivery Requests
                    </h2>


                    {assignments.length === 0 ? (

                        <div
                            className="
                                bg-white
                                rounded-2xl
                                shadow-sm
                                p-10
                                text-center
                            "
                        >

                            <div
                                className="
                                    text-6xl
                                    mb-4
                                "
                            >
                                🚴
                            </div>


                            <h3
                                className="
                                    text-xl
                                    font-semibold
                                    text-gray-700
                                "
                            >
                                No delivery requests
                            </h3>


                            <p
                                className="
                                    text-gray-500
                                    mt-2
                                "
                            >
                                You will see a delivery request
                                here when an order is available
                                within 5 KM.
                            </p>


                            <p
                                className="
                                    text-sm
                                    text-gray-400
                                    mt-3
                                "
                            >
                                This page checks for new requests
                                automatically.
                            </p>

                        </div>

                    ) : (

                        <div
                            className="
                                space-y-5
                            "
                        >

                            {assignments.map(
                                (
                                    assignment
                                ) => {

                                    const order =
                                        assignment.order;

                                    const shop =
                                        assignment.shop;

                                    const shopOrder =
                                        assignment.shopOrder ||
                                        order
                                            ?.shopOrders
                                            ?.find(
                                                (
                                                    item
                                                ) =>
                                                    String(
                                                        item._id
                                                    ) ===
                                                    String(
                                                        assignment.shopOrderId
                                                    )
                                            );


                                    return (

                                        <div
                                            key={
                                                assignment._id
                                            }
                                            className="
                                                bg-white
                                                rounded-2xl
                                                shadow-sm
                                                p-5
                                            "
                                        >

                                            {/* SHOP */}

                                            <div
                                                className="
                                                    flex
                                                    items-start
                                                    justify-between
                                                    gap-4
                                                "
                                            >

                                                <div>

                                                    <h2
                                                        className="
                                                            text-xl
                                                            font-bold
                                                            text-gray-800
                                                        "
                                                    >
                                                        {
                                                            shop?.name ||
                                                            "Restaurant"
                                                        }
                                                    </h2>


                                                    <p
                                                        className="
                                                            text-sm
                                                            text-gray-500
                                                            mt-1
                                                        "
                                                    >
                                                        {
                                                            shop?.address ||
                                                            "Restaurant address unavailable"
                                                        }
                                                    </p>

                                                </div>


                                                <div
                                                    className="
                                                        text-right
                                                    "
                                                >

                                                    <span
                                                        className="
                                                            inline-block
                                                            px-3
                                                            py-1
                                                            rounded-full
                                                            bg-orange-100
                                                            text-orange-600
                                                            text-sm
                                                            font-medium
                                                        "
                                                    >
                                                        New Delivery
                                                    </span>


                                                    <p
                                                        className="
                                                            text-sm
                                                            text-gray-500
                                                            mt-2
                                                        "
                                                    >

                                                        {assignment.distance
                                                            ? (
                                                                assignment.distance >=
                                                                1000
                                                                    ? `${(
                                                                        assignment.distance /
                                                                        1000
                                                                    ).toFixed(
                                                                        1
                                                                    )} KM`
                                                                    : `${assignment.distance} m`
                                                            )
                                                            : "Within 5 KM"}

                                                    </p>

                                                </div>

                                            </div>


                                            {/* CUSTOMER */}

                                            <div
                                                className="
                                                    border-t
                                                    mt-5
                                                    pt-4
                                                "
                                            >

                                                <h3
                                                    className="
                                                        font-semibold
                                                        text-gray-800
                                                        mb-2
                                                    "
                                                >
                                                    Customer
                                                </h3>


                                                <p
                                                    className="
                                                        text-gray-700
                                                    "
                                                >
                                                    {
                                                        order
                                                            ?.user
                                                            ?.fullName ||
                                                        "Customer"
                                                    }
                                                </p>


                                                <p
                                                    className="
                                                        text-sm
                                                        text-gray-500
                                                        mt-1
                                                    "
                                                >
                                                    {
                                                        order
                                                            ?.deliveryAddress
                                                            ?.text ||
                                                        "Address unavailable"
                                                    }
                                                </p>

                                            </div>


                                            {/* ITEMS */}

                                            <div
                                                className="
                                                    border-t
                                                    mt-5
                                                    pt-4
                                                "
                                            >

                                                <h3
                                                    className="
                                                        font-semibold
                                                        text-gray-800
                                                        mb-3
                                                    "
                                                >
                                                    Order Items
                                                </h3>


                                                {shopOrder
                                                    ?.shopOrderItems
                                                    ?.length > 0 ? (

                                                    <div
                                                        className="
                                                            space-y-2
                                                        "
                                                    >

                                                        {shopOrder
                                                            .shopOrderItems
                                                            .map(
                                                                (
                                                                    orderItem
                                                                ) => (

                                                                    <div
                                                                        key={
                                                                            orderItem._id
                                                                        }
                                                                        className="
                                                                            flex
                                                                            justify-between
                                                                            gap-4
                                                                            text-sm
                                                                        "
                                                                    >

                                                                        <span
                                                                            className="
                                                                                text-gray-600
                                                                            "
                                                                        >

                                                                            {
                                                                                orderItem
                                                                                    .item
                                                                                    ?.name ||
                                                                                "Item"
                                                                            }

                                                                            {" × "}

                                                                            {
                                                                                orderItem.quantity
                                                                            }

                                                                        </span>


                                                                        <span
                                                                            className="
                                                                                font-medium
                                                                                text-gray-800
                                                                            "
                                                                        >

                                                                            ₹
                                                                            {(
                                                                                Number(
                                                                                    orderItem.price
                                                                                ) *
                                                                                Number(
                                                                                    orderItem.quantity
                                                                                )
                                                                            ).toFixed(
                                                                                2
                                                                            )}

                                                                        </span>

                                                                    </div>

                                                                )
                                                            )}

                                                    </div>

                                                ) : (

                                                    <p
                                                        className="
                                                            text-gray-500
                                                            text-sm
                                                        "
                                                    >
                                                        No items found
                                                    </p>

                                                )}

                                            </div>


                                            {/* TOTAL */}

                                            <div
                                                className="
                                                    border-t
                                                    mt-5
                                                    pt-4
                                                    flex
                                                    justify-between
                                                    items-center
                                                "
                                            >

                                                <span
                                                    className="
                                                        font-semibold
                                                        text-gray-700
                                                    "
                                                >
                                                    Order Total
                                                </span>


                                                <span
                                                    className="
                                                        text-xl
                                                        font-bold
                                                        text-orange-500
                                                    "
                                                >

                                                    ₹
                                                    {Number(
                                                        shopOrder
                                                            ?.subtotal ||
                                                        0
                                                    ).toFixed(
                                                        2
                                                    )}

                                                </span>

                                            </div>


                                            {/* ACCEPT */}

                                            <button
                                                onClick={() =>
                                                    handleAcceptDelivery(
                                                        assignment._id
                                                    )
                                                }
                                                disabled={
                                                    acceptingId ===
                                                    assignment._id
                                                }
                                                className="
                                                    w-full
                                                    mt-5
                                                    bg-orange-500
                                                    hover:bg-orange-600
                                                    disabled:bg-gray-400
                                                    text-white
                                                    py-3
                                                    rounded-xl
                                                    font-semibold
                                                    transition
                                                "
                                            >

                                                {acceptingId ===
                                                assignment._id
                                                    ? "Accepting..."
                                                    : "Accept Delivery"}

                                            </button>

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    )}

                </div>

            </div>

        </div>

    );

}


export default DeliveryBoy;