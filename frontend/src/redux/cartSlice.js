import { createSlice } from "@reduxjs/toolkit";

// =====================================
// LOAD CART FROM LOCAL STORAGE
// =====================================

const savedCart = localStorage.getItem("vingoCart");

const initialState = {
    items: savedCart ? JSON.parse(savedCart) : [],
};

// =====================================
// CART SLICE
// =====================================

const cartSlice = createSlice({
    name: "cart",

    initialState,

    reducers: {

        // =====================================
        // ADD / UPDATE ITEM IN CART
        // =====================================

        addToCart: (state, action) => {
            const item = action.payload;

            const existingItem = state.items.find(
                (cartItem) =>
                    cartItem._id === item._id
            );

            if (existingItem) {

                // Item already exists
                // Just mark it as added
                existingItem.addedToCart = true;

            } else {

                // Add new item
                state.items.push({
                    ...item,
                    quantity: item.quantity || 1,
                    addedToCart: true,
                });
            }

            // Save to localStorage
            localStorage.setItem(
                "vingoCart",
                JSON.stringify(state.items)
            );
        },

        // =====================================
        // INCREASE QUANTITY
        // =====================================

        increaseQuantity: (state, action) => {

            const item = state.items.find(
                (cartItem) =>
                    cartItem._id === action.payload
            );

            if (item) {

                item.quantity += 1;

                // Quantity changed
                // Cart button becomes active again
                item.addedToCart = false;
            }

            // Save to localStorage
            localStorage.setItem(
                "vingoCart",
                JSON.stringify(state.items)
            );
        },

        // =====================================
        // DECREASE QUANTITY
        // =====================================

        decreaseQuantity: (state, action) => {

            const item = state.items.find(
                (cartItem) =>
                    cartItem._id === action.payload
            );

            if (item) {

                item.quantity -= 1;

                // Remove item completely
                if (item.quantity <= 0) {

                    state.items = state.items.filter(
                        (cartItem) =>
                            cartItem._id !== action.payload
                    );

                } else {

                    // Quantity changed
                    // Cart button becomes active
                    item.addedToCart = false;
                }
            }

            // Save to localStorage
            localStorage.setItem(
                "vingoCart",
                JSON.stringify(state.items)
            );
        },

        // =====================================
        // REMOVE ITEM
        // =====================================

        removeFromCart: (state, action) => {

            state.items = state.items.filter(
                (cartItem) =>
                    cartItem._id !== action.payload
            );

            // Save to localStorage
            localStorage.setItem(
                "vingoCart",
                JSON.stringify(state.items)
            );
        },

        // =====================================
        // CLEAR CART
        // =====================================

        clearCart: (state) => {

            state.items = [];

            // Remove from localStorage
            localStorage.removeItem("vingoCart");
        },
    },
});

// =====================================
// EXPORT ACTIONS
// =====================================

export const {
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
} = cartSlice.actions;

// =====================================
// EXPORT REDUCER
// =====================================

export default cartSlice.reducer;