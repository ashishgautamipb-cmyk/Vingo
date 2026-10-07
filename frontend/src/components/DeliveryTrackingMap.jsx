import {
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
// LEAFLET MARKER ICON FIX
// ======================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
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
            !customerPosition ||
            !deliveryBoyPosition
        ) {
            return;
        }


        console.log(
            "========== MAP CONTROLLER =========="
        );

        console.log(
            "CUSTOMER:",
            customerPosition
        );

        console.log(
            "DELIVERY BOY:",
            deliveryBoyPosition
        );


        const updateMap = () => {

            // Important when map is inside
            // a hidden/dynamic container
            map.invalidateSize();


            const bounds =
                L.latLngBounds([
                    customerPosition,
                    deliveryBoyPosition
                ]);


            if (
                bounds.isValid()
            ) {

                map.fitBounds(
                    bounds,
                    {
                        padding: [
                            60,
                            60
                        ],
                        maxZoom: 17,
                        animate: false
                    }
                );

            }

        };


        // Initial update
        updateMap();


        // Give Leaflet another chance after
        // browser layout calculation
        const timer1 =
            setTimeout(
                updateMap,
                200
            );


        const timer2 =
            setTimeout(
                updateMap,
                700
            );


        // Watch container size changes
        let resizeObserver = null;


        if (
            typeof ResizeObserver !==
            "undefined"
        ) {

            const container =
                map.getContainer();


            resizeObserver =
                new ResizeObserver(
                    () => {

                        map.invalidateSize();

                    }
                );


            resizeObserver.observe(
                container
            );

        }


        return () => {

            clearTimeout(timer1);
            clearTimeout(timer2);


            if (
                resizeObserver
            ) {

                resizeObserver.disconnect();

            }

        };

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


    // ==================================================
    // VALIDATE POSITIONS
    // ==================================================

    const isValidPosition = (
        position
    ) => {

        if (
            !Array.isArray(position)
        ) {
            return false;
        }


        if (
            position.length !== 2
        ) {
            return false;
        }


        const latitude =
            Number(position[0]);

        const longitude =
            Number(position[1]);


        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {
            return false;
        }


        if (
            latitude < -90 ||
            latitude > 90
        ) {
            return false;
        }


        if (
            longitude < -180 ||
            longitude > 180
        ) {
            return false;
        }


        return true;

    };


    if (
        !isValidPosition(
            customerPosition
        ) ||
        !isValidPosition(
            deliveryBoyPosition
        )
    ) {

        console.log(
            "MAP DATA INVALID"
        );


        return (

            <div
                style={{
                    width: "100%",
                    height: "400px",
                    minHeight: "400px",
                    background: "#f3f4f6",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    padding: "20px"
                }}
            >

                <div>

                    <div
                        style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "#6b7280"
                        }}
                    >
                        Location unavailable
                    </div>


                    <div
                        style={{
                            marginTop: "6px",
                            fontSize: "14px",
                            color: "#9ca3af"
                        }}
                    >
                        Waiting for location data...
                    </div>

                </div>

            </div>

        );

    }


    // ==================================================
    // CONVERT TO NUMBERS
    // ==================================================

    const customerLatLng = [
        Number(
            customerPosition[0]
        ),
        Number(
            customerPosition[1]
        )
    ];


    const deliveryBoyLatLng = [
        Number(
            deliveryBoyPosition[0]
        ),
        Number(
            deliveryBoyPosition[1]
        )
    ];


    console.log(
        "CUSTOMER LAT LNG:",
        customerLatLng
    );


    console.log(
        "DELIVERY BOY LAT LNG:",
        deliveryBoyLatLng
    );


    // ==================================================
    // CENTER
    // ==================================================

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


    // ==================================================
    // RETURN MAP
    // ==================================================

    return (

        <div
            style={{
                width: "100%",
                height: "400px",
                minHeight: "400px",
                position: "relative",
                overflow: "hidden",
                borderRadius: "12px"
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

                {/* ======================================
                    OPEN STREET MAP
                ====================================== */}

                <TileLayer

                    attribution="&copy; OpenStreetMap contributors"

                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

                />


                {/* ======================================
                    MAP CONTROLLER
                ====================================== */}

                <MapController

                    customerPosition={
                        customerLatLng
                    }

                    deliveryBoyPosition={
                        deliveryBoyLatLng
                    }

                />


                {/* ======================================
                    CUSTOMER MARKER
                ====================================== */}

                <Marker
                    position={
                        customerLatLng
                    }
                >

                    <Popup>

                        <strong>
                            Customer Location
                        </strong>

                    </Popup>

                </Marker>


                {/* ======================================
                    DELIVERY BOY MARKER
                ====================================== */}

                <Marker
                    position={
                        deliveryBoyLatLng
                    }
                >

                    <Popup>

                        <strong>
                            Delivery Boy Location
                        </strong>

                    </Popup>

                </Marker>


                {/* ======================================
                    ROUTE LINE
                ====================================== */}

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