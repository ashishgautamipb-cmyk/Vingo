import { useEffect, useRef, useState } from "react";

import { FiShoppingCart } from "react-icons/fi";
import { CiLocationOn } from "react-icons/ci";
import { IoIosSearch } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { FaPlus, FaClipboardList } from "react-icons/fa";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { serverUrl } from "../App";
import { clearUserData } from "../redux/userSlice";
import useGetMyOrders from "../hooks/useGetMyOrder";

function Nav() {

    /*
    =========================================
    USER DATA
    =========================================
    */

    const {
        userData,
        currentCity
    } = useSelector(
        (state) => state.user
    );


    /*
    =========================================
    OWNER DATA
    =========================================
    */

    const {
        myShopData
    } = useSelector(
        (state) => state.owner
    );


    /*
    =========================================
    CART DATA
    =========================================
    */

    const {
        items: cartItems = []
    } = useSelector(
        (state) => state.cart
    );


    const dispatch = useDispatch();
    const navigate = useNavigate();

    const profileRef = useRef(null);


    /*
    =========================================
    STATES
    =========================================
    */

    const [
        showSearch,
        setShowSearch
    ] = useState(false);

    const [
        showProfileMenu,
        setShowProfileMenu
    ] = useState(false);

    const [
        searchText,
        setSearchText
    ] = useState("");


    /*
    =========================================
    ORDERS
    =========================================
    */

    const {
        orders = []
    } = useGetMyOrders();


    /*
    =========================================
    ROLES
    =========================================
    */

    const isUser =
        userData?.role === "user";

    const isOwner =
        userData?.role === "owner";


    /*
    =========================================
    USER NAME
    =========================================
    */

    const userName =
        userData?.fullName ||
        userData?.name ||
        userData?.username ||
        "User";


    const firstLetter =
        userName
            ?.trim()
            ?.charAt(0)
            ?.toUpperCase() ||
        "U";


    /*
    =========================================
    CITY
    =========================================

    This fixes:

    ReferenceError: city is not defined
    */

    const city =
        currentCity ||
        "Detecting...";


    /*
    =========================================
    CART COUNT
    =========================================
    */

    const cartCount =
        cartItems.length;


    /*
    =========================================
    OWNER ORDER COUNT
    =========================================

    Count undelivered shop orders.
    */

    const ownerOrderCount = isOwner
        ? orders.reduce(
              (count, order) =>
                  count +
                  (order.shopOrders || []).filter(
                      (shopOrder) =>
                          shopOrder.status !==
                          "delivered"
                  ).length,
              0
          )
        : 0;


    /*
    =========================================
    CLOSE PROFILE MENU
    =========================================
    */

    useEffect(() => {

        const handleOutsideClick =
            (event) => {

                if (
                    profileRef.current &&
                    !profileRef.current.contains(
                        event.target
                    )
                ) {

                    setShowProfileMenu(
                        false
                    );

                }

            };


        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );

        };

    }, []);


    /*
    =========================================
    LOGOUT
    =========================================
    */

    const handleLogout = async () => {

        try {

            await axios.get(
                `${serverUrl}/api/auth/signout`,
                {
                    withCredentials: true,
                }
            );


            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );


            dispatch(
                clearUserData()
            );


            setShowProfileMenu(
                false
            );

            setShowSearch(
                false
            );


            navigate(
                "/signin",
                {
                    replace: true,
                }
            );

        } catch (error) {

            console.log(
                "Logout error:",
                error.response?.data ||
                error.message
            );

        }

    };


    /*
    =========================================
    SEARCH
    =========================================
    */

    const handleSearch = (e) => {

        e.preventDefault();


        if (!searchText.trim()) {
            return;
        }


        navigate(
            `/search?query=${encodeURIComponent(
                searchText
            )}`
        );

    };


    /*
    =========================================
    TOGGLE SEARCH
    =========================================
    */

    const toggleSearch = () => {

        setShowSearch(
            (prev) => !prev
        );

        setShowProfileMenu(
            false
        );

    };


    /*
    =========================================
    TOGGLE PROFILE
    =========================================
    */

    const toggleProfile = () => {

        setShowProfileMenu(
            (prev) => !prev
        );

        setShowSearch(
            false
        );

    };


    /*
    =========================================
    ADD FOOD ITEM
    =========================================
    */

    const handleAddFoodItem = () => {

        setShowProfileMenu(
            false
        );

        navigate(
            "/add-item"
        );

    };


    /*
    =========================================
    MY ORDERS
    =========================================
    */

    const handleMyOrders = () => {

        setShowProfileMenu(
            false
        );

        navigate(
            "/my-orders"
        );

    };


    /*
    =========================================
    CART
    =========================================
    */

    const handleCart = () => {

        navigate(
            "/cart"
        );

    };


    /*
    =========================================
    UI
    =========================================
    */

    return (

        <nav
            className="
                w-full
                h-[65px]
                fixed
                top-0
                left-0
                z-[9999]
                flex
                items-center
                justify-between
                md:justify-center
                gap-[10px]
                sm:gap-[15px]
                md:gap-[25px]
                px-[12px]
                md:px-[18px]
                bg-[#fff9f6]
                overflow-visible
            "
        >

            {/* =====================================
                LOGO
            ===================================== */}

            <h1
                className="
                    text-xl
                    sm:text-2xl
                    font-bold
                    text-[#ff4d2d]
                    whitespace-nowrap
                    flex-shrink-0
                "
            >

                Vingo

            </h1>


            {/* =====================================
                DESKTOP USER SEARCH
            ===================================== */}

            {isUser && (

                <form
                    onSubmit={handleSearch}
                    className="
                        hidden
                        md:flex
                        md:w-[55%]
                        lg:w-[40%]
                        h-[48px]
                        bg-white
                        shadow-md
                        rounded-lg
                        items-center
                        gap-[8px]
                        lg:gap-[15px]
                        px-[8px]
                    "
                >

                    {/* LOCATION */}

                    <div
                        className="
                            flex
                            items-center
                            w-[35%]
                            lg:w-[30%]
                            overflow-hidden
                            gap-[5px]
                            px-[5px]
                            border-r
                            border-gray-300
                            flex-shrink-0
                        "
                    >

                        <CiLocationOn
                            size={20}
                            className="text-[#ff4d2d]"
                        />

                        <div
                            className="
                                w-[80%]
                                truncate
                                text-gray-600
                                text-xs
                            "
                        >

                            {city}

                        </div>

                    </div>


                    {/* SEARCH INPUT */}

                    <div
                        className="
                            flex
                            items-center
                            gap-[6px]
                            flex-1
                            min-w-0
                        "
                    >

                        <IoIosSearch
                            size={20}
                            className="text-[#ff4d2d]"
                        />

                        <input
                            type="text"
                            value={searchText}
                            onChange={(e) =>
                                setSearchText(
                                    e.target.value
                                )
                            }
                            placeholder="Search delicious food..."
                            className="
                                w-full
                                px-[4px]
                                text-gray-700
                                outline-none
                                bg-transparent
                                text-xs
                            "
                        />

                    </div>

                </form>

            )}


            {/* =====================================
                RIGHT SIDE
            ===================================== */}

            <div
                className="
                    flex
                    items-center
                    gap-1
                    sm:gap-2
                    md:gap-3
                "
            >

                {/* =================================
                    MOBILE SEARCH
                ================================= */}

                {isUser && (

                    <button
                        type="button"
                        onClick={toggleSearch}
                        className="
                            flex
                            md:hidden
                            items-center
                            justify-center
                            p-1
                        "
                    >

                        {showSearch ? (

                            <RxCross2
                                size={20}
                                className="text-[#ff4d2d]"
                            />

                        ) : (

                            <IoIosSearch
                                size={20}
                                className="text-[#ff4d2d]"
                            />

                        )}

                    </button>

                )}


                {/* =================================
                    OWNER ADD FOOD
                ================================= */}

                {isOwner && myShopData && (

                    <button
                        type="button"
                        onClick={
                            handleAddFoodItem
                        }
                        className="
                            flex
                            items-center
                            gap-1
                            p-1.5
                            sm:px-2
                            sm:py-1.5
                            rounded-full
                            bg-[#ff4d2d]/10
                            text-[#ff4d2d]
                        "
                    >

                        <FaPlus
                            size={16}
                        />

                        <span
                            className="
                                hidden
                                sm:inline
                                text-xs
                                font-medium
                            "
                        >

                            Add Food Item

                        </span>

                    </button>

                )}


                {/* =================================
                    USER CART
                ================================= */}

                {isUser && (

                    <button
                        type="button"
                        onClick={handleCart}
                        className="
                            relative
                            cursor-pointer
                            p-1.5
                        "
                    >

                        <FiShoppingCart
                            size={21}
                            className="text-[#b87363]"
                        />


                        {cartCount > 0 && (

                            <span
                                className="
                                    absolute
                                    right-[-3px]
                                    top-[-4px]
                                    min-w-[15px]
                                    h-[15px]
                                    px-1
                                    rounded-full
                                    bg-[#ff4d2d]
                                    text-white
                                    text-[9px]
                                    font-bold
                                    flex
                                    items-center
                                    justify-center
                                "
                            >

                                {cartCount}

                            </span>

                        )}

                    </button>

                )}


                {/* =================================
                    MY ORDERS
                ================================= */}

                {(isUser || isOwner) && (

                    <button
                        type="button"
                        onClick={
                            handleMyOrders
                        }
                        className="
                            relative
                            flex
                            items-center
                            gap-1
                            p-1.5
                            sm:px-2.5
                            sm:py-1.5
                            rounded-full
                            bg-[#ff4d2d]/10
                            text-[#ff4d2d]
                        "
                    >

                        <FaClipboardList
                            size={16}
                        />

                        <span
                            className="
                                hidden
                                sm:inline
                                text-xs
                                font-medium
                            "
                        >

                            My Orders

                        </span>


                        {/* OWNER ORDER COUNT */}

                        {isOwner &&
                            ownerOrderCount >
                                0 && (

                                <span
                                    className="
                                        absolute
                                        -top-1
                                        -right-1
                                        min-w-[16px]
                                        h-[16px]
                                        px-1
                                        rounded-full
                                        bg-[#ff4d2d]
                                        text-white
                                        text-[9px]
                                        font-bold
                                        flex
                                        items-center
                                        justify-center
                                    "
                                >

                                    {ownerOrderCount}

                                </span>

                            )}

                    </button>

                )}


                {/* =================================
                    PROFILE
                ================================= */}

                <div
                    ref={profileRef}
                    className="
                        relative
                        flex-shrink-0
                    "
                >

                    <button
                        type="button"
                        onClick={
                            toggleProfile
                        }
                        className="
                            flex
                            items-center
                            gap-1.5
                        "
                    >

                        {/* DESKTOP NAME */}

                        <div
                            className="
                                hidden
                                md:flex
                                flex-col
                                items-end
                            "
                        >

                            <span
                                className="
                                    text-xs
                                    font-semibold
                                    text-gray-700
                                    max-w-[110px]
                                    truncate
                                "
                            >

                                {userName}

                            </span>


                            <span
                                className="
                                    text-[10px]
                                    text-[#ff4d2d]
                                    font-medium
                                    capitalize
                                "
                            >

                                {userData?.role ||
                                    "user"}

                            </span>

                        </div>


                        {/* PROFILE CIRCLE */}

                        <div
                            className="
                                w-8
                                h-8
                                rounded-full
                                bg-[#ff4d2d]
                                flex
                                items-center
                                justify-center
                                text-white
                                text-sm
                                font-semibold
                            "
                        >

                            {firstLetter}

                        </div>

                    </button>


                    {/* =================================
                        PROFILE DROPDOWN
                    ================================= */}

                    {showProfileMenu && (

                        <div
                            className="
                                absolute
                                top-[42px]
                                right-0
                                w-[190px]
                                bg-white
                                rounded-xl
                                shadow-lg
                                p-3
                                flex
                                flex-col
                                gap-2
                                border
                                border-gray-100
                                z-[99999]
                            "
                        >

                            <div
                                className="
                                    text-xs
                                    font-semibold
                                    text-gray-800
                                "
                            >

                                {userName}

                            </div>


                            <div
                                className="
                                    text-[10px]
                                    text-gray-500
                                "
                            >

                                {userData?.role ||
                                    "user"}

                            </div>


                            {/* USER CART */}

                            {isUser && (

                                <button
                                    onClick={
                                        handleCart
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        text-left
                                        text-xs
                                        text-[#ff4d2d]
                                        font-medium
                                    "
                                >

                                    <FiShoppingCart
                                        size={13}
                                    />

                                    <span>
                                        My Cart
                                    </span>


                                    {cartCount > 0 && (

                                        <span
                                            className="
                                                ml-auto
                                                bg-[#ff4d2d]
                                                text-white
                                                rounded-full
                                                px-1.5
                                                text-[9px]
                                            "
                                        >

                                            {cartCount}

                                        </span>

                                    )}

                                </button>

                            )}


                            {/* MY ORDERS */}

                            {(isUser ||
                                isOwner) && (

                                <button
                                    onClick={
                                        handleMyOrders
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        text-left
                                        text-xs
                                        text-[#ff4d2d]
                                        font-medium
                                    "
                                >

                                    <FaClipboardList
                                        size={13}
                                    />

                                    <span>
                                        My Orders
                                    </span>


                                    {isOwner &&
                                        ownerOrderCount >
                                            0 && (

                                        <span
                                            className="
                                                ml-auto
                                                bg-[#ff4d2d]
                                                text-white
                                                rounded-full
                                                px-1.5
                                                text-[9px]
                                            "
                                        >

                                            {
                                                ownerOrderCount
                                            }

                                        </span>

                                    )}

                                </button>

                            )}


                            {/* OWNER ADD FOOD */}

                            {isOwner &&
                                myShopData && (

                                <button
                                    onClick={
                                        handleAddFoodItem
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        text-left
                                        text-xs
                                        text-[#ff4d2d]
                                        font-medium
                                    "
                                >

                                    <FaPlus
                                        size={13}
                                    />

                                    <span>
                                        Add Food Item
                                    </span>

                                </button>

                            )}


                            {/* LOGOUT */}

                            <button
                                onClick={
                                    handleLogout
                                }
                                className="
                                    text-left
                                    text-xs
                                    text-[#ff4d2d]
                                    font-medium
                                    pt-2
                                    border-t
                                    border-gray-100
                                "
                            >

                                Log Out

                            </button>

                        </div>

                    )}

                </div>

            </div>


            {/* =====================================
                MOBILE SEARCH BAR
            ===================================== */}

            {isUser &&
                showSearch && (

                    <form
                        onSubmit={handleSearch}
                        className="
                            fixed
                            top-[65px]
                            left-[5%]
                            w-[90%]
                            h-[50px]
                            bg-white
                            shadow-lg
                            rounded-lg
                            flex
                            items-center
                            gap-[8px]
                            px-[8px]
                            md:hidden
                        "
                    >

                        <CiLocationOn
                            size={19}
                            className="text-[#ff4d2d]"
                        />


                        <div
                            className="
                                w-[30%]
                                truncate
                                text-xs
                                text-gray-600
                                border-r
                            "
                        >

                            {city}

                        </div>


                        <IoIosSearch
                            size={19}
                            className="text-[#ff4d2d]"
                        />


                        <input
                            type="text"
                            value={searchText}
                            onChange={(e) =>
                                setSearchText(
                                    e.target.value
                                )
                            }
                            autoFocus
                            placeholder="Search delicious food..."
                            className="
                                flex-1
                                text-xs
                                outline-none
                            "
                        />

                    </form>

                )}

        </nav>
    );
}

export default Nav;