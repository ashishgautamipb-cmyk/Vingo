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
                                        order?.deliveryAddress
                                }
                            );


                            order?.shopOrders?.forEach(
                                (
                                    shopOrder
                                ) => {

                                    console.log(
                                        "========== DELIVERY DATA =========="
                                    );

                                    console.log(
                                        "ORDER ID:",
                                        order?._id
                                    );

                                    console.log(
                                        "SHOP ORDER ID:",
                                        shopOrder?._id
                                    );

                                    console.log(
                                        "SHOP ORDER STATUS:",
                                        shopOrder?.status
                                    );

                                    console.log(
                                        "ASSIGNMENT ID:",
                                        shopOrder
                                            ?.deliveryAssignment
                                            ?._id
                                    );

                                    console.log(
                                        "ASSIGNMENT STATUS:",
                                        shopOrder
                                            ?.deliveryAssignment
                                            ?.status
                                    );

                                    console.log(
                                        "CUSTOMER LATITUDE:",
                                        order
                                            ?.deliveryAddress
                                            ?.latitude
                                    );

                                    console.log(
                                        "CUSTOMER LONGITUDE:",
                                        order
                                            ?.deliveryAddress
                                            ?.longitude
                                    );

                                    console.log(
                                        "CUSTOMER ADDRESS:",
                                        order
                                            ?.deliveryAddress
                                            ?.address
                                    );

                                    console.log(
                                        "=================================="
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