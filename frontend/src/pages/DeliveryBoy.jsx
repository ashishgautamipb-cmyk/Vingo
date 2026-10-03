import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import axios from "axios";

import { useSelector } from "react-redux";

import {
    FaLocationDot,
    FaTruck,
    FaPhone,
    FaCheck
} from "react-icons/fa6";

import { serverUrl } from "../App";

import useGetMyOrders
    from "../hooks/useGetMyOrder";

import DeliveryTrackingMap
    from "../components/DeliveryTrackingMap";


// =====================================================
// DISTANCE CALCULATOR
// =====================================================

const calculateDistance = (
    position1,
    position2
) => {

    if (
        !Array.isArray(position1) ||
        !Array.isArray(position2)
    ) {
        return null;
    }

    if (
        position1.length !== 2 ||
        position2.length !== 2
    ) {
        return null;
    }

    const latitude1 = Number(position1[0]);
    const longitude1 = Number(position1[1]);

    const latitude2 = Number(position2[0]);
    const longitude2 = Number(position2[1]);

    if (
        !Number.isFinite(latitude1) ||
        !Number.isFinite(longitude1) ||
        !Number.isFinite(latitude2) ||
        !Number.isFinite(longitude2)
    ) {
        return null;
    }

    const earthRadius = 6371000;

    const differenceLatitude =
        (latitude2 - latitude1) *
        Math.PI /
        180;

    const differenceLongitude =
        (longitude2 - longitude1) *
        Math.PI /
        180;

    const lat1 =
        latitude1 *
        Math.PI /
        180;

    const lat2 =
        latitude2 *
        Math.PI /
        180;

    const a =
        Math.sin(
            differenceLatitude / 2
        ) *
        Math.sin(
            differenceLatitude / 2
        ) +

        Math.cos(lat1) *
        Math.cos(lat2) *

        Math.sin(
            differenceLongitude / 2
        ) *
        Math.sin(
            differenceLongitude / 2
        );

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return earthRadius * c;
};


// =====================================================
// DELIVERY BOY
// =====================================================

const DeliveryBoy = () => {

    const {
        userData
    } = useSelector(
        (state) => state.user
    );


    // =====================================================
    // ORDERS
    // =====================================================

    const {
        orders,
        loading,
        refetchOrders
    } = useGetMyOrders();


    // =====================================================
    // STATES
    // =====================================================

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
        otpGenerated,
        setOtpGenerated
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
    // USER DEBUG
    // =====================================================

    useEffect(() => {

        console.log(
            "========== DELIVERY BOY =========="
        );

        console.log(
            "USER:",
            {
                id: userData?._id,
                role: userData?.role,
                fullName: userData?.fullName
            }
        );

        console.log(
            "ORDERS:",
            orders?.length || 0
        );

        console.log(
            "=================================="
        );

    }, [
        userData,
        orders
    ]);


    // =====================================================
    // DELIVERY REQUESTS
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

                        console.log(
                            "DELIVERY REQUEST: TOKEN NOT FOUND"
                        );

                        return;

                    }


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
                        result.data?.requests ||
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

            clearInterval(interval);

        };

    }, []);


    // =====================================================
    // LOCATION FROM REDUX
    // =====================================================

    useEffect(() => {

        const coordinates =
            userData
                ?.location
                ?.coordinates;


        console.log(
            "REDUX USER LOCATION:",
            coordinates
        );


        if (
            !Array.isArray(coordinates) ||
            coordinates.length !== 2
        ) {

            console.log(
                "REDUX LOCATION NOT AVAILABLE"
            );

            return;

        }


        const longitude =
            Number(
                coordinates[0]
            );

        const latitude =
            Number(
                coordinates[1]
            );


        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {

            console.log(
                "REDUX LOCATION INVALID:",
                coordinates
            );

            return;

        }


        const position = [
            latitude,
            longitude
        ];


        console.log(
            "SETTING DELIVERY BOY POSITION FROM REDUX:",
            position
        );


        setDeliveryBoyPosition(
            position
        );

    }, [
        userData
    ]);


    // =====================================================
    // LIVE GPS
    // =====================================================

    useEffect(() => {

        if (!userData) {

            console.log(
                "GPS: USER DATA NOT READY"
            );

            return;

        }


        if (
            userData.role !==
            "deliveryBoy"
        ) {

            console.log(
                "GPS: USER IS NOT DELIVERY BOY"
            );

            return;

        }


        if (
            !navigator.geolocation
        ) {

            console.log(
                "GPS: GEOLOCATION NOT SUPPORTED"
            );

            return;

        }


        console.log(
            "STARTING DELIVERY BOY GPS..."
        );


        const updatePosition =
            (position) => {

                const latitude =
                    Number(
                        position.coords.latitude
                    );

                const longitude =
                    Number(
                        position.coords.longitude
                    );


                if (
                    !Number.isFinite(latitude) ||
                    !Number.isFinite(longitude)
                ) {

                    console.log(
                        "GPS: INVALID POSITION"
                    );

                    return;

                }


                const newPosition = [
                    latitude,
                    longitude
                ];


                console.log(
                    "DELIVERY BOY GPS POSITION:",
                    newPosition
                );


                setDeliveryBoyPosition(
                    newPosition
                );

            };


        const handleError =
            (error) => {

                console.log(
                    "DELIVERY BOY GPS ERROR:",
                    error.message
                );

            };


        navigator.geolocation.getCurrentPosition(
            updatePosition,
            handleError,
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 5000
            }
        );


        const watchId =
            navigator.geolocation.watchPosition(
                updatePosition,
                handleError,
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 5000
                }
            );


        return () => {

            navigator.geolocation.clearWatch(
                watchId
            );

        };

    }, [
        userData
    ]);


    // =====================================================
    // ACCEPT DELIVERY
    // =====================================================

    const acceptDelivery =
        async (
            assignmentId
        ) => {

            try {

                const token =
                    localStorage.getItem(
                        "token"
                    );


                if (!token) {

                    alert(
                        "Delivery boy token not found"
                    );

                    return;

                }


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
                !order?.shopOrders ||
                !Array.isArray(
                    order.shopOrders
                )
            ) {

                return null;

            }


            return (
                order.shopOrders.find(
                    (shopOrder) => {

                        const assignment =
                            shopOrder
                                ?.deliveryAssignment;


                        if (!assignment) {

                            return false;

                        }


                        const isAssigned =
                            assignment.status ===
                            "assigned";


                        const isOutForDelivery =
                            shopOrder.status ===
                            "out for delivery";


                        return (
                            isAssigned &&
                            isOutForDelivery
                        );

                    }
                ) || null
            );

        };


    // =====================================================
    // ACTIVE DELIVERIES
    // =====================================================

    const activeDeliveries =
        useMemo(() => {

            if (
                !Array.isArray(orders)
            ) {

                return [];

            }


            const deliveries =
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

                                console.log(
                                    "CUSTOMER COORDINATES INVALID:",
                                    {
                                        orderId:
                                            order?._id,

                                        latitude,

                                        longitude
                                    }
                                );


                                return null;

                            }


                            const customerPosition = [
                                latitude,
                                longitude
                            ];


                            const distance =
                                calculateDistance(
                                    customerPosition,
                                    deliveryBoyPosition
                                );


                            return {
                                order,
                                shopOrder,
                                customerPosition,
                                distance
                            };

                        }
                    )
                    .filter(Boolean);


            console.log(
                "ACTIVE DELIVERIES CALCULATED:",
                deliveries
            );


            return deliveries;

        }, [
            orders,
            deliveryBoyPosition
        ]);


    // =====================================================
    // CURRENT DELIVERY
    // =====================================================

    const currentDelivery =
        activeDeliveries.length > 0
            ? activeDeliveries[0]
            : null;


    // =====================================================
    // DELIVERY UI DEBUG
    // =====================================================

    useEffect(() => {

        console.log(
            "=========================================="
        );

        console.log(
            "========== DELIVERY UI =========="
        );

        console.log(
            "ORDERS:",
            orders?.length || 0
        );

        console.log(
            "ACTIVE DELIVERIES:",
            activeDeliveries.length
        );

        console.log(
            "DELIVERY BOY POSITION:",
            deliveryBoyPosition
        );

        console.log(
            "CURRENT MAP DELIVERY:",
            currentDelivery
        );


        console.log(
            "MAP CUSTOMER POSITION:",
            currentDelivery
                ?.customerPosition ||
            null
        );


        console.log(
            "MAP SHOULD RENDER:",
            Boolean(
                currentDelivery &&
                Array.isArray(
                    currentDelivery.customerPosition
                ) &&
                currentDelivery
                    .customerPosition
                    .length === 2 &&
                Array.isArray(
                    deliveryBoyPosition
                ) &&
                deliveryBoyPosition.length === 2
            )
        );


        console.log(
            "=========================================="
        );

    }, [
        orders,
        activeDeliveries,
        deliveryBoyPosition,
        currentDelivery
    ]);


    // =====================================================
    // MARK DELIVERY
    // =====================================================

    const markDelivery =
        async (
            assignmentId
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


                if (!token) {

                    alert(
                        "Delivery boy token not found"
                    );

                    return;

                }


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

                    setOtpGenerated(
                        (prev) => ({
                            ...prev,

                            [assignmentId]:
                                true
                        })
                    );


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
    // VERIFY OTP
    // =====================================================

    const verifyDeliveryOtp =
        async (
            assignmentId
        ) => {

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


                if (!token) {

                    alert(
                        "Delivery boy token not found"
                    );

                    return;

                }


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

                {/* =================================================
                    TITLE
                ================================================= */}

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

                {deliveryRequests.length > 0 && (

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


                        <div className="grid gap-4">

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
                                                    gap-4
                                                "
                                            >

                                                <div>

                                                    <h3
                                                        className="
                                                            font-semibold
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
                                                        "
                                                    >
                                                        {
                                                            order
                                                                ?.deliveryAddress
                                                                ?.text ||
                                                            "Customer location"
                                                        }
                                                    </p>

                                                </div>


                                                <span
                                                    className="
                                                        text-sm
                                                        font-semibold
                                                        text-orange-500
                                                        whitespace-nowrap
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


                    {/* =================================================
                        MAP
                    ================================================= */}

                    {currentDelivery &&
                        Array.isArray(
                            currentDelivery.customerPosition
                        ) &&
                        currentDelivery.customerPosition.length ===
                        2 &&
                        Array.isArray(
                            deliveryBoyPosition
                        ) &&
                        deliveryBoyPosition.length ===
                        2 ? (

                        <div
                            className="
                                bg-white
                                rounded-xl
                                border
                                shadow-sm
                                overflow-hidden
                                mb-6
                            "
                        >

                            <div
                                className="
                                    px-5
                                    py-4
                                    border-b
                                "
                            >

                                <h3
                                    className="
                                        font-semibold
                                        text-gray-800
                                    "
                                >
                                    Live Delivery Tracking
                                </h3>


                                <p
                                    className="
                                        text-sm
                                        text-gray-500
                                        mt-1
                                    "
                                >
                                    Your location and customer
                                    location
                                </p>

                            </div>


                            <div className="p-4">

                                <DeliveryTrackingMap
                                    customerPosition={
                                        currentDelivery
                                            .customerPosition
                                    }

                                    deliveryBoyPosition={
                                        deliveryBoyPosition
                                    }
                                />

                            </div>

                        </div>

                    ) : (

                        activeDeliveries.length > 0 && (

                            <div
                                className="
                                    bg-white
                                    border
                                    rounded-xl
                                    p-6
                                    mb-6
                                    text-center
                                "
                            >

                                <FaLocationDot
                                    className="
                                        mx-auto
                                        text-gray-400
                                        text-3xl
                                        mb-3
                                    "
                                />


                                <p
                                    className="
                                        text-gray-600
                                        font-medium
                                    "
                                >
                                    Getting your live location...
                                </p>


                                <p
                                    className="
                                        text-sm
                                        text-gray-400
                                        mt-1
                                    "
                                >
                                    Please allow location access
                                    in your browser.
                                </p>

                            </div>

                        )

                    )}


                    {/* =================================================
                        NO ACTIVE DELIVERIES
                    ================================================= */}

                    {activeDeliveries.length === 0 ? (

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


                            <p className="text-gray-500">
                                No active deliveries
                            </p>

                        </div>

                    ) : (

                        <div className="space-y-6">

                            {activeDeliveries.map(
                                ({
                                    order,
                                    shopOrder,
                                    distance
                                }) => {

                                    const assignment =
                                        shopOrder
                                            ?.deliveryAssignment;


                                    const assignmentId =
                                        assignment?._id;


                                    const within200Meters =
                                        distance !== null &&
                                        distance <= 200;


                                    const backendOtpActive =
                                        Boolean(
                                            shopOrder
                                                ?.deliveryOtpExpiresAt
                                        ) &&
                                        shopOrder
                                            ?.deliveryOtpVerified !==
                                        true;


                                    const hasOtp =
                                        otpGenerated[
                                            assignmentId
                                        ] === true ||
                                        backendOtpActive;


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

                                            {/* HEADER */}

                                            <div
                                                className="
                                                    px-5
                                                    py-4
                                                    border-b
                                                    flex
                                                    items-center
                                                    justify-between
                                                    gap-4
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
                                                        {order?._id?.slice(
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
                                                        whitespace-nowrap
                                                    "
                                                >
                                                    Out for Delivery
                                                </span>

                                            </div>


                                            {/* CUSTOMER */}

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
                                                                    ?.text ||
                                                                "Customer location"
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


                                            {/* DISTANCE */}

                                            {distance !== null && (

                                                <div
                                                    className={`
                                                        mx-5
                                                        mb-5
                                                        p-4
                                                        rounded-xl
                                                        text-center
                                                        border
                                                        ${
                                                            within200Meters
                                                                ? "bg-green-50 border-green-200"
                                                                : "bg-orange-50 border-orange-200"
                                                        }
                                                    `}
                                                >

                                                    <p
                                                        className="
                                                            text-sm
                                                            text-gray-500
                                                        "
                                                    >
                                                        Distance from customer
                                                    </p>


                                                    <p
                                                        className="
                                                            text-2xl
                                                            font-bold
                                                            mt-1
                                                        "
                                                    >

                                                        {distance >= 1000

                                                            ? `${(
                                                                distance /
                                                                1000
                                                            ).toFixed(
                                                                2
                                                            )} km`

                                                            : `${Math.round(
                                                                distance
                                                            )} m`
                                                        }

                                                    </p>


                                                    {within200Meters ? (

                                                        <p
                                                            className="
                                                                mt-2
                                                                text-green-600
                                                                font-semibold
                                                                flex
                                                                items-center
                                                                justify-center
                                                                gap-2
                                                            "
                                                        >

                                                            <FaCheck />

                                                            You are within
                                                            200 metres

                                                        </p>

                                                    ) : (

                                                        <p
                                                            className="
                                                                mt-2
                                                                text-orange-600
                                                            "
                                                        >

                                                            Move within
                                                            200 metres to
                                                            mark delivery

                                                        </p>

                                                    )}

                                                </div>

                                            )}


                                            {/* ACTIONS */}

                                            <div
                                                className="
                                                    px-5
                                                    py-5
                                                "
                                            >

                                                {!hasOtp && (

                                                    <button
                                                        onClick={() =>
                                                            markDelivery(
                                                                assignmentId
                                                            )
                                                        }
                                                        disabled={
                                                            !within200Meters ||
                                                            markingDelivery[
                                                                assignmentId
                                                            ]
                                                        }
                                                        className={`
                                                            w-full
                                                            py-3
                                                            rounded-lg
                                                            font-semibold
                                                            ${
                                                                within200Meters
                                                                    ? "bg-[#ff4d2d] text-white"
                                                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                            }
                                                        `}
                                                    >

                                                        {markingDelivery[
                                                            assignmentId
                                                        ]

                                                            ? "Checking location..."

                                                            : within200Meters
                                                                ? "Mark as Delivered"
                                                                : "Move within 200 metres"}

                                                    </button>

                                                )}


                                                {/* OTP */}

                                                {hasOtp && (

                                                    <div
                                                        className="
                                                            p-5
                                                            rounded-xl
                                                            border
                                                            border-green-200
                                                            bg-green-50
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                flex
                                                                items-center
                                                                gap-2
                                                                mb-2
                                                            "
                                                        >

                                                            <FaCheck
                                                                className="
                                                                    text-green-600
                                                                "
                                                            />

                                                            <p
                                                                className="
                                                                    font-semibold
                                                                    text-green-700
                                                                "
                                                            >
                                                                Customer location
                                                                reached
                                                            </p>

                                                        </div>


                                                        <p
                                                            className="
                                                                text-sm
                                                                text-gray-600
                                                                mb-4
                                                            "
                                                        >
                                                            Ask the customer
                                                            for the 6-digit OTP.
                                                        </p>


                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            autoComplete="one-time-code"
                                                            maxLength={6}
                                                            value={
                                                                otpInputs[
                                                                    assignmentId
                                                                ] ||
                                                                ""
                                                            }
                                                            onChange={(
                                                                event
                                                            ) => {

                                                                const value =
                                                                    event
                                                                        .target
                                                                        .value
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
                                                                bg-white
                                                                outline-none
                                                                focus:border-[#ff4d2d]
                                                                text-center
                                                                tracking-[0.4em]
                                                                text-lg
                                                                font-semibold
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
                                                                ] ||
                                                                (
                                                                    otpInputs[
                                                                        assignmentId
                                                                    ] ||
                                                                    ""
                                                                ).length !==
                                                                6
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