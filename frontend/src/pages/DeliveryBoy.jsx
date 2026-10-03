import React, {
    useEffect,
    useState
} from "react";

import axios from "axios";

import { useSelector } from "react-redux";

import {
    FaLocationDot,
    FaCheck,
    FaTruck,
    FaPhone
} from "react-icons/fa6";

import { serverUrl } from "../App";

import useGetMyOrders from "../hooks/useGetMyOrder";

import DeliveryTrackingMap
    from "../components/DeliveryTrackingMap";


const DeliveryBoy = () => {

    const {
        userData
    } = useSelector(
        (state) => state.user
    );


    const {
        orders,
        loading,
        refetchOrders
    } = useGetMyOrders();


    const [
        deliveryRequests,
        setDeliveryRequests
    ] = useState([]);


    const [
        deliveryBoyPosition,
        setDeliveryBoyPosition
    ] = useState(null);


    const [
        otpInputs,
        setOtpInputs
    ] = useState({});


    const [
        verifyingOtp,
        setVerifyingOtp
    ] = useState({});


    const [
        markingDelivery,
        setMarkingDelivery
    ] = useState({});


    // =====================================================
    // GET DELIVERY REQUESTS
    // =====================================================

    useEffect(() => {

        const getDeliveryRequests =
            async () => {

                try {

                    const token =
                        localStorage.getItem(
                            "token"
                        );

                    if (!token) {
                        return;
                    }


                    console.log(
                        "DELIVERY BOY TOKEN:",
                        !!token
                    );


                    const result =
                        await axios.get(
                            `${serverUrl}/api/order/delivery-requests`,
                            {
                                withCredentials: true,

                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                            }
                        );


                    console.log(
                        "DELIVERY REQUEST RESPONSE:",
                        result.data
                    );


                    setDeliveryRequests(
                        result.data.requests ||
                        []
                    );


                } catch (error) {

                    console.log(
                        "Get delivery requests error:",
                        error.response?.data ||
                        error.message
                    );

                }

            };


        getDeliveryRequests();


        const interval =
            setInterval(
                getDeliveryRequests,
                5000
            );


        return () => {

            clearInterval(
                interval
            );

        };

    }, []);


    // =====================================================
    // DELIVERY BOY LIVE LOCATION
    // =====================================================

    useEffect(() => {

        if (!userData) {
            return;
        }

        if (
            userData.role !==
            "deliveryBoy"
        ) {
            return;
        }


        if (
            !navigator.geolocation
        ) {

            console.log(
                "Geolocation is not supported"
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


                    console.log(
                        "Current delivery boy location:",
                        {
                            latitude,
                            longitude
                        }
                    );


                    setDeliveryBoyPosition([
                        latitude,
                        longitude
                    ]);

                },

                (error) => {

                    console.log(
                        "Delivery boy location error:",
                        error.message
                    );

                },

                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 10000
                }

            );


        return () => {

            navigator.geolocation.clearWatch(
                watchId
            );

        };

    }, [userData]);


    // =====================================================
    // ACCEPT DELIVERY
    // =====================================================

    const acceptDelivery =
        async (assignmentId) => {

            try {

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

                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                console.log(
                    "Delivery accepted:",
                    result.data
                );


                setDeliveryRequests(
                    (prev) =>
                        prev.filter(
                            (request) =>
                                request._id !==
                                assignmentId
                        )
                );


                await refetchOrders();


            } catch (error) {

                console.log(
                    "Accept delivery error:",
                    error.response?.data ||
                    error.message
                );

                alert(
                    error.response?.data?.message ||
                    "Unable to accept delivery"
                );

            }

        };


    // =====================================================
    // GET ACTIVE SHOP ORDER
    // =====================================================

    const getShopOrder =
        (order) => {

            if (
                !order?.shopOrders
            ) {
                return null;
            }


            return order.shopOrders.find(
                (shopOrder) => {

                    const assignment =
                        shopOrder
                            ?.deliveryAssignment;


                    if (!assignment) {
                        return false;
                    }


                    return (
                        assignment.status ===
                        "assigned" &&
                        shopOrder.status ===
                        "out for delivery"
                    );

                }
            ) || null;

        };


    // =====================================================
    // ACTIVE DELIVERIES
    // =====================================================

    const activeDeliveries =
        orders
            .map((order) => {

                const shopOrder =
                    getShopOrder(order);


                if (!shopOrder) {
                    return null;
                }


                const customerLatitude =
                    Number(
                        order
                            ?.deliveryAddress
                            ?.latitude
                    );


                const customerLongitude =
                    Number(
                        order
                            ?.deliveryAddress
                            ?.longitude
                    );


                const validCustomerPosition =
                    Number.isFinite(
                        customerLatitude
                    ) &&
                    Number.isFinite(
                        customerLongitude
                    );


                return {

                    order,

                    shopOrder,

                    customerPosition:
                        validCustomerPosition
                            ? [
                                customerLatitude,
                                customerLongitude
                            ]
                            : null

                };

            })
            .filter(Boolean);


    // =====================================================
    // DEBUG ACTIVE DELIVERIES
    // =====================================================

    useEffect(() => {

        console.log(
            "========== ACTIVE DELIVERIES =========="
        );

        console.log(
            "ACTIVE DELIVERIES:",
            activeDeliveries
        );

        console.log(
            "DELIVERY BOY POSITION:",
            deliveryBoyPosition
        );

        console.log(
            "========================================"
        );

    }, [
        orders,
        deliveryBoyPosition
    ]);


    // =====================================================
    // MARK DELIVERY
    // =====================================================

    const markDelivery =
        async (
            assignmentId,
            orderId,
            shopOrderId
        ) => {

            try {

                setMarkingDelivery(
                    (prev) => ({
                        ...prev,
                        [assignmentId]:
                            true
                    })
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

                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                console.log(
                    "Mark delivery result:",
                    result.data
                );


                if (
                    result.data?.otpGenerated
                ) {

                    setOtpInputs(
                        (prev) => ({
                            ...prev,

                            [assignmentId]:
                                ""
                        })
                    );

                }


                await refetchOrders();


            } catch (error) {

                console.log(
                    "Mark delivery error:",
                    error.response?.data ||
                    error.message
                );

                alert(
                    error.response?.data?.message ||
                    "Unable to mark delivery"
                );

            } finally {

                setMarkingDelivery(
                    (prev) => ({
                        ...prev,
                        [assignmentId]:
                            false
                    })
                );

            }

        };


    // =====================================================
    // VERIFY DELIVERY OTP
    // =====================================================

    const verifyDeliveryOtp =
        async (assignmentId) => {

            try {

                const otp =
                    otpInputs[
                        assignmentId
                    ] || "";


                if (
                    otp.length !== 6
                ) {

                    alert(
                        "Please enter the 6 digit OTP"
                    );

                    return;

                }


                setVerifyingOtp(
                    (prev) => ({
                        ...prev,
                        [assignmentId]:
                            true
                    })
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

                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                console.log(
                    "Verify delivery OTP:",
                    result.data
                );


                alert(
                    "Delivery completed successfully"
                );


                setOtpInputs(
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
                    error.response?.data?.message ||
                    "Invalid OTP"
                );

            } finally {

                setVerifyingOtp(
                    (prev) => ({
                        ...prev,
                        [assignmentId]:
                            false
                    })
                );

            }

        };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div
                className="
                    min-h-screen
                    flex
                    items-center
                    justify-center
                "
            >

                <p className="text-gray-500">
                    Loading deliveries...
                </p>

            </div>
        );

    }


    // =====================================================
    // UI
    // =====================================================

    return (

        <div
            className="
                min-h-screen
                bg-gray-50
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

                <h1
                    className="
                        text-2xl
                        font-bold
                        text-gray-800
                        mb-6
                    "
                >
                    Delivery Dashboard
                </h1>


                {/* =================================================
                    DELIVERY REQUESTS
                ================================================= */}

                {deliveryRequests.length >
                    0 && (

                    <div className="mb-8">

                        <h2
                            className="
                                text-xl
                                font-semibold
                                mb-4
                            "
                        >
                            New Delivery Requests
                        </h2>


                        <div
                            className="
                                grid
                                gap-4
                            "
                        >

                            {deliveryRequests.map(
                                (request) => {

                                    const order =
                                        request?.order;


                                    const shopOrder =
                                        request?.shopOrder;


                                    return (

                                        <div
                                            key={
                                                request._id
                                            }

                                            className="
                                                bg-white
                                                rounded-xl
                                                shadow-sm
                                                border
                                                p-5
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    justify-between
                                                    mb-4
                                                "
                                            >

                                                <div>

                                                    <h3
                                                        className="
                                                            font-semibold
                                                            text-gray-800
                                                        "
                                                    >
                                                        {shopOrder
                                                            ?.shop
                                                            ?.name ||
                                                            "Restaurant"}
                                                    </h3>

                                                    <p
                                                        className="
                                                            text-sm
                                                            text-gray-500
                                                        "
                                                    >
                                                        {order
                                                            ?.deliveryAddress
                                                            ?.address ||
                                                            "Customer location"}
                                                    </p>

                                                </div>


                                                <span
                                                    className="
                                                        text-sm
                                                        font-semibold
                                                        text-orange-500
                                                    "
                                                >
                                                    {
                                                        request.distance
                                                    }{" "}
                                                    m
                                                </span>

                                            </div>


                                            <button
                                                onClick={() =>
                                                    acceptDelivery(
                                                        request._id
                                                    )
                                                }

                                                className="
                                                    w-full
                                                    bg-[#ff4d2d]
                                                    text-white
                                                    py-3
                                                    rounded-lg
                                                    font-semibold
                                                    hover:opacity-90
                                                "
                                            >

                                                Accept Delivery

                                            </button>

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    </div>

                )}


                {/* =================================================
                    ACTIVE DELIVERIES
                ================================================= */}

                <div>

                    <h2
                        className="
                            text-xl
                            font-semibold
                            mb-4
                        "
                    >
                        Active Deliveries
                    </h2>


                    {activeDeliveries.length ===
                        0 ? (

                        <div
                            className="
                                bg-white
                                border
                                rounded-xl
                                p-8
                                text-center
                            "
                        >

                            <FaTruck
                                className="
                                    mx-auto
                                    text-gray-400
                                    text-3xl
                                    mb-3
                                "
                            />

                            <p
                                className="
                                    text-gray-500
                                "
                            >
                                No active deliveries
                            </p>

                        </div>

                    ) : (

                        <div
                            className="
                                space-y-6
                            "
                        >

                            {activeDeliveries.map(
                                ({
                                    order,
                                    shopOrder,
                                    customerPosition
                                }) => {

                                    const assignment =
                                        shopOrder
                                            ?.deliveryAssignment;


                                    const assignmentId =
                                        assignment?._id;


                                    return (

                                        <div
                                            key={
                                                assignmentId ||
                                                shopOrder?._id
                                            }

                                            className="
                                                bg-white
                                                rounded-xl
                                                border
                                                shadow-sm
                                                overflow-hidden
                                            "
                                        >

                                            {/* ==========================
                                                HEADER
                                            ========================== */}

                                            <div
                                                className="
                                                    px-5
                                                    py-4
                                                    border-b
                                                    flex
                                                    items-center
                                                    justify-between
                                                "
                                            >

                                                <div>

                                                    <h3
                                                        className="
                                                            font-semibold
                                                            text-gray-800
                                                        "
                                                    >
                                                        Delivery
                                                    </h3>

                                                    <p
                                                        className="
                                                            text-sm
                                                            text-gray-500
                                                        "
                                                    >
                                                        Order #
                                                        {order?._id
                                                            ?.slice(
                                                                -6
                                                            )}
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
                                                        font-semibold
                                                    "
                                                >
                                                    Out for Delivery
                                                </span>

                                            </div>


                                            {/* ==========================
                                                CUSTOMER
                                            ========================== */}

                                            <div
                                                className="
                                                    px-5
                                                    py-4
                                                "
                                            >

                                                <div
                                                    className="
                                                        flex
                                                        items-start
                                                        gap-3
                                                    "
                                                >

                                                    <FaLocationDot
                                                        className="
                                                            text-[#ff4d2d]
                                                            mt-1
                                                        "
                                                    />

                                                    <div>

                                                        <p
                                                            className="
                                                                font-semibold
                                                                text-gray-800
                                                            "
                                                        >
                                                            Customer
                                                        </p>

                                                        <p
                                                            className="
                                                                text-sm
                                                                text-gray-600
                                                            "
                                                        >
                                                            {
                                                                order
                                                                    ?.deliveryAddress
                                                                    ?.address
                                                            }
                                                        </p>

                                                    </div>

                                                </div>


                                                {order
                                                    ?.user
                                                    ?.mobile && (

                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-3
                                                            mt-3
                                                        "
                                                    >

                                                        <FaPhone
                                                            className="
                                                                text-green-500
                                                            "
                                                        />

                                                        <span>
                                                            {
                                                                order
                                                                    ?.user
                                                                    ?.mobile
                                                            }
                                                        </span>

                                                    </div>

                                                )}

                                            </div>


                                            {/* ==========================
                                                TRACKING MAP
                                            ========================== */}

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
                                                        mx-5
                                                        mb-5
                                                        p-4
                                                        rounded-lg
                                                        bg-gray-50
                                                        text-center
                                                        text-sm
                                                        text-gray-500
                                                    "
                                                >

                                                    Waiting for location...

                                                </div>

                                            )}


                                            {/* ==========================
                                                MARK DELIVERY
                                            ========================== */}

                                            <div
                                                className="
                                                    px-5
                                                    pb-5
                                                "
                                            >

                                                {!otpInputs[
                                                    assignmentId
                                                ] && (

                                                    <button
                                                        onClick={() =>
                                                            markDelivery(
                                                                assignmentId,
                                                                order?._id,
                                                                shopOrder?._id
                                                            )
                                                        }

                                                        disabled={
                                                            markingDelivery[
                                                                assignmentId
                                                            ]
                                                        }

                                                        className="
                                                            w-full
                                                            bg-[#ff4d2d]
                                                            text-white
                                                            py-3
                                                            rounded-lg
                                                            font-semibold
                                                            disabled:opacity-50
                                                        "
                                                    >

                                                        {markingDelivery[
                                                            assignmentId
                                                        ]
                                                            ? "Checking location..."
                                                            : "Mark as Delivered"}

                                                    </button>

                                                )}


                                                {otpInputs[
                                                    assignmentId
                                                ] !==
                                                    undefined && (

                                                    <div
                                                        className="
                                                            mt-4
                                                            p-4
                                                            rounded-xl
                                                            border
                                                            bg-gray-50
                                                        "
                                                    >

                                                        <p
                                                            className="
                                                                font-semibold
                                                                text-gray-800
                                                                mb-2
                                                            "
                                                        >
                                                            Enter Customer OTP
                                                        </p>


                                                        <p
                                                            className="
                                                                text-sm
                                                                text-gray-500
                                                                mb-3
                                                            "
                                                        >
                                                            Ask the customer for the
                                                            6-digit delivery OTP.
                                                        </p>


                                                        <input
                                                            type="text"

                                                            inputMode="numeric"

                                                            maxLength={6}

                                                            value={
                                                                otpInputs[
                                                                    assignmentId
                                                                ] ||
                                                                ""
                                                            }

                                                            onChange={(event) => {

                                                                const value =
                                                                    event.target.value
                                                                        .replace(
                                                                            /\D/g,
                                                                            ""
                                                                        )
                                                                        .slice(
                                                                            0,
                                                                            6
                                                                        );


                                                                setOtpInputs(
                                                                    (prev) => ({
                                                                        ...prev,

                                                                        [assignmentId]:
                                                                            value
                                                                    })
                                                                );

                                                            }}

                                                            placeholder="Enter 6 digit OTP"

                                                            className="
                                                                w-full
                                                                border
                                                                border-gray-300
                                                                rounded-lg
                                                                px-4
                                                                py-3
                                                                outline-none
                                                                focus:border-[#ff4d2d]
                                                            "
                                                        />


                                                        <button
                                                            onClick={() =>
                                                                verifyDeliveryOtp(
                                                                    assignmentId
                                                                )
                                                            }

                                                            disabled={
                                                                verifyingOtp[
                                                                    assignmentId
                                                                ]
                                                            }

                                                            className="
                                                                w-full
                                                                mt-3
                                                                bg-green-600
                                                                text-white
                                                                py-3
                                                                rounded-lg
                                                                font-semibold
                                                                disabled:opacity-50
                                                            "
                                                        >

                                                            {verifyingOtp[
                                                                assignmentId
                                                            ]
                                                                ? "Verifying..."
                                                                : "Verify OTP & Complete Delivery"}

                                                        </button>

                                                    </div>

                                                )}

                                            </div>

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

};


export default DeliveryBoy;