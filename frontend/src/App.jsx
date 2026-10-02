import React from "react";
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
    "http://localhost:5000";

function App() {

    useGetCurrentUser();
    useGetCity();
    useGetMyshop();
    useUpdateLocation();

    const { userData } = useSelector(
        (state) => state.user
    );

    return (
        <Routes>

            {/* ================= HOME ================= */}

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


            {/* ================= MAP ================= */}

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


            {/* ================= SIGN UP ================= */}

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


            {/* ================= SIGN IN ================= */}

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


            {/* ================= FORGOT PASSWORD ================= */}

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


            {/* ================= CHECKOUT ================= */}

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


            {/* ================= CART ================= */}

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


            {/* ================= CREATE / EDIT SHOP ================= */}

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


            {/* ================= ADD ITEM ================= */}

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


            {/* ================= ADD FORM ================= */}

            {/* 
                CreateEditShop was previously using:
                navigate("/add-form")

                So we support that URL too.
            */}

            


            {/* ================= EDIT ITEM ================= */}

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


            {/* ================= ORDER PLACED ================= */}

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


            {/* ================= MY ORDERS ================= */}

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


            {/* ================= DELIVERY BOY ================= */}

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


            {/* ================= INVALID ROUTE ================= */}

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