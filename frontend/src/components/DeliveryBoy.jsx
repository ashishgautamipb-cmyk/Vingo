import React, {
    useEffect,
    useState
} from "react";

import axios from "axios";

import {
    serverUrl
} from "../App";


function DeliveryBoy() {

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
    // GET DELIVERY REQUESTS
    // ==================================================

    const getDeliveryRequests =
        async () => {

            try {

                const token =
                    localStorage.getItem(
                        "token"
                    );


                console.log(
                    "DELIVERY BOY TOKEN:",
                    !!token
                );


                if (!token) {

                    setError(
                        "Your login session has expired. Please login again."
                    );

                    setLoading(false);

                    return;
                }


                const result =
                    await axios.get(

                        `${serverUrl}/api/order/delivery-requests`,

                        {
                            withCredentials:
                                true,

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


                // IMPORTANT:
                // Backend returns "requests"
                // not "assignments"

                setAssignments(
                    result.data.requests ||
                    []
                );


                setError("");


            } catch (error) {

                console.log(
                    "Get delivery requests error:",
                    error.response
                        ?.data ||
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
    // POLLING
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


                if (!token) {

                    alert(
                        "Your login session has expired. Please login again."
                    );

                    return;
                }


                const result =
                    await axios.put(

                        `${serverUrl}/api/order/accept-delivery/${assignmentId}`,

                        {},

                        {
                            withCredentials:
                                true,

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


                alert(
                    "Delivery accepted successfully"
                );


            } catch (error) {

                console.log(
                    "Accept delivery error:",
                    error.response
                        ?.data ||
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
    // LOADING
    // ==================================================

    if (loading) {

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


                {/* HEADER */}

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
                        Delivery Requests
                    </h1>


                    <p
                        className="
                            text-gray-500
                            mt-1
                        "
                    >
                        Orders available within 5 KM of your location
                    </p>

                </div>


                {/* ERROR */}

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


                {/* NO REQUEST */}

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


                        <h2
                            className="
                                text-xl
                                font-semibold
                                text-gray-700
                            "
                        >
                            No delivery requests
                        </h2>


                        <p
                            className="
                                text-gray-500
                                mt-2
                            "
                        >
                            You will see a delivery request here when an order is available within 5 KM.
                        </p>


                        <p
                            className="
                                text-sm
                                text-gray-400
                                mt-3
                            "
                        >
                            This page checks for new requests automatically.
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


                                            {
                                                shopOrder
                                                    ?.shopOrderItems
                                                    ?.length > 0

                                                    ? (

                                                        <div
                                                            className="
                                                                space-y-2
                                                            "
                                                        >

                                                            {
                                                                shopOrder
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
                                                                    )
                                                            }

                                                        </div>

                                                    )

                                                    : (

                                                        <p
                                                            className="
                                                                text-gray-500
                                                                text-sm
                                                            "
                                                        >
                                                            No items found
                                                        </p>

                                                    )
                                            }

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

                                            {
                                                acceptingId ===
                                                assignment._id

                                                    ? "Accepting..."

                                                    : "Accept Delivery"
                                            }

                                        </button>

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}

            </div>

        </div>

    );

}


export default DeliveryBoy;