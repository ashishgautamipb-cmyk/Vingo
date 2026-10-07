import { useEffect, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents,
} from "react-leaflet";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import L from "leaflet";

import {
    setLocation,
} from "../redux/mapSlice";


// ==========================================
// FIX LEAFLET MARKER ICON
// ==========================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});


// ==========================================
// DRAGGABLE MARKER
// ==========================================

function LocationMarker({
    position,
    setPosition,
    setAddress,
}) {
    const map = useMapEvents({
        click(e) {
            const newPosition = [
                e.latlng.lat,
                e.latlng.lng,
            ];

            setPosition(newPosition);

            getAddress(
                e.latlng.lat,
                e.latlng.lng,
                setAddress
            );
        },
    });

    useEffect(() => {
        if (position) {
            map.flyTo(position, 16);
        }
    }, [map, position]);

    if (!position) return null;

    return (
        <Marker
            position={position}
            draggable={true}
            eventHandlers={{
                dragend: async (event) => {
                    const marker =
                        event.target;

                    const newPosition =
                        marker.getLatLng();

                    const coordinates = [
                        newPosition.lat,
                        newPosition.lng,
                    ];

                    setPosition(
                        coordinates
                    );

                    getAddress(
                        newPosition.lat,
                        newPosition.lng,
                        setAddress
                    );
                },
            }}
        />
    );
}


// ==========================================
// GET ADDRESS FROM COORDINATES
// ==========================================

const getAddress = async (
    latitude,
    longitude,
    setAddress
) => {
    try {
        const response =
            await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );

        const data =
            await response.json();

        setAddress(
            data.display_name ||
                "Selected location"
        );

    } catch (error) {
        console.log(
            "ADDRESS ERROR:",
            error
        );

        setAddress(
            "Unable to detect address"
        );
    }
};


// ==========================================
// MAP PAGE
// ==========================================

function MapPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        latitude,
        longitude,
        address,
    } = useSelector(
        (state) => state.map
    );

    const [position, setPosition] =
        useState(null);

    const [selectedAddress, setAddress] =
        useState(address || "");

    const [loading, setLoading] =
        useState(true);


    // ==========================================
    // GET USER CURRENT LOCATION
    // ==========================================

    useEffect(() => {

        if (!navigator.geolocation) {
            setLoading(false);

            // Default location
            setPosition([
                27.1767,
                78.0081,
            ]);

            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (location) => {

                const lat =
                    location.coords.latitude;

                const lng =
                    location.coords.longitude;

                const newPosition = [
                    lat,
                    lng,
                ];

                setPosition(
                    newPosition
                );

                await getAddress(
                    lat,
                    lng,
                    setAddress
                );

                setLoading(false);
            },

            (error) => {

                console.log(
                    "LOCATION ERROR:",
                    error
                );

                // If location permission
                // is denied, use existing
                // saved location.

                if (
                    latitude &&
                    longitude
                ) {
                    setPosition([
                        latitude,
                        longitude,
                    ]);
                } else {
                    // Default fallback
                    // Mathura/nearby area
                    setPosition([
                        27.4924,
                        77.6737,
                    ]);
                }

                setLoading(false);
            },

            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );

    }, [latitude, longitude]);


    // ==========================================
    // CONFIRM LOCATION
    // ==========================================

    const handleConfirm = () => {

        if (!position) {
            return;
        }

        dispatch(
            setLocation({
                latitude:
                    position[0],

                longitude:
                    position[1],

                address:
                    selectedAddress,
            })
        );

        navigate("/checkout");
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div
                className="
                    min-h-screen
                    bg-[#fff9f6]
                    flex
                    items-center
                    justify-center
                "
            >
                <div className="text-center">

                    <div
                        className="
                            w-8
                            h-8
                            border-4
                            border-orange-200
                            border-t-[#ff4d2d]
                            rounded-full
                            animate-spin
                            mx-auto
                        "
                    />

                    <p
                        className="
                            mt-3
                            text-sm
                            text-gray-500
                        "
                    >
                        Detecting your location...
                    </p>

                </div>
            </div>
        );
    }


    // ==========================================
    // PAGE
    // ==========================================

    return (
        <div
            className="
                min-h-screen
                bg-[#fff9f6]
                pt-[70px]
            "
        >

            {/* HEADER */}

            <div
                className="
                    bg-white
                    px-4
                    py-3
                    shadow-sm
                    relative
                    z-[1000]
                "
            >

                <h1
                    className="
                        text-lg
                        font-bold
                        text-gray-800
                    "
                >
                    Select Delivery Location
                </h1>

                <p
                    className="
                        text-xs
                        text-gray-500
                        mt-1
                    "
                >
                    Drag the marker to your
                    delivery location
                </p>

            </div>


            {/* MAP */}

            <div
                className="
                    relative
                    w-full
                    h-[calc(100vh-180px)]
                "
            >

                {position && (
                    <MapContainer
                        center={position}
                        zoom={16}
                        scrollWheelZoom={true}
                        className="w-full h-full"
                    >

                        <TileLayer
                            attribution='&copy; OpenStreetMap contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <LocationMarker
                            position={
                                position
                            }
                            setPosition={
                                setPosition
                            }
                            setAddress={
                                setAddress
                            }
                        />

                    </MapContainer>
                )}


                {/* ADDRESS CARD */}

                <div
                    className="
                        absolute
                        bottom-4
                        left-4
                        right-4
                        md:left-1/2
                        md:-translate-x-1/2
                        md:w-[500px]
                        bg-white
                        rounded-xl
                        shadow-xl
                        p-4
                        z-[1000]
                    "
                >

                    <div
                        className="
                            flex
                            items-start
                            gap-3
                        "
                    >

                        <div
                            className="
                                w-9
                                h-9
                                rounded-full
                                bg-orange-100
                                text-[#ff4d2d]
                                flex
                                items-center
                                justify-center
                                flex-shrink-0
                            "
                        >
                            📍
                        </div>

                        <div
                            className="
                                flex-1
                            "
                        >

                            <p
                                className="
                                    text-xs
                                    font-semibold
                                    text-gray-500
                                "
                            >
                                DELIVERY ADDRESS
                            </p>

                            <p
                                className="
                                    text-sm
                                    text-gray-800
                                    font-medium
                                    mt-1
                                    line-clamp-2
                                "
                            >
                                {selectedAddress ||
                                    "Move the marker to select a location"}
                            </p>

                        </div>

                    </div>


                    {/* CONFIRM */}

                    <button
                        onClick={
                            handleConfirm
                        }
                        className="
                            w-full
                            mt-4
                            h-11
                            rounded-lg
                            bg-[#ff4d2d]
                            hover:bg-orange-600
                            text-white
                            font-semibold
                            text-sm
                            transition
                        "
                    >
                        Confirm Location
                    </button>

                </div>

            </div>

        </div>
    );
}

export default MapPage;