import { createSlice } from "@reduxjs/toolkit";

const mapSlice = createSlice({
    name: "map",

    initialState: {
        latitude: null,
        longitude: null,
        address: "",
    },

    reducers: {
        setLocation: (state, action) => {
            state.latitude = action.payload.latitude;
            state.longitude = action.payload.longitude;
            state.address = action.payload.address || "";
        },

        clearLocation: (state) => {
            state.latitude = null;
            state.longitude = null;
            state.address = "";
        },
    },
});

export const {
    setLocation,
    clearLocation,
} = mapSlice.actions;

export default mapSlice.reducer;