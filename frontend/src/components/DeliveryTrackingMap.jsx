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


// ======================================================
// FIX LEAFLET DEFAULT ICON
// ======================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({

    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"

});


// ======================================================
// MAP CONTROLLER
// ======================================================

const MapController = ({
    customerPosition,
    deliveryBoyPosition
}) => {

    const map = useMap();


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
                    ]
                }
            );

        }

        else if (
            customerPosition
        ) {

            map.setView(
                customerPosition,
                15
            );

        }

        else if (
            deliveryBoyPosition
        ) {

            map.setView(
                deliveryBoyPosition,
                15
            );

        }

    }, [
        customerPosition,
        deliveryBoyPosition,
        map
    ]);


    return null;

};


// ======================================================
// CALCULATE DISTANCE
// ======================================================

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


    const earthRadius =
        6371000;


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


// ======================================================
// MAIN COMPONENT
// ======================================================

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
                mt-4
                rounded-xl
                overflow-hidden
                border
                border-gray-200
                bg-white
            "
        >

            {/* HEADER */}

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
                                text-orange-500
                            "
                        >

                            {distance >= 1000
                                ? `${(
                                    distance /
                                    1000
                                ).toFixed(
                                    2
                                )} KM`
                                : `${Math.round(
                                    distance
                                )} m`
                            }

                        </span>

                    </div>

                )}

            </div>


            {/* MAP */}

            <MapContainer
                center={
                    defaultPosition
                }
                zoom={14}
                scrollWheelZoom={true}
                className="
                    w-full
                    h-[300px]
                "
            >

                <TileLayer
                    attribution="
                        &copy; OpenStreetMap contributors
                    "
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />


                <MapController
                    customerPosition={
                        customerPosition
                    }
                    deliveryBoyPosition={
                        deliveryBoyPosition
                    }
                />


                {/* CUSTOMER */}

                {customerPosition && (

                    <Marker
                        position={
                            customerPosition
                        }
                    >

                        <Popup>

                            <strong>
                                Your Location
                            </strong>

                            <br />

                            Customer delivery location

                        </Popup>

                    </Marker>

                )}


                {/* DELIVERY BOY */}

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

                            Current location

                        </Popup>

                    </Marker>

                )}


                {/* LINE */}

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


            {/* DISTANCE STATUS */}

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
                            Delivery boy is within
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
                                {Math.round(
                                    distance
                                )} meters
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