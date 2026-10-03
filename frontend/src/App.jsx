import React, {
    useEffect,
    useState
} from "react";

import {
    Navigate,
    Route,
    Routes
} from "react-router-dom";

import { useSelector } from "react-redux";

import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckOut";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import CreateEditShop from "./pages/CreateEditShop";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";
import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import OrderPlaced from "./pages/OrderPlaced";
import MyOrders from "./pages/MyOrders";
import DeliveryBoy from "./pages/DeliveryBoy";

import useUpdateLocation from "./hooks/useUpdateLocation";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import useGetCity from "./hooks/useGetCity";
import useGetMyshop from "./hooks/useGetMyShop";


export const serverUrl =
    "https://vingo-dwtv.onrender.com";


function App() {

    // =====================================================
    // REDUX USER
    // =====================================================

    const {
        userData
    } = useSelector(
        (state) => state.user
    );


    // =====================================================
    // AUTH LOADING
    // =====================================================

    const [
        authLoading,
        setAuthLoading
    ] = useState(true);


    // =====================================================
    // LOAD CURRENT USER
    // =====================================================

    useGetCurrentUser();


    // =====================================================
    // OTHER GLOBAL HOOKS
    // =====================================================

    useGetCity();

    useGetMyshop();

    useUpdateLocation();


    // =====================================================
    // WAIT FOR CURRENT USER
    // =====================================================

    useEffect(() => {

        const token =
            localStorage.getItem("token");


        /*
         * If there is no token, we already know
         * that the user is not logged in.
         */

        if (!token) {

            setAuthLoading(false);

            return;

        }


        /*
         * If token exists, give useGetCurrentUser()
         * time to fetch the user.
         *
         * This prevents:
         *
         * /delivery-boy
         *       ↓
         * userData = null
         *       ↓
         * Navigate("/")
         *
         * before the API response arrives.
         */

        const timer =
            setTimeout(() => {

                setAuthLoading(false);

            }, 1000);


        return () => {

            clearTimeout(timer);

        };

    }, []);


    // =====================================================
    // DEBUG
    // =====================================================

    console.log(
        "APP USER DATA:",
        userData
            ? {
                id: userData?._id,
                role: userData?.role,
                fullName: userData?.fullName
            }
            : null
    );


    console.log(
        "APP AUTH LOADING:",
        authLoading
    );


    // =====================================================
    // AUTH LOADING SCREEN
    // =====================================================

    if (authLoading) {

        return (

            <div
                className="
                    min-h-screen
                    flex
                    items-center
                    justify-center
                    bg-gray-50
                "
            >

                <div
                    className="
                        text-center
                    "
                >

                    <div
                        className="
                            w-10
                            h-10
                            border-4
                            border-gray-200
                            border-t-[#ff4d2d]
                            rounded-full
                            animate-spin
                            mx-auto
                            mb-4
                        "
                    />

                    <p
                        className="
                            text-gray-600
                            font-medium
                        "
                    >
                        Loading...
                    </p>

                </div>

            </div>

        );

    }


    // =====================================================
    // ROUTES
    // =====================================================

    return (

        <Routes>

            {/* =================================================
                HOME
            ================================================= */}

            <Route
                path="/"
                element={

                    userData ? (

                        <Home />

                    ) : (

                        <Navigate
                            to="/signin"
                            replace
                        />

                    )

                }
            />


            {/* =================================================
                MAP
            ================================================= */}

            <Route
                path="/map"
                element={

                    userData ? (

                        <MapPage />

                    ) : (

                        <Navigate
                            to="/signin"
                            replace
                        />

                    )

                }
            />


            {/* =================================================
                SIGN UP
            ================================================= */}

            <Route
                path="/signup"
                element={

                    !userData ? (

                        <SignUp />

                    ) : (

                        <Navigate
                            to="/"
                            replace
                        />

                    )

                }
            />


            {/* =================================================
                SIGN IN
            ================================================= */}

            <Route
                path="/signin"
                element={

                    !userData ? (

                        <SignIn />

                    ) : (

                        <Navigate
                            to="/"
                            replace
                        />

                    )

                }
            />


            {/* =================================================
                FORGOT PASSWORD
            ================================================= */}

            <Route
                path="/forgot-password"
                element={

                    !userData ? (

                        <ForgotPassword />

                    ) : (

                        <Navigate
                            to="/"
                            replace
                        />

                    )

                }
            />


            {/* =================================================
                CHECKOUT
            ================================================= */}

            <Route
                path="/checkout"
                element={

                    userData ? (

                        <CheckoutPage />

                    ) : (

                        <Navigate
                            to="/signin"
                            replace
                        />

                    )

                }
            />


            {/* =================================================
                CART
            ================================================= */}

            <Route
                path="/cart"
                element={

                    userData?.role === "user" ? (

                        <CartPage />

                    ) : (

                        <Navigate
                            to="/"
                            replace
                        />

                    )

                }
            />


            {/* =================================================
                CREATE / EDIT SHOP
            ================================================= */}

            <Route
                path="/create-edit-shop"
                element={

                    userData?.role === "owner" ? (

                        <CreateEditShop />

                    ) : (

                        <Navigate
                            to="/"
                            replace
                        />

                    )

                }
            />


            {/* =================================================
                ADD ITEM
            ================================================= */}

            <Route
                path="/add-item"
                element={

                    userData?.role === "owner" ? (

                        <AddItem />

                    ) : (

                        <Navigate
                            to="/"
                            replace
                        />

                    )

                }
            />


            {/* =================================================
                EDIT ITEM
            ================================================= */}

            <Route
                path="/edit-item/:itemId"
                element={

                    userData?.role === "owner" ? (

                        <EditItem />

                    ) : (

                        <Navigate
                            to="/"
                            replace
                        />

                    )

                }
            />


            {/* =================================================
                ORDER PLACED
            ================================================= */}

            <Route
                path="/order-placed"
                element={

                    userData ? (

                        <OrderPlaced />

                    ) : (

                        <Navigate
                            to="/signin"
                            replace
                        />

                    )

                }
            />


            {/* =================================================
                MY ORDERS
            ================================================= */}

            <Route
                path="/my-orders"
                element={

                    userData?.role === "user" ||
                    userData?.role === "owner" ? (

                        <MyOrders />

                    ) : (

                        <Navigate
                            to="/"
                            replace
                        />

                    )

                }
            />


            {/* =================================================
                DELIVERY BOY
            ================================================= */}

            <Route
                path="/delivery-boy"
                element={

                    userData?.role === "deliveryBoy" ? (

                        <DeliveryBoy />

                    ) : (

                        <Navigate
                            to="/"
                            replace
                        />

                    )

                }
            />


            {/* =================================================
                INVALID ROUTE
            ================================================= */}

            <Route
                path="*"
                element={

                    <Navigate
                        to={
                            userData
                                ? "/"
                                : "/signin"
                        }
                        replace
                    />

                }
            />

        </Routes>

    );

}


export default App;