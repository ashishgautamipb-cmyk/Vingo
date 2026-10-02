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

    const apiKey =
        import.meta.env.VITE_GEOAPIKEY;

    useEffect(() => {

        // ==========================================
        // CHECK API KEY
        // ==========================================

        if (!apiKey) {
            console.log(
                "Geoapify API key is missing"
            );
            return;
        }


        // ==========================================
        // CHECK GEOLOCATION
        // ==========================================

        if (!navigator.geolocation) {
            console.log(
                "Geolocation is not supported by this browser"
            );
            return;
        }


        // ==========================================
        // GET CURRENT LOCATION
        // ==========================================

        navigator.geolocation.getCurrentPosition(

            async (position) => {

                try {

                    const latitude =
                        position.coords.latitude;

                    const longitude =
                        position.coords.longitude;


                    console.log(
                        "Current Latitude:",
                        latitude
                    );

                    console.log(
                        "Current Longitude:",
                        longitude
                    );


                    // ==========================================
                    // REVERSE GEOCODING
                    // ==========================================

                    const result =
                        await axios.get(
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


                    const location =
                        result.data?.results?.[0];


                    if (!location) {

                        console.log(
                            "Location data not found"
                        );

                        return;
                    }


                    // ==========================================
                    // CURRENT CITY
                    // ==========================================

                    const detectedCity =
                        location.city ||
                        location.suburb ||
                        location.district ||
                        location.county ||
                        null;


                    // ==========================================
                    // CURRENT STATE
                    // ==========================================

                    const detectedState =
                        location.state ||
                        location.state_district ||
                        null;


                    // ==========================================
                    // CURRENT ADDRESS
                    // ==========================================

                    const detectedAddress =
                        location.address_line1 ||
                        location.formatted ||
                        null;


                    console.log(
                        "Current City:",
                        detectedCity
                    );

                    console.log(
                        "Current State:",
                        detectedState
                    );

                    console.log(
                        "Current Address:",
                        detectedAddress
                    );


                    // ==========================================
                    // SAVE CURRENT CITY
                    // ==========================================

                    if (detectedCity) {

                        dispatch(
                            setCurrentCity(
                                detectedCity
                            )
                        );
                    }


                    // ==========================================
                    // SAVE CURRENT STATE
                    // ==========================================

                    if (detectedState) {

                        dispatch(
                            setCurrentState(
                                detectedState
                            )
                        );
                    }


                    // ==========================================
                    // SAVE CURRENT ADDRESS
                    // ==========================================

                    if (detectedAddress) {

                        dispatch(
                            setCurrentAddress(
                                detectedAddress
                            )
                        );
                    }

                } catch (error) {

                    console.log(
                        "Reverse geocoding error:",
                        error.response?.data ||
                        error.message
                    );
                }
            },


            // ==========================================
            // LOCATION ERROR
            // ==========================================

            (error) => {

                console.log(
                    "Location error:",
                    error.code,
                    error.message
                );

            },


            // ==========================================
            // LOCATION OPTIONS
            // ==========================================

            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );

    }, [
        apiKey,
        dispatch,
    ]);
}

export default useGetCity;