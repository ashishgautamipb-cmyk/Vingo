import {
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
    import.meta.env.VITE_BACKEND_URL ||
    (typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1")
        ? "http://localhost:5000"
        : "https://vingo-dwtv.onrender.com");


function App() {

    // =====================================================
    // REDUX USER
    // =====================================================

    const {
        userData,
        authInitialized
    } = useSelector(
        (state) => state.user
    );


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
    // AUTH LOADING SCREEN
    // =====================================================

    if (!authInitialized) {

        return (

            <div
                className="
                    min-h-screen
                    flex
                    items-center
                    justify-center
                    bg-[#fff9f6]
                "
            >

                <div
                    className="
                        text-center
                    "
                >

                    <div
                        className="
                            w-12
                            h-12
                            border-4
                            border-orange-200
                            border-t-[#ff4d2d]
                            rounded-full
                            animate-spin
                            mx-auto
                            mb-4
                        "
                    />

                    <p
                        className="
                            text-gray-700
                            font-semibold
                            tracking-wide
                            text-sm
                        "
                    >
                        Loading Vingo...
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