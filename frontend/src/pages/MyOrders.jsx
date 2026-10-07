import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Nav from "../components/Nav";

import useGetMyOrders from "../hooks/useGetMyOrder";

import UserOrderCard from "../components/UserOrderCard";
import OwnerOrderCard from "../components/OwnerOrderCard";


const MyOrders = () => {

    const navigate =
        useNavigate();


    const { userData } =
        useSelector(
            (state) => state.user
        );


    const {
        orders,
        loading
    } = useGetMyOrders();


    const [orderList, setOrderList] =
        useState([]);


    useEffect(() => {

        setOrderList(orders);

    }, [orders]);


    // ======================================================
    // UPDATE LOCAL ORDER
    // ======================================================

    const handleStatusUpdate = (

        orderId,

        shopOrderId,

        status,

        updatedShopOrder

    ) => {

        setOrderList(
            (prevOrders) =>

                prevOrders.map(
                    (order) => {

                        if (
                            order._id !==
                            orderId
                        ) {

                            return order;

                        }


                        return {

                            ...order,

                            shopOrders:

                                order.shopOrders.map(
                                    (shopOrder) => {

                                        if (
                                            shopOrder._id !==
                                            shopOrderId
                                        ) {

                                            return shopOrder;

                                        }


                                        return {

                                            ...shopOrder,

                                            status,

                                            ...(updatedShopOrder ||
                                                {})

                                        };

                                    }
                                )

                        };

                    }
                )
        );

    };


    return (
        <div className="min-h-screen bg-[#fff9f6] pt-[88px] px-4 pb-8">
            <Nav />
            <div className="max-w-[900px] mx-auto">


                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="flex items-center gap-3 mb-5">

                    <button
                        onClick={() =>
                            navigate(-1)
                        }
                        className="text-[#ff4d2d]"
                    >

                        <FaArrowLeft
                            size={16}
                        />

                    </button>


                    <h1 className="text-xl font-bold text-gray-800">

                        My Orders

                    </h1>

                </div>


                {/* ==================================================
                    LOADING
                ================================================== */}

                {loading ? (

                    <div className="text-center py-10 text-gray-500">

                        Loading orders...

                    </div>

                ) : orderList.length === 0 ? (

                    /* ==================================================
                       NO ORDERS
                       ================================================== */

                    <div className="bg-white rounded-xl p-8 text-center shadow-sm">

                        <p className="text-gray-500">

                            No orders found

                        </p>

                    </div>

                ) : (

                    /* ==================================================
                       ORDERS
                       ================================================== */

                    <div className="space-y-5">

                        {orderList.map(
                            (order) =>

                                userData?.role ===
                                "owner"

                                    ? (

                                        <OwnerOrderCard

                                            key={
                                                order._id
                                            }

                                            order={
                                                order
                                            }

                                            onStatusUpdate={
                                                handleStatusUpdate
                                            }

                                        />

                                    )

                                    : (

                                        <UserOrderCard

                                            key={
                                                order._id
                                            }

                                            order={
                                                order
                                            }

                                        />

                                    )

                        )}

                    </div>

                )}

            </div>

        </div>

    );

};


export default MyOrders;