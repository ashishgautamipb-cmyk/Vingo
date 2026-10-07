import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";

import {
    setCurrentCity,
    setCurrentState,
    setCurrentAddress,
} from "../redux/userSlice";

function useGetCity() {
    const dispatch = useDispatch();
    const apiKey = import.meta.env.VITE_GEOAPIKEY;

    useEffect(() => {
        // 1. Immediately initialize with cached city if available, else default to "Greater Noida"
        const savedCity = localStorage.getItem("city");
        const defaultCity = savedCity || "Greater Noida";
        dispatch(setCurrentCity(defaultCity));

        // 2. Try fetching accurate GPS location in the background
        if (!apiKey || !navigator.geolocation) {
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;

                    const result = await axios.get(
                        "https://api.geoapify.com/v1/geocode/reverse",
                        {
                            params: {
                                lat: latitude,
                                lon: longitude,
                                format: "json",
                                apiKey: apiKey,
                            },
                        }
                    );

                    const location = result.data?.results?.[0];

                    if (!location) {
                        return;
                    }

                    const detectedCity =
                        location.city ||
                        location.suburb ||
                        location.district ||
                        location.county ||
                        null;

                    const detectedState =
                        location.state ||
                        location.state_district ||
                        null;

                    const detectedAddress =
                        location.address_line1 ||
                        location.formatted ||
                        null;

                    if (detectedCity) {
                        dispatch(setCurrentCity(detectedCity));
                        localStorage.setItem("city", detectedCity);
                    }

                    if (detectedState) {
                        dispatch(setCurrentState(detectedState));
                        localStorage.setItem("state", detectedState);
                    }

                    if (detectedAddress) {
                        dispatch(setCurrentAddress(detectedAddress));
                        localStorage.setItem("address", detectedAddress);
                    }
                } catch (error) {
                    console.warn(
                        "Reverse geocoding error:",
                        error.response?.data || error.message
                    );
                }
            },
            (error) => {
                console.warn(
                    "Geolocation permission or timeout:",
                    error.code,
                    error.message
                );
                // Keep the default or saved city so the page is never blank
            },
            {
                enableHighAccuracy: false,
                timeout: 8000,
                maximumAge: 60000,
            }
        );
    }, [apiKey, dispatch]);
}

export default useGetCity;