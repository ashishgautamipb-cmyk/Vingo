import {
    useEffect,
    useState
} from "react";

import axios from "axios";

import { useSelector, useDispatch } from "react-redux";

import { useNavigate } from "react-router-dom";

import OwnerItemCard from "../pages/OwnerItemCard.jsx";

import {
    FaUtensils,
    FaPen,
    FaPlus,
    FaMapMarkerAlt
} from "react-icons/fa";

import { serverUrl } from "../App";

import { setMyShopData } from "../redux/ownerSlice";


function OwnerDashboard() {

    const dispatch = useDispatch();

    const navigate = useNavigate();


    const { myShopData } =
        useSelector(
            (state) => state.owner
        );


    const [loading, setLoading] =
        useState(true);


    /*
    =====================================================
    FETCH OWNER SHOP
    =====================================================
    */

    useEffect(() => {

        const fetchMyShop = async () => {

            try {

                setLoading(true);


                // =================================================
                // GET LOGIN TOKEN
                // =================================================

                const token =
                    localStorage.getItem(
                        "token"
                    );


                console.log(
                    "OWNER DASHBOARD TOKEN:",
                    !!token
                );


                if (!token) {

                    console.log(
                        "No token found"
                    );

                    dispatch(
                        setMyShopData(null)
                    );

                    return;

                }


                // =================================================
                // GET MY SHOP
                // =================================================

                const result =
                    await axios.get(
                        `${serverUrl}/api/shop/get-my`,
                        {
                            withCredentials: true,

                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                console.log(
                    "LATEST SHOP:",
                    result.data
                );


                // =================================================
                // SAVE SHOP IN REDUX
                // =================================================

                dispatch(
                    setMyShopData(
                        result.data?.shop ||
                        null
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

            } finally {

                setLoading(false);

            }

        };


        fetchMyShop();

    }, [dispatch]);


    /*
    =====================================================
    LOADING
    =====================================================
    */

    if (loading) {

        return (

            <div
                className="
                    w-full
                    flex
                    justify-center
                    items-center
                    min-h-[calc(100vh-100px)]
                    px-4
                "
            >

                <div className="text-center">

                    <div
                        className="
                            w-10
                            h-10
                            border-4
                            border-orange-200
                            border-t-[#ff4d2d]
                            rounded-full
                            animate-spin
                            mx-auto
                            mb-3
                        "
                    ></div>


                    <p
                        className="
                            text-gray-500
                            text-sm
                        "
                    >
                        Loading your restaurant...
                    </p>

                </div>

            </div>

        );

    }


    /*
    =====================================================
    NO SHOP
    =====================================================
    */

    if (!myShopData) {

        return (

            <div
                className="
                    w-full
                    flex
                    justify-center
                    items-center
                    min-h-[calc(100vh-100px)]
                    px-4
                "
            >

                <div
                    className="
                        w-full
                        max-w-sm
                        bg-white
                        rounded-2xl
                        shadow-lg
                        p-7
                        text-center
                    "
                >

                    <FaUtensils
                        className="
                            text-[#ff4d2d]
                            mx-auto
                            mb-4
                        "
                        size={48}
                    />


                    <h1
                        className="
                            text-lg
                            sm:text-xl
                            font-bold
                            text-gray-800
                            mb-2
                        "
                    >
                        Add Your Restaurant
                    </h1>


                    <p
                        className="
                            text-gray-600
                            text-sm
                            mb-5
                        "
                    >
                        Create your restaurant and start
                        adding food items.
                    </p>


                    <button
                        onClick={() =>
                            navigate(
                                "/create-edit-shop"
                            )
                        }
                        className="
                            bg-[#ff4d2d]
                            text-white
                            px-7
                            py-2.5
                            rounded-full
                            font-semibold
                            shadow-md
                            hover:bg-orange-600
                            transition-all
                            text-sm
                        "
                    >
                        GET STARTED
                    </button>

                </div>

            </div>

        );

    }


    /*
    =====================================================
    SHOP EXISTS
    =====================================================
    */

    return (

        <div
            className="
                w-full
                max-w-5xl
                mx-auto
                px-4
                sm:px-5
                pb-10
            "
        >

            {/* =========================================
                HEADER
            ========================================= */}

            <div
                className="
                    flex
                    flex-col
                    sm:flex-row
                    justify-between
                    items-start
                    sm:items-center
                    gap-3
                    mb-5
                "
            >

                <div>

                    <h1
                        className="
                            text-xl
                            sm:text-2xl
                            font-bold
                            text-gray-800
                        "
                    >
                        Welcome to {myShopData.name}
                    </h1>


                    <p
                        className="
                            text-gray-500
                            text-xs
                            sm:text-sm
                            mt-1
                        "
                    >
                        Manage your restaurant and food items
                    </p>

                </div>


                <button
                    onClick={() =>
                        navigate("/add-item")
                    }
                    className="
                        flex
                        items-center
                        gap-2
                        bg-[#ff4d2d]
                        text-white
                        px-4
                        py-2.5
                        rounded-full
                        font-semibold
                        shadow-md
                        hover:bg-orange-600
                        transition-all
                        text-xs
                        sm:text-sm
                    "
                >

                    <FaPlus size={12} />

                    Add Food Item

                </button>

            </div>


            {/* =========================================
                RESTAURANT CARD
            ========================================= */}

            <div
                className="
                    bg-white
                    rounded-2xl
                    shadow-md
                    overflow-hidden
                    border
                    border-orange-100
                "
            >

                <div className="relative">

                    <img
                        src={
                            myShopData.image
                        }
                        alt={
                            myShopData.name
                        }
                        className="
                            w-full
                            h-48
                            sm:h-60
                            object-cover
                        "
                    />


                    {/* EDIT BUTTON */}

                    <button
                        onClick={() =>
                            navigate(
                                "/create-edit-shop"
                            )
                        }
                        className="
                            absolute
                            top-3
                            right-3
                            bg-[#ff4d2d]
                            text-white
                            p-2.5
                            rounded-full
                            shadow-md
                            hover:bg-orange-600
                            transition-all
                        "
                    >

                        <FaPen size={13} />

                    </button>

                </div>


                <div
                    className="
                        p-4
                        sm:p-5
                    "
                >

                    <h2
                        className="
                            text-xl
                            font-bold
                            text-gray-800
                        "
                    >
                        {myShopData.name}
                    </h2>


                    <div
                        className="
                            flex
                            items-center
                            gap-2
                            text-sm
                            text-gray-500
                            mt-2
                        "
                    >

                        <FaMapMarkerAlt
                            className="
                                text-[#ff4d2d]
                            "
                            size={14}
                        />

                        <span>

                            {myShopData.city},{" "}
                            {myShopData.state}

                        </span>

                    </div>


                    <p
                        className="
                            text-sm
                            text-gray-500
                            mt-2
                        "
                    >
                        {myShopData.address}
                    </p>

                </div>

            </div>


            {/* =========================================
                FOOD ITEMS HEADER
            ========================================= */}

            <div
                className="
                    flex
                    justify-between
                    items-center
                    mt-8
                    mb-4
                "
            >

                <div>

                    <h2
                        className="
                            text-lg
                            sm:text-xl
                            font-bold
                            text-gray-800
                        "
                    >
                        Your Food Items
                    </h2>


                    <p
                        className="
                            text-xs
                            text-gray-500
                            mt-1
                        "
                    >
                        {myShopData.items?.length || 0} items in your menu
                    </p>

                </div>


                <button
                    onClick={() =>
                        navigate(
                            "/add-item"
                        )
                    }
                    className="
                        flex
                        items-center
                        gap-1.5
                        text-[#ff4d2d]
                        font-semibold
                        text-xs
                        sm:text-sm
                        hover:text-orange-600
                        transition
                    "
                >

                    <FaPlus size={11} />

                    Add Item

                </button>

            </div>


            {/* =========================================
                FOOD ITEMS
            ========================================= */}

            {!myShopData.items ||
            myShopData.items.length === 0 ? (

                <div
                    className="
                        bg-white
                        rounded-xl
                        shadow-md
                        p-6
                        text-center
                    "
                >

                    <FaUtensils
                        className="
                            text-gray-300
                            mx-auto
                            mb-3
                        "
                        size={38}
                    />


                    <h3
                        className="
                            text-base
                            font-semibold
                            text-gray-700
                        "
                    >
                        No Food Items Yet
                    </h3>


                    <p
                        className="
                            text-gray-500
                            text-xs
                            mt-1
                            mb-4
                        "
                    >
                        Start adding delicious food
                        items to your restaurant.
                    </p>


                    <button
                        onClick={() =>
                            navigate(
                                "/add-item"
                            )
                        }
                        className="
                            bg-[#ff4d2d]
                            text-white
                            px-5
                            py-2
                            rounded-full
                            font-medium
                            text-xs
                            hover:bg-orange-600
                            transition
                        "
                    >
                        Add Food Item
                    </button>

                </div>

            ) : (

                <div
                    className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        lg:grid-cols-3
                        gap-4
                    "
                >

                    {myShopData.items.map(
                        (item) => (

                            <OwnerItemCard
                                key={
                                    item._id
                                }
                                item={
                                    item
                                }
                            />

                        )
                    )}

                </div>

            )}

        </div>

    );

}


export default OwnerDashboard;