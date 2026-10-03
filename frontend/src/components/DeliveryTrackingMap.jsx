import React, { useEffect } from "react";
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

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
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

        console.log(
            "MAP CONTROLLER:",
            {
                customerPosition,
                deliveryBoyPosition
            }
        );

        setTimeout(() => {

            map.invalidateSize();

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
                        padding: [50, 50],
                        maxZoom: 17
                    }
                );
            }

        }, 500);

    }, [
        map,
        customerPosition,
        deliveryBoyPosition
    ]);

    return null;
};


// ======================================================
// MAIN COMPONENT
// ======================================================

const DeliveryTrackingMap = ({
    customerPosition,
    deliveryBoyPosition
}) => {

    console.log(
        "========== DELIVERY MAP =========="
    );

    console.log(
        "CUSTOMER POSITION:",
        customerPosition
    );

    console.log(
        "DELIVERY BOY POSITION:",
        deliveryBoyPosition
    );

    console.log(
        "=================================="
    );


    // --------------------------------------------------
    // SAFETY CHECK
    // --------------------------------------------------

    if (
        !customerPosition ||
        !deliveryBoyPosition
    ) {

        return (
            <div
                style={{
                    width: "100%",
                    height: "350px",
                    background: "#eeeeee",
                    border: "3px solid red",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    fontWeight: "bold"
                }}
            >
                MAP DATA NOT AVAILABLE
            </div>
        );
    }


    // --------------------------------------------------
    // POSITIONS
    // --------------------------------------------------

    const customerLatLng = [
        Number(customerPosition[0]),
        Number(customerPosition[1])
    ];

    const deliveryBoyLatLng = [
        Number(deliveryBoyPosition[0]),
        Number(deliveryBoyPosition[1])
    ];


    console.log(
        "CUSTOMER LAT LNG:",
        customerLatLng
    );

    console.log(
        "DELIVERY BOY LAT LNG:",
        deliveryBoyLatLng
    );


    // --------------------------------------------------
    // DEFAULT CENTER
    // --------------------------------------------------

    const center = [
        (
            customerLatLng[0] +
            deliveryBoyLatLng[0]
        ) / 2,

        (
            customerLatLng[1] +
            deliveryBoyLatLng[1]
        ) / 2
    ];


    return (

        <div
            style={{
                width: "100%",
                height: "400px",
                marginTop: "20px",
                marginBottom: "20px",
                position: "relative",
                zIndex: 1,
                border: "4px solid blue",
                background: "#ddd"
            }}
        >

            <MapContainer

                center={center}

                zoom={15}

                scrollWheelZoom={true}

                style={{
                    width: "100%",
                    height: "100%",
                    minHeight: "400px"
                }}

            >

                <TileLayer

                    attribution='&copy; OpenStreetMap contributors'

                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

                />


                <MapController

                    customerPosition={
                        customerLatLng
                    }

                    deliveryBoyPosition={
                        deliveryBoyLatLng
                    }

                />


                {/* CUSTOMER */}

                <Marker
                    position={customerLatLng}
                >

                    <Popup>
                        Customer Location
                    </Popup>

                </Marker>


                {/* DELIVERY BOY */}

                <Marker
                    position={deliveryBoyLatLng}
                >

                    <Popup>
                        Delivery Boy Location
                    </Popup>

                </Marker>


                {/* ROUTE */}

                <Polyline
                    positions={[
                        deliveryBoyLatLng,
                        customerLatLng
                    ]}
                />

            </MapContainer>

        </div>
    );
};


export default DeliveryTrackingMap;