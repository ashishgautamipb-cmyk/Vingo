import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";

import { serverUrl } from "../App";
import { setMyShopData } from "../redux/ownerSlice";

const useGetMyShop = () => {

    const dispatch = useDispatch();

    useEffect(() => {

        const getMyShop = async () => {

            try {

                const token =
                    localStorage.getItem("token");

                const result =
                    await axios.get(
                        `${serverUrl}/api/shop/get-my`,
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
                    "MY SHOP:",
                    result.data
                );

                dispatch(
                    setMyShopData(
                        result.data.shop || null
                    )
                );

            } catch (error) {

                console.log(
                    "GET MY SHOP ERROR:",
                    error.response?.data ||
                    error.message
                );

                dispatch(
                    setMyShopData(null)
                );
            }
        };

        getMyShop();

    }, [dispatch]);

};

export default useGetMyShop;