import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",

    initialState: {
        userData: null,
        currentCity: null,
        currentState: null,
        currentAddress: null,
        myOrders: [],
        authInitialized: false,
    },

    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload;
            state.authInitialized = true;
        },

        setAuthInitialized: (state, action) => {
            state.authInitialized = action.payload;
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
            state.authInitialized = true;
        },
    },
});

export const {
    setUserData,
    setAuthInitialized,
    setCurrentCity,
    setCurrentState,
    setCurrentAddress,
    setMyOrders,
    clearUserData,
} = userSlice.actions;

export default userSlice.reducer;