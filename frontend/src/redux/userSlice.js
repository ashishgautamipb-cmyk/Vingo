import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",

    initialState: {
        userData: null,
        currentCity: null,
        currentState: null,
        currentAddress: null,
        myOrders: [],
    },

    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload;
        },

        setCurrentCity: (state, action) => {
            state.currentCity = action.payload;
        },

        setCurrentState: (state, action) => {
            state.currentState = action.payload;
        },

        setCurrentAddress: (state, action) => {
            state.currentAddress = action.payload;
        },

        setMyOrders: (state, action) => {
            state.myOrders = action.payload;
        },

        clearUserData: (state) => {
            state.userData = null;
            state.myOrders = [];
        },
    },
});

export const {
    setUserData,
    setCurrentCity,
    setCurrentState,
    setCurrentAddress,
    setMyOrders,
    clearUserData,
} = userSlice.actions;

export default userSlice.reducer;