import React, {
    useEffect
} from "react";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    useMap
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";


// =====================================================
// FIX LEAFLET DEFAULT MARKER ICON
// =====================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});


// =====================================================
// MAP CONTROLLER
// =====================================================

const MapController = ({
    customerPosition,
    deliveryBoyPosition
}) => {

    const map = useMap();


    // =================================================
    // FIX MAP SIZE
    // =================================================

    useEffect(() => {

        const timer =
            setTimeout(() => {

                map.invalidateSize();

            }, 200);


        return () => {

            clearTimeout(timer);

        };

    }, [
        map
    ]);


    // =================================================
    // MOVE MAP TO MARKERS
    // =================================================

    useEffect(() => {

        if (
            customerPosition &&
            deliveryBoyPosition
        ) {

            const bounds =
                L.latLngBounds([
                    customerPosition,
                    deliveryBoyPosition
                ]);


            map.fitBounds(
                bounds,
                {
                    padding: [
                        50,
                        50
                    ],

                    maxZoom: 17
                }
            );

        }

        else if (
            customerPosition
        ) {

            map.setView(
                customerPosition,
                16
            );

        }

        else if (
            deliveryBoyPosition
        ) {

            map.setView(
                deliveryBoyPosition,
                16
            );

        }


        const timer =
            setTimeout(() => {

                map.invalidateSize();

            }, 300);


        return () => {

            clearTimeout(timer);

        };

    }, [
        customerPosition,
        deliveryBoyPosition,
        map
    ]);


    return null;

};


// =====================================================
// DISTANCE CALCULATOR
// =====================================================

const calculateDistance = (
    position1,
    position2
) => {

    if (
        !position1 ||
        !position2
    ) {

        return null;

    }


    const earthRadius = 6371000;


    const latitude1 =
        position1[0] *
        Math.PI /
        180;


    const latitude2 =
        position2[0] *
        Math.PI /
        180;


    const differenceLatitude =
        (
            position2[0] -
            position1[0]
        ) *
        Math.PI /
        180;


    const differenceLongitude =
        (
            position2[1] -
            position1[1]
        ) *
        Math.PI /
        180;


    const a =
        Math.sin(
            differenceLatitude / 2
        ) *
        Math.sin(
            differenceLatitude / 2
        ) +

        Math.cos(latitude1) *
        Math.cos(latitude2) *

        Math.sin(
            differenceLongitude / 2
        ) *
        Math.sin(
            differenceLongitude / 2
        );


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return (
        earthRadius *
        c
    );

};


// =====================================================
// DELIVERY TRACKING MAP
// =====================================================

const DeliveryTrackingMap = ({
    customerPosition,
    deliveryBoyPosition
}) => {

    const defaultPosition =
        customerPosition ||
        deliveryBoyPosition ||
        [
            28.5355,
            77.3910
        ];


    const distance =
        calculateDistance(
            customerPosition,
            deliveryBoyPosition
        );


    return (

        <div
            className="
                mx-5
                mt-4
                rounded-xl
                overflow-hidden
                border
                border-gray-200
                bg-white
            "
        >

            {/* =================================================
                MAP HEADER
            ================================================= */}

            <div
                className="
                    px-4
                    py-3
                    bg-gray-50
                    border-b
                "
            >

                <div
                    className="
                        text-sm
                        font-semibold
                        text-gray-800
                    "
                >
                    Live Delivery Tracking
                </div>


                {distance !== null && (

                    <div
                        className="
                            text-sm
                            text-gray-500
                            mt-1
                        "
                    >

                        Distance between you and
                        delivery boy:{" "}

                        <span
                            className="
                                font-semibold
                                text-[#ff4d2d]
                            "
                        >

                            {distance >= 1000

                                ? `${(
                                    distance /
                                    1000
                                ).toFixed(
                                    2
                                )} km`

                                : `${Math.round(
                                    distance
                                )} m`
                            }

                        </span>

                    </div>

                )}

            </div>


            {/* =================================================
                MAP
            ================================================= */}

            <div
                style={{
                    width: "100%",
                    height: "350px",
                    position: "relative"
                }}
            >

                <MapContainer

                    center={
                        defaultPosition
                    }

                    zoom={16}

                    scrollWheelZoom={true}

                    style={{
                        width: "100%",
                        height: "100%"
                    }}

                >

                    <TileLayer

                        attribution="
                            &copy; OpenStreetMap contributors
                        "

                        url="
                            https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
                        "

                    />


                    <MapController

                        customerPosition={
                            customerPosition
                        }

                        deliveryBoyPosition={
                            deliveryBoyPosition
                        }

                    />


                    {/* =========================================
                        CUSTOMER MARKER
                    ========================================= */}

                    {customerPosition && (

                        <Marker
                            position={
                                customerPosition
                            }
                        >

                            <Popup>

                                <strong>
                                    Customer Location
                                </strong>

                                <br />

                                Delivery destination

                            </Popup>

                        </Marker>

                    )}


                    {/* =========================================
                        DELIVERY BOY MARKER
                    ========================================= */}

                    {deliveryBoyPosition && (

                        <Marker
                            position={
                                deliveryBoyPosition
                            }
                        >

                            <Popup>

                                <strong>
                                    Delivery Boy
                                </strong>

                                <br />

                                Your current location

                            </Popup>

                        </Marker>

                    )}


                    {/* =========================================
                        LINE BETWEEN LOCATIONS
                    ========================================= */}

                    {customerPosition &&
                        deliveryBoyPosition && (

                        <Polyline
                            positions={[
                                deliveryBoyPosition,
                                customerPosition
                            ]}
                            pathOptions={{
                                weight: 5
                            }}
                        />

                    )}

                </MapContainer>

            </div>


            {/* =================================================
                DISTANCE FOOTER
            ================================================= */}

            {distance !== null && (

                <div
                    className="
                        px-4
                        py-3
                        border-t
                        text-center
                    "
                >

                    {distance <= 200 ? (

                        <p
                            className="
                                text-green-600
                                font-semibold
                            "
                        >

                            ✓ Delivery boy is within
                            200 meters

                        </p>

                    ) : (

                        <p
                            className="
                                text-gray-600
                            "
                        >

                            Delivery boy is{" "}

                            <span
                                className="
                                    font-semibold
                                "
                            >

                                {distance >= 1000

                                    ? `${(
                                        distance /
                                        1000
                                    ).toFixed(
                                        2
                                    )} km`

                                    : `${Math.round(
                                        distance
                                    )} meters`
                                }

                            </span>

                            {" "}away

                        </p>

                    )}

                </div>

            )}

        </div>

    );

};


export default DeliveryTrackingMap;