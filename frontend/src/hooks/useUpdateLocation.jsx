import { useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { serverUrl } from "../App";

function useUpdateLocation() {

    const { userData } = useSelector(
        (state) => state.user
    );

    useEffect(() => {

        if (!userData) {
            return;
        }

        // Only delivery boy needs
        // continuous location updates
        if (
            userData.role !==
            "deliveryBoy"
        ) {
            return;
        }

        if (!navigator.geolocation) {
            console.log(
                "Geolocation is not supported"
            );

            return;
        }

        const updateLocation =
            async (
                latitude,
                longitude
            ) => {

                try {

                    const result =
                        await axios.put(
                            `${serverUrl}/api/user/update-location`,
                            {
                                latitude,
                                longitude
                            },
                            {
                                withCredentials:
                                    true
                            }
                        );

                    console.log(
                        "Delivery boy location updated:",
                        result.data
                    );

                } catch (error) {

                    console.log(
                        "Update location error:",
                        error.response
                            ?.data ||
                        error.message
                    );
                }
            };

        const watchId =
            navigator.geolocation.watchPosition(

                (position) => {

                    const latitude =
                        position.coords
                            .latitude;

                    const longitude =
                        position.coords
                            .longitude;

                    console.log(
                        "Current delivery boy location:",
                        {
                            latitude,
                            longitude
                        }
                    );

                    updateLocation(
                        latitude,
                        longitude
                    );
                },

                (error) => {

                    console.log(
                        "Location error:",
                        error.message
                    );
                },

                {
                    enableHighAccuracy:
                        true,

                    timeout:
                        10000,

                    maximumAge:
                        10000
                }
            );

        return () => {

            navigator.geolocation.clearWatch(
                watchId
            );

        };

    }, [userData]);

    return null;
}

export default useUpdateLocation;