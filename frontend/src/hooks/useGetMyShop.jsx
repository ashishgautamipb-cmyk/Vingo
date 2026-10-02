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

                const result =
                    await axios.get(
                        `${serverUrl}/api/shop/get-my`,
                        {
                            withCredentials: true,
                        }
                    );

                console.log(
                    "MY SHOP:",
                    result.data
                );

                // Backend returns:
                // { success: true, shop: {...} }

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