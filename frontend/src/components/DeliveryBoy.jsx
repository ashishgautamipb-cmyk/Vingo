import React, {
    useEffect,
    useState
} from "react";

import axios from "axios";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    useMap
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import {
    FaLocationDot,
    FaMotorcycle,
    FaCheck,
    FaKey
} from "react-icons/fa6";

import { serverUrl } from "../App";


// =====================================================
// DISTANCE FUNCTION
// =====================================================

const getDistanceInMeters = (
    latitude1,
    longitude1,
    latitude2,
    longitude2
) => {

    const earthRadius = 6371000;

    const lat1 =
        Number(latitude1) *
        Math.PI /
        180;

    const lat2 =
        Number(latitude2) *
        Math.PI /
        180;

    const differenceLatitude =
        (
            Number(latitude2) -
            Number(latitude1)
        ) *
        Math.PI /
        180;

    const differenceLongitude =
        (
            Number(longitude2) -
            Number(longitude1)
        ) *
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
// DELIVERY BOY ICON
// =====================================================

const deliveryIcon = L.divIcon({

    className: "",

    html: `
        <div
            style="
                width:42px;
                height:42px;
                border-radius:50%;
                background:#ff4d2d;
                color:white;
                display:flex;
                align-items:center;
                justify-content:center;
                border:4px solid white;
                box-shadow:0 3px 12px rgba(0,0,0,.3);
                font-size:20px;
            "
        >
            🛵
        </div>
    `,

    iconSize: [
        42,
        42
    ],

    iconAnchor: [
        21,
        21
    ]

});


// =====================================================
// CUSTOMER ICON
// =====================================================

const customerIcon = L.divIcon({

    className: "",

    html: `
        <div
            style="
                width:42px;
                height:42px;
                border-radius:50%;
                background:#2563eb;
                color:white;
                display:flex;
                align-items:center;
                justify-content:center;
                border:4px solid white;
                box-shadow:0 3px 12px rgba(0,0,0,.3);
                font-size:20px;
            "
        >
            📍
        </div>
    `,

    iconSize: [
        42,
        42
    ],

    iconAnchor: [
        21,
        21
    ]

});


// =====================================================
// MAP VIEW UPDATER
// =====================================================

function MapViewUpdater({
    riderPosition,
    customerPosition
}) {

    const map = useMap();

    useEffect(() => {

        if (
            !riderPosition &&
            !customerPosition
        ) {
            return;
        }

        const positions = [];

        if (riderPosition) {
            positions.push(
                riderPosition
            );
        }

        if (customerPosition) {
            positions.push(
                customerPosition
            );
        }

        if (
            positions.length === 1
        ) {

            map.setView(
                positions[0],
                16
            );

            return;
        }

        if (
            positions.length === 2
        ) {

            const bounds =
                L.latLngBounds(
                    positions
                );

            map.fitBounds(
                bounds,
                {
                    padding: [
                        60,
                        60
                    ]
                }
            );
        }

    }, [
        map,
        riderPosition,
        customerPosition
    ]);

    return null;
}


// =====================================================
// DELIVERY MAP
// =====================================================

function DeliveryMap({
    riderPosition,
    customerPosition
}) {

    const defaultCenter = [
        28.6139,
        77.2090
    ];

    return (

        <div
            className="
                w-full
                h-[400px]
                rounded-xl
                overflow-hidden
                border
                border-gray-200
            "
        >

            <MapContainer
                center={
                    riderPosition ||
                    customerPosition ||
                    defaultCenter
                }
                zoom={15}
                scrollWheelZoom={true}
                className="w-full h-full"
            >

                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />


                {/* =========================================
                    DELIVERY BOY
                ========================================= */}

                {riderPosition && (

                    <Marker
                        position={
                            riderPosition
                        }
                        icon={
                            deliveryIcon
                        }
                    >

                        <Popup>
                            <b>
                                Delivery Boy
                            </b>
                        </Popup>

                    </Marker>

                )}


                {/* =========================================
                    CUSTOMER
                ========================================= */}

                {customerPosition && (

                    <Marker
                        position={
                            customerPosition
                        }
                        icon={
                            customerIcon
                        }
                    >

                        <Popup>
                            <b>
                                Customer
                            </b>
                        </Popup>

                    </Marker>

                )}


                {/* =========================================
                    LINE BETWEEN RIDER AND CUSTOMER
                ========================================= */}

                {riderPosition &&
                    customerPosition && (

                    <Polyline
                        positions={[
                            riderPosition,
                            customerPosition
                        ]}
                        pathOptions={{
                            color: "#ff4d2d",
                            weight: 5,
                            opacity: 0.8,
                            dashArray: "10, 10"
                        }}
                    />

                )}


                <MapViewUpdater
                    riderPosition={
                        riderPosition
                    }
                    customerPosition={
                        customerPosition
                    }
                />

            </MapContainer>

        </div>

    );
}


// =====================================================
// DELIVERY BOY COMPONENT
// =====================================================

function DeliveryBoy() {

    const [
        assignments,
        setAssignments
    ] = useState([]);

    const [
        activeDeliveries,
        setActiveDeliveries
    ] = useState([]);

    const [
        riderLocation,
        setRiderLocation
    ] = useState(null);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        otpInputs,
        setOtpInputs
    ] = useState({});

    const [
        processingAssignment,
        setProcessingAssignment
    ] = useState(null);


    // =====================================================
    // GET DELIVERY REQUESTS
    // =====================================================

    const getDeliveryRequests =
        async () => {

            try {

                const result =
                    await axios.get(
                        `${serverUrl}/api/order/delivery-requests`,
                        {
                            withCredentials: true
                        }
                    );

                setAssignments(
                    result.data.requests ||
                    []
                );

            } catch (error) {

                console.log(
                    "Delivery request error:",
                    error.response?.data ||
                    error.message
                );

                setAssignments([]);

            } finally {

                setLoading(false);

            }

        };


    // =====================================================
    // GET ACTIVE DELIVERIES
    // =====================================================

    const getActiveDeliveries =
        async () => {

            try {

                const result =
                    await axios.get(
                        `${serverUrl}/api/order/my-orders`,
                        {
                            withCredentials: true
                        }
                    );

                const orders =
                    result.data.orders ||
                    [];

                const active = [];

                orders.forEach(
                    (order) => {

                        order.shopOrders?.forEach(
                            (shopOrder) => {

                                const assignment =
                                    shopOrder.deliveryAssignment;

                                if (
                                    shopOrder.status ===
                                        "out for delivery" &&
                                    assignment &&
                                    assignment.assignedTo
                                ) {

                                    active.push({
                                        order,
                                        shopOrder
                                    });

                                }

                            }
                        );

                    }
                );

                setActiveDeliveries(
                    active
                );

            } catch (error) {

                console.log(
                    "Active delivery error:",
                    error.response?.data ||
                    error.message
                );

                setActiveDeliveries([]);

            }

        };


    // =====================================================
    // INITIAL LOAD + POLLING
    // =====================================================

    useEffect(() => {

        getDeliveryRequests();

        getActiveDeliveries();

        const interval =
            setInterval(() => {

                getDeliveryRequests();

                getActiveDeliveries();

            }, 5000);

        return () => {

            clearInterval(
                interval
            );

        };

    }, []);


    // =====================================================
    // LIVE RIDER LOCATION
    // =====================================================

    useEffect(() => {

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

                    setRiderLocation([
                        latitude,
                        longitude
                    ]);

                },

                (error) => {

                    console.log(
                        "Location error:",
                        error.message
                    );

                },

                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 5000
                }

            );

        return () => {

            navigator.geolocation.clearWatch(
                watchId
            );

        };

    }, []);


    // =====================================================
    // ACCEPT DELIVERY
    // =====================================================

    const handleAcceptDelivery =
        async (
            assignmentId
        ) => {

            try {

                setProcessingAssignment(
                    assignmentId
                );

                await axios.put(

                    `${serverUrl}/api/order/accept-delivery/${assignmentId}`,

                    {},

                    {
                        withCredentials: true
                    }

                );

                setAssignments(
                    (previous) =>
                        previous.filter(
                            (item) =>
                                String(
                                    item._id
                                ) !==
                                String(
                                    assignmentId
                                )
                        )
                );

                await getActiveDeliveries();

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
                    error.response?.data?.message ||
                    "Failed to accept delivery"
                );

            } finally {

                setProcessingAssignment(
                    null
                );

            }

        };


    // =====================================================
    // MARK AS DELIVERED
    //
    // IMPORTANT:
    // This does NOT complete the order immediately.
    // Backend generates OTP.
    // =====================================================

    const handleMarkAsDelivered =
        async (
            assignmentId
        ) => {

            try {

                setProcessingAssignment(
                    assignmentId
                );

                await axios.put(

                    `${serverUrl}/api/order/mark-delivery/${assignmentId}`,

                    {},

                    {
                        withCredentials: true
                    }

                );

                await getActiveDeliveries();

                alert(
                    "OTP generated. Ask the customer for the delivery OTP."
                );

            } catch (error) {

                console.log(
                    "Mark delivery error:",
                    error.response?.data ||
                    error.message
                );

                alert(
                    error.response?.data?.message ||
                    "You are not close enough to the customer."
                );

            } finally {

                setProcessingAssignment(
                    null
                );

            }

        };


    // =====================================================
    // OTP INPUT
    // =====================================================

    const handleOtpChange =
        (
            assignmentId,
            value
        ) => {

            const cleanValue =
                value
                    .replace(/\D/g, "")
                    .slice(0, 6);

            setOtpInputs(
                (previous) => ({
                    ...previous,
                    [assignmentId]:
                        cleanValue
                })
            );

        };


    // =====================================================
    // VERIFY OTP
    // =====================================================

    const handleVerifyOtp =
        async (
            assignmentId
        ) => {

            const otp =
                otpInputs[
                    assignmentId
                ] || "";

            if (
                otp.length !== 6
            ) {

                alert(
                    "Enter the 6 digit OTP."
                );

                return;

            }

            try {

                setProcessingAssignment(
                    assignmentId
                );

                await axios.put(

                    `${serverUrl}/api/order/verify-delivery-otp/${assignmentId}`,

                    {
                        otp
                    },

                    {
                        withCredentials: true
                    }

                );

                setOtpInputs(
                    (previous) => {

                        const updated = {
                            ...previous
                        };

                        delete updated[
                            assignmentId
                        ];

                        return updated;

                    }
                );

                await getActiveDeliveries();

                await getDeliveryRequests();

                alert(
                    "Delivery completed successfully."
                );

            } catch (error) {

                console.log(
                    "Verify OTP error:",
                    error.response?.data ||
                    error.message
                );

                alert(
                    error.response?.data?.message ||
                    "Invalid OTP."
                );

            } finally {

                setProcessingAssignment(
                    null
                );

            }

        };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div
            className="
                w-full
                max-w-[1000px]
                px-4
                pb-10
            "
        >

            {/* =============================================
                HEADER
            ============================================== */}

            <div
                className="
                    mb-6
                    flex
                    items-center
                    justify-between
                "
            >

                <div>

                    <h1
                        className="
                            text-2xl
                            font-bold
                            text-gray-800
                        "
                    >
                        Delivery Dashboard
                    </h1>

                    <p
                        className="
                            text-sm
                            text-gray-500
                            mt-1
                        "
                    >
                        Manage your deliveries
                    </p>

                </div>

            </div>


            {/* =============================================
                ACTIVE DELIVERIES
            ============================================== */}

            {activeDeliveries.length >
                0 && (

                <div className="mb-8">

                    <h2
                        className="
                            text-lg
                            font-bold
                            text-gray-800
                            mb-4
                        "
                    >
                        Active Delivery
                    </h2>


                    <div
                        className="
                            flex
                            flex-col
                            gap-6
                        "
                    >

                        {activeDeliveries.map(
                            ({
                                order,
                                shopOrder
                            }) => {

                                const assignment =
                                    shopOrder.deliveryAssignment;

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

                                const customerPosition =
                                    Number.isFinite(
                                        customerLatitude
                                    ) &&
                                    Number.isFinite(
                                        customerLongitude
                                    )
                                        ? [
                                            customerLatitude,
                                            customerLongitude
                                        ]
                                        : null;


                                let distance = null;

                                if (
                                    riderLocation &&
                                    customerPosition
                                ) {

                                    distance =
                                        getDistanceInMeters(
                                            riderLocation[0],
                                            riderLocation[1],
                                            customerPosition[0],
                                            customerPosition[1]
                                        );

                                }


                                const isNearCustomer =
                                    distance !== null &&
                                    distance <= 200;


                                const otpGenerated =
                                    Boolean(
                                        shopOrder.deliveryOtp
                                    );


                                return (

                                    <div
                                        key={
                                            String(
                                                order._id
                                            ) +
                                            String(
                                                shopOrder._id
                                            )
                                        }
                                        className="
                                            bg-white
                                            rounded-2xl
                                            shadow-sm
                                            border
                                            border-gray-100
                                            overflow-hidden
                                        "
                                    >

                                        {/* =================================
                                            DELIVERY INFO
                                        ================================== */}

                                        <div
                                            className="
                                                p-5
                                                border-b
                                                border-gray-100
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    justify-between
                                                    gap-4
                                                    flex-wrap
                                                "
                                            >

                                                <div>

                                                    <p
                                                        className="
                                                            text-xs
                                                            text-gray-400
                                                        "
                                                    >
                                                        Restaurant
                                                    </p>

                                                    <h3
                                                        className="
                                                            text-lg
                                                            font-bold
                                                            text-gray-800
                                                        "
                                                    >
                                                        {
                                                            shopOrder
                                                                .shop
                                                                ?.name ||
                                                            "Restaurant"
                                                        }
                                                    </h3>

                                                </div>


                                                <div
                                                    className="
                                                        px-3
                                                        py-1.5
                                                        rounded-full
                                                        bg-orange-50
                                                        text-[#ff4d2d]
                                                        text-xs
                                                        font-semibold
                                                        h-fit
                                                    "
                                                >
                                                    Out for Delivery
                                                </div>

                                            </div>


                                            <div
                                                className="
                                                    mt-4
                                                    grid
                                                    grid-cols-1
                                                    sm:grid-cols-2
                                                    gap-3
                                                "
                                            >

                                                <div
                                                    className="
                                                        bg-gray-50
                                                        rounded-xl
                                                        p-3
                                                    "
                                                >

                                                    <p
                                                        className="
                                                            text-[10px]
                                                            text-gray-400
                                                        "
                                                    >
                                                        Customer
                                                    </p>

                                                    <p
                                                        className="
                                                            text-sm
                                                            font-semibold
                                                            text-gray-800
                                                            mt-1
                                                        "
                                                    >
                                                        {
                                                            order
                                                                .user
                                                                ?.fullName ||
                                                            "Customer"
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
                                                            order
                                                                .user
                                                                ?.mobile ||
                                                            ""
                                                        }
                                                    </p>

                                                </div>


                                                <div
                                                    className="
                                                        bg-gray-50
                                                        rounded-xl
                                                        p-3
                                                    "
                                                >

                                                    <p
                                                        className="
                                                            text-[10px]
                                                            text-gray-400
                                                        "
                                                    >
                                                        Delivery Address
                                                    </p>

                                                    <p
                                                        className="
                                                            text-xs
                                                            text-gray-700
                                                            mt-1
                                                            leading-5
                                                        "
                                                    >
                                                        {
                                                            order
                                                                .deliveryAddress
                                                                ?.text ||
                                                            "Address unavailable"
                                                        }
                                                    </p>

                                                </div>

                                            </div>

                                        </div>


                                        {/* =================================
                                            MAP
                                        ================================== */}

                                        <div className="p-4">

                                            <DeliveryMap
                                                riderPosition={
                                                    riderLocation
                                                }
                                                customerPosition={
                                                    customerPosition
                                                }
                                            />


                                            {/* =============================
                                                DISTANCE
                                            ============================== */}

                                            <div
                                                className="
                                                    mt-4
                                                    flex
                                                    items-center
                                                    justify-between
                                                    gap-3
                                                    bg-gray-50
                                                    rounded-xl
                                                    p-4
                                                "
                                            >

                                                <div
                                                    className="
                                                        flex
                                                        items-center
                                                        gap-3
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            w-10
                                                            h-10
                                                            rounded-full
                                                            bg-orange-100
                                                            flex
                                                            items-center
                                                            justify-center
                                                        "
                                                    >

                                                        <FaLocationDot
                                                            className="
                                                                text-[#ff4d2d]
                                                            "
                                                        />

                                                    </div>


                                                    <div>

                                                        <p
                                                            className="
                                                                text-xs
                                                                text-gray-400
                                                            "
                                                        >
                                                            Distance from customer
                                                        </p>

                                                        <p
                                                            className="
                                                                text-lg
                                                                font-bold
                                                                text-gray-800
                                                            "
                                                        >

                                                            {distance !== null
                                                                ? `${Math.round(distance)} m`
                                                                : "Calculating..."}

                                                        </p>

                                                    </div>

                                                </div>


                                                {isNearCustomer && (

                                                    <div
                                                        className="
                                                            px-3
                                                            py-1.5
                                                            rounded-full
                                                            bg-green-100
                                                            text-green-700
                                                            text-xs
                                                            font-bold
                                                        "
                                                    >
                                                        Within 200m
                                                    </div>

                                                )}

                                            </div>


                                            {/* =================================
                                                MARK AS DELIVERED
                                            ================================== */}

                                            {!otpGenerated && (

                                                <div
                                                    className="
                                                        mt-4
                                                    "
                                                >

                                                    {isNearCustomer ? (

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleMarkAsDelivered(
                                                                    assignment?._id
                                                                )
                                                            }
                                                            disabled={
                                                                processingAssignment ===
                                                                assignment?._id
                                                            }
                                                            className="
                                                                w-full
                                                                py-3
                                                                rounded-xl
                                                                bg-[#ff4d2d]
                                                                hover:bg-orange-600
                                                                disabled:opacity-60
                                                                text-white
                                                                text-sm
                                                                font-bold
                                                                transition
                                                            "
                                                        >

                                                            {processingAssignment ===
                                                            assignment?._id
                                                                ? "Generating OTP..."
                                                                : "Mark as Delivered"}

                                                        </button>

                                                    ) : (

                                                        <div
                                                            className="
                                                                bg-blue-50
                                                                border
                                                                border-blue-100
                                                                rounded-xl
                                                                p-4
                                                                text-center
                                                            "
                                                        >

                                                            <p
                                                                className="
                                                                    text-sm
                                                                    font-semibold
                                                                    text-blue-800
                                                                "
                                                            >
                                                                Reach within 200 meters
                                                            </p>

                                                            <p
                                                                className="
                                                                    text-xs
                                                                    text-blue-600
                                                                    mt-1
                                                                "
                                                            >
                                                                The Mark as Delivered button will appear automatically.
                                                            </p>

                                                        </div>

                                                    )}

                                                </div>

                                            )}


                                            {/* =================================
                                                OTP VERIFICATION
                                            ================================== */}

                                            {otpGenerated && (

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

                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-3
                                                            mb-3
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                w-10
                                                                h-10
                                                                rounded-full
                                                                bg-green-100
                                                                flex
                                                                items-center
                                                                justify-center
                                                            "
                                                        >

                                                            <FaKey
                                                                className="
                                                                    text-green-600
                                                                "
                                                            />

                                                        </div>


                                                        <div>

                                                            <p
                                                                className="
                                                                    text-sm
                                                                    font-bold
                                                                    text-green-800
                                                                "
                                                            >
                                                                Delivery OTP Required
                                                            </p>

                                                            <p
                                                                className="
                                                                    text-xs
                                                                    text-green-700
                                                                    mt-1
                                                                "
                                                            >
                                                                Ask the customer for the 6 digit OTP.
                                                            </p>

                                                        </div>

                                                    </div>


                                                    <div
                                                        className="
                                                            flex
                                                            gap-2
                                                            flex-col
                                                            sm:flex-row
                                                        "
                                                    >

                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            maxLength={6}
                                                            value={
                                                                otpInputs[
                                                                    assignment?._id
                                                                ] ||
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                handleOtpChange(
                                                                    assignment?._id,
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Enter 6 digit OTP"
                                                            className="
                                                                flex-1
                                                                border
                                                                border-gray-300
                                                                rounded-xl
                                                                px-4
                                                                py-3
                                                                text-sm
                                                                outline-none
                                                                focus:border-[#ff4d2d]
                                                            "
                                                        />


                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleVerifyOtp(
                                                                    assignment?._id
                                                                )
                                                            }
                                                            disabled={
                                                                processingAssignment ===
                                                                assignment?._id
                                                            }
                                                            className="
                                                                px-6
                                                                py-3
                                                                rounded-xl
                                                                bg-green-600
                                                                hover:bg-green-700
                                                                disabled:opacity-60
                                                                text-white
                                                                text-sm
                                                                font-bold
                                                            "
                                                        >

                                                            {processingAssignment ===
                                                            assignment?._id
                                                                ? "Verifying..."
                                                                : "Verify OTP"}

                                                        </button>

                                                    </div>

                                                </div>

                                            )}

                                        </div>

                                    </div>

                                );

                            }

                        )}

                    </div>

                </div>

            )}


            {/* =============================================
                DELIVERY REQUESTS
            ============================================== */}

            <div>

                <h2
                    className="
                        text-lg
                        font-bold
                        text-gray-800
                        mb-4
                    "
                >
                    Delivery Requests
                </h2>


                {loading ? (

                    <div
                        className="
                            bg-white
                            rounded-xl
                            p-8
                            text-center
                        "
                    >

                        <p
                            className="
                                text-sm
                                text-gray-500
                            "
                        >
                            Loading delivery requests...
                        </p>

                    </div>

                ) : assignments.length === 0 ? (

                    <div
                        className="
                            bg-white
                            rounded-xl
                            p-8
                            text-center
                            border
                            border-gray-100
                        "
                    >

                        <div
                            className="
                                w-14
                                h-14
                                rounded-full
                                bg-orange-50
                                mx-auto
                                flex
                                items-center
                                justify-center
                            "
                        >

                            <FaMotorcycle
                                className="
                                    text-[#ff4d2d]
                                "
                                size={22}
                            />

                        </div>

                        <p
                            className="
                                text-sm
                                font-semibold
                                text-gray-800
                                mt-3
                            "
                        >
                            No delivery requests
                        </p>

                        <p
                            className="
                                text-xs
                                text-gray-500
                                mt-1
                            "
                        >
                            New delivery requests will appear here.
                        </p>

                    </div>

                ) : (

                    <div
                        className="
                            grid
                            grid-cols-1
                            md:grid-cols-2
                            gap-4
                        "
                    >

                        {assignments.map(
                            (assignment) => (

                                <div
                                    key={
                                        assignment._id
                                    }
                                    className="
                                        bg-white
                                        rounded-xl
                                        border
                                        border-gray-100
                                        shadow-sm
                                        p-4
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            justify-between
                                            items-start
                                            gap-3
                                        "
                                    >

                                        <div>

                                            <p
                                                className="
                                                    text-[10px]
                                                    text-gray-400
                                                "
                                            >
                                                Restaurant
                                            </p>

                                            <h3
                                                className="
                                                    text-base
                                                    font-bold
                                                    text-gray-800
                                                "
                                            >
                                                {
                                                    assignment
                                                        .shop
                                                        ?.name ||
                                                    "Restaurant"
                                                }
                                            </h3>

                                        </div>


                                        <span
                                            className="
                                                px-2
                                                py-1
                                                rounded-full
                                                bg-orange-50
                                                text-[#ff4d2d]
                                                text-[10px]
                                                font-semibold
                                            "
                                        >
                                            {assignment.distance !==
                                            undefined
                                                ? `${assignment.distance}m`
                                                : "Nearby"}
                                        </span>

                                    </div>


                                    <div
                                        className="
                                            mt-4
                                            bg-gray-50
                                            rounded-lg
                                            p-3
                                        "
                                    >

                                        <p
                                            className="
                                                text-xs
                                                font-semibold
                                                text-gray-800
                                            "
                                        >
                                            Customer
                                        </p>

                                        <p
                                            className="
                                                text-xs
                                                text-gray-500
                                                mt-1
                                            "
                                        >
                                            {
                                                assignment
                                                    .order
                                                    ?.user
                                                    ?.fullName ||
                                                "Customer"
                                            }
                                        </p>

                                    </div>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleAcceptDelivery(
                                                assignment._id
                                            )
                                        }
                                        disabled={
                                            processingAssignment ===
                                            assignment._id
                                        }
                                        className="
                                            w-full
                                            mt-4
                                            py-2.5
                                            rounded-lg
                                            bg-[#ff4d2d]
                                            hover:bg-orange-600
                                            disabled:opacity-60
                                            text-white
                                            text-sm
                                            font-semibold
                                        "
                                    >

                                        {processingAssignment ===
                                        assignment._id
                                            ? "Accepting..."
                                            : "Accept Delivery"}

                                    </button>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>

        </div>

    );

}

export default DeliveryBoy;