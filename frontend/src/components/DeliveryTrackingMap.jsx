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


delete L.Icon.Default.prototype._getIconUrl;


L.Icon.Default.mergeOptions({

    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"

});


const MapController = ({
    customerPosition,
    deliveryBoyPosition
}) => {

    const map =
        useMap();


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
                        40,
                        40
                    ]
                }
            );

        } else if (
            customerPosition
        ) {

            map.setView(
                customerPosition,
                15
            );

        } else if (
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


    return (

        <div
            className="
                mt-4
                rounded-xl
                overflow-hidden
                border
                border-gray-200
            "
        >

            <div
                className="
                    px-3
                    py-2
                    bg-gray-50
                    border-b
                    text-xs
                    font-semibold
                    text-gray-700
                "
            >
                Live Delivery Tracking
            </div>


            <MapContainer
                center={
                    defaultPosition
                }
                zoom={14}
                scrollWheelZoom={true}
                className="
                    w-full
                    h-[260px]
                "
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


                {customerPosition && (

                    <Marker
                        position={
                            customerPosition
                        }
                    >

                        <Popup>
                            Customer
                            Delivery Location
                        </Popup>

                    </Marker>

                )}


                {deliveryBoyPosition && (

                    <Marker
                        position={
                            deliveryBoyPosition
                        }
                    >

                        <Popup>
                            Delivery Boy
                        </Popup>

                    </Marker>

                )}


                {customerPosition &&
                    deliveryBoyPosition && (

                    <Polyline
                        positions={[
                            deliveryBoyPosition,
                            customerPosition
                        ]}
                    />

                )}

            </MapContainer>

        </div>

    );

};


export default DeliveryTrackingMap;