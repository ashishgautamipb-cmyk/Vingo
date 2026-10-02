import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    FaStar,
    FaPlus,
    FaMinus,
    FaShoppingCart,
    FaCheck,
} from "react-icons/fa";

import {
    addToCart,
    increaseQuantity,
    decreaseQuantity,
} from "../redux/cartSlice";

function FoodCard({ item }) {
    const dispatch = useDispatch();

    const cartItems = useSelector(
        (state) => state.cart.items
    );

    const cartItem = cartItems.find(
        (cartItem) => cartItem._id === item._id
    );

    // Local quantity before item is submitted to cart
    const [localQuantity, setLocalQuantity] = useState(0);

    const isInCart = !!cartItem;

    const quantity = isInCart
        ? cartItem.quantity
        : localQuantity;

    const addedToCart =
        cartItem?.addedToCart || false;

    // =====================================
    // PLUS
    // =====================================
    const handleIncrease = () => {
        if (!isInCart) {
            setLocalQuantity((prev) => prev + 1);
        } else {
            dispatch(increaseQuantity(item._id));
        }
    };

    // =====================================
    // MINUS
    // =====================================
    const handleDecrease = () => {
        if (!isInCart) {
            setLocalQuantity((prev) =>
                Math.max(0, prev - 1)
            );
        } else {
            dispatch(decreaseQuantity(item._id));
        }
    };

    // =====================================
    // CART BUTTON
    // =====================================
    const handleAddToCart = () => {
        // Green button should not be clickable
        if (addedToCart) return;

        // Don't add if quantity is 0
        if (quantity <= 0) return;

        dispatch(
            addToCart({
                ...item,
                quantity: quantity,
            })
        );

        setLocalQuantity(0);
    };

    return (
        <div
            className={`
                w-[180px]
                rounded-xl
                overflow-hidden
                shadow-sm
                transition-all
                duration-300
                flex
                flex-col
                border
                ${
                    addedToCart
                        ? "bg-green-50 border-green-400"
                        : "bg-white border-orange-200"
                }
            `}
        >
            {/* IMAGE */}
            <div className="relative w-full h-[115px]">

                <img
                    src={item.image}
                    alt={item.name}
                    className="
                        w-full
                        h-full
                        object-cover
                    "
                />

                {/* FOOD TYPE */}
                <div
                    className="
                        absolute
                        top-2
                        right-2
                        w-5
                        h-5
                        bg-white
                        rounded-full
                        flex
                        items-center
                        justify-center
                        shadow-sm
                    "
                >
                    <div
                        className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                            item.foodType === "veg"
                                ? "border-green-600"
                                : "border-red-600"
                        }`}
                    >
                        <div
                            className={`w-1.5 h-1.5 rounded-full ${
                                item.foodType === "veg"
                                    ? "bg-green-600"
                                    : "bg-red-600"
                            }`}
                        />
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="p-2">

                {/* NAME */}
                <h2
                    className="
                        text-[13px]
                        font-semibold
                        text-gray-800
                        truncate
                    "
                >
                    {item.name}
                </h2>

                {/* RATING */}
                <div className="flex items-center gap-1 mt-1">

                    <div className="flex gap-[1px]">
                        {[1, 2, 3, 4, 5].map(
                            (star) => (
                                <FaStar
                                    key={star}
                                    size={10}
                                    className="text-yellow-400"
                                />
                            )
                        )}
                    </div>

                    <span className="text-[10px] text-gray-400">
                        0
                    </span>

                </div>

                {/* PRICE + CONTROLS */}
                <div
                    className="
                        flex
                        items-center
                        justify-between
                        mt-3
                    "
                >

                    {/* PRICE */}
                    <span
                        className="
                            text-sm
                            font-bold
                            text-gray-800
                        "
                    >
                        ₹{item.price}
                    </span>

                    {/* CONTROLS */}
                    <div className="flex items-center">

                        {/* MINUS */}
                        <button
                            onClick={handleDecrease}
                            disabled={quantity === 0}
                            className="
                                w-6
                                h-7
                                border
                                border-gray-400
                                rounded-l-full
                                flex
                                items-center
                                justify-center
                                text-gray-700
                                disabled:opacity-40
                                disabled:cursor-not-allowed
                            "
                        >
                            <FaMinus size={8} />
                        </button>

                        {/* QUANTITY */}
                        <div
                            className="
                                h-7
                                min-w-[24px]
                                border-t
                                border-b
                                border-gray-400
                                bg-white
                                flex
                                items-center
                                justify-center
                                text-xs
                                font-semibold
                            "
                        >
                            {quantity}
                        </div>

                        {/* PLUS */}
                        <button
                            onClick={handleIncrease}
                            className="
                                w-6
                                h-7
                                border
                                border-gray-400
                                rounded-r-full
                                flex
                                items-center
                                justify-center
                                text-gray-700
                            "
                        >
                            <FaPlus size={8} />
                        </button>

                        {/* CART / GREEN CHECK */}
                        <button
                            onClick={handleAddToCart}
                            disabled={
                                addedToCart ||
                                quantity === 0
                            }
                            className={`
                                ml-1
                                w-7
                                h-7
                                rounded-md
                                flex
                                items-center
                                justify-center
                                transition-all
                                ${
                                    addedToCart
                                        ? "bg-green-500 text-white cursor-not-allowed"
                                        : quantity === 0
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-[#ff4d2d] text-white hover:bg-orange-600"
                                }
                            `}
                        >
                            {addedToCart ? (
                                <FaCheck size={11} />
                            ) : (
                                <FaShoppingCart
                                    size={11}
                                />
                            )}
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default FoodCard;