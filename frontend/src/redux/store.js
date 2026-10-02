import { configureStore } from "@reduxjs/toolkit";

import userReducer from "./userSlice";
import cartReducer from "./cartSlice";
import ownerReducer from "./ownerSlice";
import mapReducer from "./mapSlice";
import orderReducer from "./orderSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        cart: cartReducer,
        owner: ownerReducer,
        map: mapReducer,
        order: orderReducer
    }
});