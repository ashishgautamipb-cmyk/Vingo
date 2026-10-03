import {
    useCallback,
    useEffect,
    useState
} from "react";

import axios from "axios";

import { serverUrl } from "../App";


const useGetMyOrders = () => {

    const [
        orders,
        setOrders
    ] = useState([]);

    const [
        loading,
        setLoading
    ] = useState(true);


    // =====================================================
    // FETCH ORDERS
    // =====================================================

    const getMyOrders =
        useCallback(
            async () => {

                try {

                    const token =
                        localStorage.getItem("token");


                    const result =
                        await axios.get(
                            `${serverUrl}/api/order/my-orders`,
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


                    const fetchedOrders =
                        result.data.orders ||
                        [];


                    // =================================================
                    // DEBUG LOGS
                    // =================================================

                    console.log(
                        "========== MY ORDERS =========="
                    );

                    console.log(
                        "MY ORDERS RESPONSE:",
                        result.data
                    );

                    console.log(
                        "NUMBER OF ORDERS:",
                        fetchedOrders.length
                    );


                    fetchedOrders.forEach(
                        (order, index) => {

                            console.log(
                                `ORDER ${index + 1}:`,
                                {
                                    orderId:
                                        order?._id,

                                    deliveryAddress:
                                        order?.deliveryAddress,

                                    shopOrders:
                                        order?.shopOrders
                                }
                            );


                            order?.shopOrders?.forEach(
                                (
                                    shopOrder,
                                    shopIndex
                                ) => {

                                    console.log(
                                        `SHOP ORDER ${
                                            shopIndex + 1
                                        }:`,
                                        {
                                            shopOrderId:
                                                shopOrder?._id,

                                            status:
                                                shopOrder?.status,

                                            deliveryAssignment:
                                                shopOrder
                                                    ?.deliveryAssignment
                                        }
                                    );

                                }
                            );

                        }
                    );


                    console.log(
                        "=============================="
                    );


                    setOrders(
                        fetchedOrders
                    );


                } catch (error) {

                    console.log(
                        "Get my orders error:",
                        error.response?.data ||
                        error.message
                    );

                    setOrders([]);

                } finally {

                    setLoading(false);

                }

            },
            []
        );


    // =====================================================
    // INITIAL FETCH + LIVE POLLING
    // =====================================================

    useEffect(() => {

        getMyOrders();


        const interval =
            setInterval(() => {

                getMyOrders();

            }, 3000);


        return () => {

            clearInterval(
                interval
            );

        };

    }, [
        getMyOrders
    ]);


    return {
        orders,
        loading,
        refetchOrders:
            getMyOrders
    };

};


export default useGetMyOrders;