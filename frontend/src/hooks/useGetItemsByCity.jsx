import { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";

const useGetItemsByCity = (city) => {

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {

        if (!city) {
            setItems([]);
            return;
        }

        const getItems = async () => {

            try {

                setLoading(true);
                setError("");

                const result =
                    await axios.get(
                        `${serverUrl}/api/item/get-items-by-city`,
                        {
                            params: {
                                city: city.trim(),
                            },
                            withCredentials: true,
                        }
                    );

                console.log(
                    "FOOD ITEMS:",
                    result.data
                );

                setItems(
                    result.data?.items || []
                );

            } catch (error) {

                console.log(
                    "GET ITEMS BY CITY ERROR:",
                    error.response?.data ||
                        error.message
                );

                setError(
                    error.response?.data
                        ?.message ||
                        "Failed to load food items"
                );

                setItems([]);

            } finally {

                setLoading(false);

            }
        };

        getItems();

    }, [city]);

    return {
        items,
        loading,
        error,
    };
};

export default useGetItemsByCity;