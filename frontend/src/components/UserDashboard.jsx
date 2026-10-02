import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import CategoryCard from "./CategoryCard";
import FoodCard from "./FoodCard";
import categories from "../redux/category";
import useGetItemsByCity from "../hooks/useGetItemsByCity";

import { serverUrl } from "../App";

function UserDashboard() {
    const [shops, setShops] = useState([]);

    const categoryRef = useRef(null);

    const { currentCity } = useSelector(
        (state) => state.user
    );

    // ==============================
    // GET SHOPS
    // ==============================

    const getShops = async () => {
        try {
            const result = await axios.get(
                `${serverUrl}/api/shop/get-shops`,
                {
                    withCredentials: true,
                }
            );

            setShops(result.data?.shops || []);
        } catch (error) {
            console.log(
                "GET SHOPS ERROR:",
                error.response?.data || error.message
            );
        }
    };

    useEffect(() => {
        getShops();
    }, []);

    // ==============================
    // CITY SHOPS
    // ==============================

    const userCity =
        currentCity?.trim().toLowerCase();

    const cityShops = shops.filter((shop) => {
        const shopCity =
            shop.city?.trim().toLowerCase();

        return shopCity === userCity;
    });

    // ==============================
    // FOOD ITEMS
    // ==============================

    const {
        items,
        loading,
        error,
    } = useGetItemsByCity(currentCity);

    // ==============================
    // CATEGORY SCROLL
    // ==============================

    const scrollCategories = (direction) => {
        if (!categoryRef.current) return;

        const container = categoryRef.current;

        const scrollAmount =
            container.clientWidth * 0.85;

        if (direction === "left") {
            container.scrollBy({
                left: -scrollAmount,
                behavior: "smooth",
            });
        } else {
            container.scrollBy({
                left: scrollAmount,
                behavior: "smooth",
            });
        }
    };

    return (
        <div
            className="
                w-full
                flex
                flex-col
                items-center
                gap-8
                pb-10
            "
        >

            {/* ================================= */}
            {/* CATEGORIES */}
            {/* ================================= */}

            <div className="w-full max-w-[1000px]">

                <h1
                    className="
                        text-gray-800
                        text-lg
                        sm:text-xl
                        font-medium
                        mb-4
                    "
                >
                    Inspiration for your first order
                </h1>

                <div className="relative">

                    {/* LEFT BUTTON */}

                    <button
                        onClick={() =>
                            scrollCategories("left")
                        }
                        className="
                            absolute
                            left-0
                            top-1/2
                            -translate-y-1/2
                            z-20
                            w-8
                            h-8
                            bg-white
                            rounded-full
                            shadow-md
                            border
                            border-gray-200
                            flex
                            items-center
                            justify-center
                            text-gray-700
                            hover:bg-[#ff4d2d]
                            hover:text-white
                            transition
                        "
                    >
                        <FaChevronLeft size={12} />
                    </button>

                    {/* CATEGORY CONTAINER */}

                    <div
                        ref={categoryRef}
                        className="
                            w-full
                            flex
                            gap-4
                            overflow-x-auto
                            scroll-smooth
                            scrollbar-hide
                            px-10
                        "
                    >
                        {categories.map(
                            (cate, index) => (
                                <CategoryCard
                                    data={cate}
                                    key={index}
                                />
                            )
                        )}
                    </div>

                    {/* RIGHT BUTTON */}

                    <button
                        onClick={() =>
                            scrollCategories("right")
                        }
                        className="
                            absolute
                            right-0
                            top-1/2
                            -translate-y-1/2
                            z-20
                            w-8
                            h-8
                            bg-white
                            rounded-full
                            shadow-md
                            border
                            border-gray-200
                            flex
                            items-center
                            justify-center
                            text-gray-700
                            hover:bg-[#ff4d2d]
                            hover:text-white
                            transition
                        "
                    >
                        <FaChevronRight size={12} />
                    </button>

                </div>
            </div>


            {/* ================================= */}
            {/* SHOPS */}
            {/* ================================= */}

            <div className="w-full max-w-[1000px]">

                <h1
                    className="
                        text-gray-800
                        text-lg
                        sm:text-xl
                        font-medium
                        mb-5
                    "
                >
                    Best Shop in{" "}
                    {currentCity || "your city"}
                </h1>

                {cityShops.length === 0 ? (

                    <p className="text-gray-500">
                        No shops available in{" "}
                        {currentCity || "your city"}.
                    </p>

                ) : (

                    <div
                        className="
                            w-full
                            flex
                            flex-wrap
                            justify-center
                            gap-5
                        "
                    >

                        {cityShops.map((shop) => (

                            <div
                                key={shop._id}
                                className="
                                    w-[170px]
                                    bg-white
                                    rounded-xl
                                    overflow-hidden
                                    border
                                    border-orange-200
                                    shadow-sm
                                    hover:shadow-lg
                                    hover:-translate-y-1
                                    transition-all
                                    duration-300
                                "
                            >

                                <img
                                    src={shop.image}
                                    alt={shop.name}
                                    className="
                                        w-full
                                        h-[120px]
                                        object-cover
                                    "
                                />

                                <div className="p-2">

                                    <h2
                                        className="
                                            text-sm
                                            font-semibold
                                            text-gray-800
                                            truncate
                                        "
                                    >
                                        {shop.name}
                                    </h2>

                                    <p className="text-xs text-gray-500 mt-1">
                                        {shop.city}
                                    </p>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>


            {/* ================================= */}
            {/* FOOD ITEMS */}
            {/* ================================= */}

            <div className="w-full max-w-[1000px]">

                <h1
                    className="
                        text-gray-800
                        text-lg
                        sm:text-xl
                        font-medium
                        mb-5
                    "
                >
                    Suggested Food Items
                </h1>

                {/* LOADING */}

                {loading && (
                    <p className="text-gray-500">
                        Loading food items...
                    </p>
                )}

                {/* ERROR */}

                {!loading && error && (
                    <p className="text-red-500">
                        {error}
                    </p>
                )}

                {/* NO ITEMS */}

                {!loading &&
                    !error &&
                    items.length === 0 && (

                        <p className="text-gray-500">
                            No food items available in{" "}
                            {currentCity || "your city"}.
                        </p>
                    )}

                {/* FOOD CARDS */}

                {!loading &&
                    items.length > 0 && (

                        <div
                            className="
                                w-full
                                flex
                                flex-wrap
                                justify-center
                                gap-4
                            "
                        >

                            {items.map((item) => (

                                <FoodCard
                                    key={item._id}
                                    item={item}
                                />

                            ))}

                        </div>
                    )}

            </div>

        </div>
    );
}

export default UserDashboard;