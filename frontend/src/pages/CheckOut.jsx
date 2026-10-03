import React, { useEffect, useState } from "react";
import { serverUrl } from "../App";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import {
  FaLocationDot,
  FaMagnifyingGlass,
  FaLocationCrosshairs,
  FaMoneyBillWave,
  FaCreditCard,
  FaMobileScreenButton,
  FaTruck,
} from "react-icons/fa6";

import {
  useDispatch,
  useSelector
} from "react-redux";

import {
  clearCart
} from "../redux/cartSlice";

import {
  useNavigate
} from "react-router-dom";


// ======================================================
// LEAFLET ICON
// ======================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({

  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

});


const API_KEY =
  import.meta.env.VITE_GEOAPIKEY;


// ======================================================
// MAP MOVE COMPONENT
// ======================================================

function MapMove({
  position
}) {

  const map =
    useMap();


  useEffect(() => {

    if (!position) return;

    map.setView(
      position,
      14
    );

  }, [
    position,
    map
  ]);


  return null;
}


// ======================================================
// CHECKOUT
// ======================================================

function CheckOut() {

  const dispatch =
    useDispatch();


  const navigate =
    useNavigate();


  // ====================================================
  // USER DATA
  // ====================================================

  const {
    currentCity,
    currentAddress,
  } = useSelector(
    (state) => state.user
  );


  // ====================================================
  // CART DATA
  // ====================================================

  const {
    items: cartItems,
  } = useSelector(
    (state) => state.cart
  );


  // ====================================================
  // STATES
  // ====================================================

  const [position, setPosition] =
    useState(null);


  const [search, setSearch] =
    useState("");


  const [address, setAddress] =
    useState(
      currentAddress ||
      currentCity ||
      "Select delivery location"
    );


  const [loading, setLoading] =
    useState(false);


  const [paymentMethod, setPaymentMethod] =
    useState("cod");


  const [placingOrder, setPlacingOrder] =
    useState(false);


  const [locationSelected, setLocationSelected] =
    useState(false);


  // ====================================================
  // GET CURRENT LOCATION AUTOMATICALLY
  // ====================================================

  useEffect(() => {

    getCurrentLocationAutomatically();

  }, []);


  // ====================================================
  // AUTOMATIC LOCATION
  // ====================================================

  const getCurrentLocationAutomatically = () => {

    if (!navigator.geolocation) {

      console.log(
        "Geolocation is not supported by this browser."
      );

      return;
    }


    setLoading(true);


    navigator.geolocation.getCurrentPosition(

      async ({ coords }) => {

        const lat =
          coords.latitude;

        const lon =
          coords.longitude;


        console.log(
          "Checkout current location:",
          {
            latitude: lat,
            longitude: lon,
          }
        );


        setPosition([
          lat,
          lon,
        ]);


        setLocationSelected(
          true
        );


        await getAddress(
          lat,
          lon
        );


        setLoading(false);

      },


      (error) => {

        console.log(
          "Automatic location error:",
          error.message
        );

        setLoading(false);

      },


      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }

    );

  };


  // ====================================================
  // REVERSE GEOCODING
  // ====================================================

  const getAddress = async (
    lat,
    lon
  ) => {

    try {

      setLoading(true);


      const url =
        `https://api.geoapify.com/v1/geocode/reverse` +
        `?lat=${lat}` +
        `&lon=${lon}` +
        `&apiKey=${API_KEY}`;


      const res =
        await fetch(url);


      if (!res.ok) {

        throw new Error(
          "Failed to get address"
        );

      }


      const data =
        await res.json();


      const p =
        data.features?.[0]?.properties;


      if (p) {

        const formattedAddress =
          p.formatted ||
          [
            p.housenumber,
            p.street,
            p.suburb,
            p.city,
            p.state,
            p.postcode,
          ]
            .filter(Boolean)
            .join(", ");


        setAddress(
          formattedAddress
        );

      } else {

        setAddress(
          "Selected delivery location"
        );

      }

    } catch (error) {

      console.log(
        "Reverse geocoding error:",
        error
      );


      setAddress(
        "Selected delivery location"
      );

    } finally {

      setLoading(false);

    }

  };


  // ====================================================
  // SEARCH LOCATION
  // ====================================================

  const searchLocation = async () => {

    if (!search.trim()) {
      return;
    }


    try {

      setLoading(true);


      const url =
        `https://api.geoapify.com/v1/geocode/search` +
        `?text=${encodeURIComponent(search)}` +
        `&limit=1` +
        `&apiKey=${API_KEY}`;


      const res =
        await fetch(url);


      if (!res.ok) {

        throw new Error(
          "Location search failed"
        );

      }


      const data =
        await res.json();


      const location =
        data.features?.[0];


      if (!location) {

        alert(
          "Location not found."
        );

        return;
      }


      const [
        lon,
        lat,
      ] =
        location.geometry.coordinates;


      setPosition([
        lat,
        lon,
      ]);


      setLocationSelected(
        true
      );


      setAddress(
        location.properties.formatted ||
        search
      );


      console.log(
        "Searched delivery location:",
        {
          latitude: lat,
          longitude: lon,
        }
      );


    } catch (error) {

      console.log(
        "Search location error:",
        error
      );


      alert(
        "Unable to search this location."
      );


    } finally {

      setLoading(false);

    }

  };


  // ====================================================
  // CURRENT LOCATION BUTTON
  // ====================================================

  const getCurrentLocation = () => {

    if (!navigator.geolocation) {

      alert(
        "Location is not supported by your browser."
      );

      return;
    }


    setLoading(true);


    navigator.geolocation.getCurrentPosition(

      async ({ coords }) => {

        const lat =
          coords.latitude;

        const lon =
          coords.longitude;


        console.log(
          "Selected current location:",
          {
            latitude: lat,
            longitude: lon,
          }
        );


        setPosition([
          lat,
          lon,
        ]);


        setLocationSelected(
          true
        );


        await getAddress(
          lat,
          lon
        );


        setLoading(false);

      },


      (error) => {

        console.log(
          "Current location error:",
          error.message
        );


        setLoading(false);


        alert(
          "Unable to get your current location. Please allow location permission."
        );

      },


      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }

    );

  };


  // ====================================================
  // DRAG MARKER
  // ====================================================

  const handleDrag = (e) => {

    const {
      lat,
      lng,
    } =
      e.target.getLatLng();


    console.log(
      "Dragged delivery location:",
      {
        latitude: lat,
        longitude: lng,
      }
    );


    setPosition([
      lat,
      lng,
    ]);


    setLocationSelected(
      true
    );


    getAddress(
      lat,
      lng
    );

  };


  // ====================================================
  // CART CALCULATIONS
  // ====================================================

  const subtotal =
    cartItems.reduce(
      (sum, item) =>
        sum +
        Number(item.price) *
        Number(item.quantity),

      0
    );


  const deliveryFee =
    subtotal > 500
      ? 40
      : 0;


  const total =
    subtotal +
    deliveryFee;


  // ====================================================
  // PLACE ORDER
  // ====================================================

  const handlePlaceOrder =
    async () => {

      // -----------------------------------------------
      // CHECK CART
      // -----------------------------------------------

      if (
        !cartItems ||
        cartItems.length === 0
      ) {

        alert(
          "Your cart is empty."
        );

        return;
      }


      // -----------------------------------------------
      // CHECK LOCATION
      // -----------------------------------------------

      if (
        !position ||
        !locationSelected
      ) {

        alert(
          "Please select your delivery location first."
        );

        return;
      }


      // -----------------------------------------------
      // CHECK ADDRESS
      // -----------------------------------------------

      if (
        !address ||
        address ===
        "Select delivery location"
      ) {

        alert(
          "Please select a delivery location."
        );

        return;
      }


      // -----------------------------------------------
      // VALIDATE COORDINATES
      // -----------------------------------------------

      const latitude =
        Number(position[0]);


      const longitude =
        Number(position[1]);


      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {

        alert(
          "Invalid delivery location. Please select your location again."
        );

        return;
      }


      try {

        setPlacingOrder(
          true
        );


        // ==================================================
        // ORDER DATA
        // ==================================================

        const orderData = {

          items:
            cartItems.map(
              (item) => ({

                _id:
                  item._id,

                name:
                  item.name,

                price:
                  Number(
                    item.price
                  ),

                quantity:
                  Number(
                    item.quantity
                  ),

                shop:
                  typeof item.shop ===
                  "object"

                    ? item.shop._id

                    : item.shop,

              })
            ),


          paymentMethod,


          deliveryAddress: {

            text:
              address,

            latitude:
              latitude,

            longitude:
              longitude,

          },

        };


        // ==================================================
        // DEBUG
        // ==================================================

        console.log(
          "================================"
        );

        console.log(
          "ORDER DATA SENT TO BACKEND:"
        );

        console.log(
          orderData
        );

        console.log(
          "CART ITEMS:"
        );

        console.log(
          cartItems
        );

        console.log(
          "ITEMS SENT:"
        );

        console.log(
          orderData.items
        );

        console.log(
          "DELIVERY LOCATION:"
        );

        console.log(
          {
            address,
            latitude,
            longitude,
          }
        );

        console.log(
          "================================"
        );


        // ==================================================
        // GET JWT TOKEN
        // ==================================================

        const token =
          localStorage.getItem(
            "token"
          );


        // ==================================================
        // CHECK TOKEN
        // ==================================================

        if (!token) {

          alert(
            "Your login session has expired. Please login again."
          );

          navigate(
            "/signin"
          );

          return;
        }


        // ==================================================
        // API CALL
        // ==================================================

        const response =
          await fetch(
            `${serverUrl}/api/order/place-order`,
            {

              method: "POST",

              headers: {

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,

              },

              credentials: "include",

              body:
                JSON.stringify(
                  orderData
                ),

            }
          );


        const data =
          await response.json();


        console.log(
          "PLACE ORDER RESPONSE:",
          data
        );


        // ==================================================
        // ERROR
        // ==================================================

        if (!response.ok) {

          throw new Error(
            data.message ||
            "Failed to place order"
          );

        }


        // ==================================================
        // SUCCESS
        // ==================================================

        console.log(
          "Order placed successfully:",
          data
        );


        dispatch(
          clearCart()
        );


        navigate(
          "/order-placed"
        );


      } catch (error) {

        console.error(
          "Place order error:",
          error
        );


        alert(
          error.message ||
          "Something went wrong while placing the order."
        );


      } finally {

        setPlacingOrder(
          false
        );

      }

    };


  // ====================================================
  // UI
  // ====================================================

  return (

    <div className="min-h-screen bg-[#fff9f6] p-3">

      <div className="max-w-[500px] mx-auto bg-white rounded-xl shadow-sm p-3">

        {/* ==================================================
            TITLE
        ================================================== */}

        <h1 className="text-lg font-semibold text-gray-800 mb-4">
          Checkout
        </h1>


        {/* ==================================================
            DELIVERY LOCATION
        ================================================== */}

        <h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">

          <FaLocationDot
            className="text-[#ff4d2d]"
            size={13}
          />

          Delivery Location

        </h2>


        {/* ==================================================
            SEARCH
        ================================================== */}

        <div className="flex gap-2 mb-2">

          <div className="flex-1 flex items-center border border-[#ff4d2d] rounded-lg bg-white px-2">

            <FaMagnifyingGlass
              className="text-[#ff4d2d] mr-2"
              size={12}
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              onKeyDown={(e) => {

                if (
                  e.key ===
                  "Enter"
                ) {

                  searchLocation();

                }

              }}
              placeholder="Search street, village, house..."
              className="w-full py-2 outline-none text-xs"
            />

          </div>


          <button
            onClick={
              searchLocation
            }
            className="w-9 rounded-lg bg-[#ff4d2d] text-white flex items-center justify-center"
          >

            <FaMagnifyingGlass
              size={13}
            />

          </button>

        </div>


        {/* ==================================================
            MAP
        ================================================== */}

        <div className="relative rounded-lg overflow-hidden border">

          {position ? (

            <MapContainer
              center={position}
              zoom={14}
              scrollWheelZoom={true}
              className="h-[250px] w-full"
            >

              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />


              <MapMove
                position={position}
              />


              <Marker
                position={position}
                draggable={true}
                eventHandlers={{
                  dragend:
                    handleDrag,
                }}
              >

                <Popup>
                  Delivery Location
                </Popup>

              </Marker>

            </MapContainer>

          ) : (

            <div className="h-[250px] w-full flex flex-col items-center justify-center bg-gray-100">

              <FaLocationCrosshairs
                className="text-[#ff4d2d] mb-2"
                size={25}
              />

              <p className="text-sm font-semibold text-gray-700">
                Getting your location...
              </p>

              <p className="text-[10px] text-gray-500 mt-1">
                Please allow location access
              </p>

            </div>

          )}


          {/* CURRENT LOCATION */}

          <button
            onClick={
              getCurrentLocation
            }
            title="Use current location"
            className="absolute right-2 bottom-2 z-[1000] w-9 h-9 bg-white rounded-lg shadow-md flex items-center justify-center text-[#ff4d2d]"
          >

            <FaLocationCrosshairs
              size={16}
            />

          </button>

        </div>


        {/* ==================================================
            LOCATION INFO
        ================================================== */}

        <p className="mt-2 p-2 bg-orange-50 border border-orange-100 rounded-lg text-[10px] text-orange-700">

          Drag the marker to your exact
          house, street or delivery
          location.

        </p>


        {/* ==================================================
            SELECTED ADDRESS
        ================================================== */}

        <div className="mt-2 bg-gray-50 border rounded-lg p-2.5">

          <div className="flex items-start gap-2">

            <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center">

              <FaLocationDot
                className="text-[#ff4d2d]"
                size={12}
              />

            </div>


            <div>

              <p className="text-[10px] text-gray-500">
                Selected Delivery Address
              </p>


              <p className="text-xs font-semibold text-gray-800 mt-0.5">

                {loading
                  ? "Finding address..."
                  : address}

              </p>


              {position && (

                <p className="text-[9px] text-gray-400 mt-1">

                  {position[0].toFixed(
                    6
                  )}

                  {", "}

                  {position[1].toFixed(
                    6
                  )}

                </p>

              )}

            </div>

          </div>

        </div>


        {/* ==================================================
            PAYMENT
        ================================================== */}

        <h2 className="text-sm font-semibold text-gray-700 mt-5 mb-2">
          Payment Method
        </h2>


        <div className="grid grid-cols-2 gap-2">


          {/* COD */}

          <button
            onClick={() =>
              setPaymentMethod(
                "cod"
              )
            }
            className={`text-left p-2.5 rounded-lg border ${
              paymentMethod ===
              "cod"
                ? "border-orange-300 bg-orange-50"
                : "border-gray-200"
            }`}
          >

            <div className="flex items-center gap-2">

              <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">

                <FaMoneyBillWave
                  className="text-green-600"
                  size={12}
                />

              </div>


              <div>

                <p className="text-xs font-semibold">
                  Cash On Delivery
                </p>

                <p className="text-[9px] text-gray-500">
                  Pay when your food arrives
                </p>

              </div>

            </div>

          </button>


          {/* ONLINE */}

          <button
            onClick={() =>
              setPaymentMethod(
                "online"
              )
            }
            className={`text-left p-2.5 rounded-lg border ${
              paymentMethod ===
              "online"
                ? "border-purple-300 bg-purple-50"
                : "border-gray-200"
            }`}
          >

            <div className="flex items-center gap-2">

              <div className="flex gap-1">

                <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center">

                  <FaMobileScreenButton
                    className="text-purple-600"
                    size={11}
                  />

                </div>


                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">

                  <FaCreditCard
                    className="text-blue-600"
                    size={11}
                  />

                </div>

              </div>


              <div>

                <p className="text-xs font-semibold">
                  UPI / Card
                </p>

                <p className="text-[9px] text-gray-500">
                  Pay securely online
                </p>

              </div>

            </div>

          </button>

        </div>


        {/* ==================================================
            ORDER SUMMARY
        ================================================== */}

        <h2 className="text-sm font-semibold text-gray-700 mt-5 mb-2">
          Order Summary
        </h2>


        <div className="border rounded-lg bg-gray-50">

          <div className="p-2">

            {cartItems.length ===
            0 ? (

              <p className="text-xs text-gray-500 text-center py-3">
                Your cart is empty
              </p>

            ) : (

              cartItems.map(
                (item) => (

                  <div
                    key={item._id}
                    className="flex justify-between py-1 text-xs"
                  >

                    <span className="text-gray-700 truncate max-w-[70%]">

                      {item.name}

                      {" × "}

                      {item.quantity}

                    </span>


                    <span>

                      ₹
                      {Number(
                        item.price
                      ) *
                        Number(
                          item.quantity
                        )}

                    </span>

                  </div>

                )
              )

            )}

          </div>


          <div className="border-t p-2">

            <div className="flex justify-between text-xs text-gray-600 mb-1">

              <span>
                Subtotal
              </span>

              <span>
                ₹{subtotal}
              </span>

            </div>


            <div className="flex justify-between text-xs text-gray-600 mb-1">

              <span>
                Delivery Fee
              </span>


              <span
                className={
                  deliveryFee ===
                  0
                    ? "text-green-600"
                    : "text-gray-700"
                }
              >

                {deliveryFee ===
                0
                  ? "Free"
                  : `₹${deliveryFee}`}

              </span>

            </div>


            <div className="flex justify-between text-sm font-bold text-gray-800 pt-1 border-t">

              <span>
                Total
              </span>


              <span>
                ₹{total}
              </span>

            </div>

          </div>

        </div>


        {/* ==================================================
            PLACE ORDER BUTTON
        ================================================== */}

        <button
          onClick={
            handlePlaceOrder
          }
          disabled={
            !cartItems.length ||
            placingOrder ||
            !locationSelected
          }
          className="w-full mt-4 py-2.5 rounded-lg bg-[#ff4d2d] hover:bg-orange-600 disabled:bg-gray-300 text-white text-sm font-semibold flex items-center justify-center gap-2"
        >

          <FaTruck
            size={14}
          />


          {placingOrder

            ? "Placing Order..."

            : !locationSelected

            ? "Select Delivery Location"

            : `Place Order • ₹${total}`}

        </button>

      </div>

    </div>

  );

}


export default CheckOut;