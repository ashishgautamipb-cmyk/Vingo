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

                    const result =
                        await axios.get(
                            `${serverUrl}/api/order/my-orders`,
                            {
                                withCredentials: true
                            }
                        );

                    setOrders(
                        result.data.orders ||
                        []
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
        refetchOrders: getMyOrders
    };

};

export default useGetMyOrders;