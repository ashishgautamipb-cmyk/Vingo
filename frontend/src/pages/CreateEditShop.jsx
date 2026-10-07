import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
    MdAdd,
    MdEdit,
    MdRestaurant,
    MdLocationOn,
    MdMyLocation
} from "react-icons/md";

import { serverUrl } from "../App";
import { setMyShopData } from "../redux/ownerSlice";

const CreateEditShop = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { myShopData } = useSelector(
        (state) => state.owner
    );

    /*
    =========================================
    CURRENT USER LOCATION
    =========================================
    */

    const {
        currentCity,
        currentState,
        currentAddress
    } = useSelector(
        (state) => state.user
    );


    /*
    =========================================
    FORM DATA
    =========================================
    */

    const [formData, setFormData] = useState({
        name: "",
        city: "",
        state: "",
        address: ""
    });

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");

    const [loading, setLoading] =
        useState(false);

    const [locationLoading, setLocationLoading] =
        useState(false);


    /*
    =========================================
    LOAD SHOP / CURRENT LOCATION
    =========================================
    */

    useEffect(() => {

        /*
        -----------------------------------------
        IF SHOP ALREADY EXISTS
        -----------------------------------------
        */

        if (myShopData) {

            setFormData({
                name: myShopData.name || "",
                city: myShopData.city || "",
                state: myShopData.state || "",
                address: myShopData.address || ""
            });

            setPreview(
                myShopData.image || ""
            );

            return;
        }


        /*
        -----------------------------------------
        NEW RESTAURANT
        USE CURRENT LOCATION
        -----------------------------------------
        */

        setFormData((prev) => ({
            ...prev,

            city:
                prev.city ||
                currentCity ||
                "",

            state:
                prev.state ||
                currentState ||
                "",

            address:
                prev.address ||
                currentAddress ||
                ""
        }));

    }, [
        myShopData,
        currentCity,
        currentState,
        currentAddress
    ]);


    /*
    =========================================
    GET CURRENT LOCATION
    =========================================
    */

    const getCurrentLocation = () => {

        if (!navigator.geolocation) {

            alert(
                "Geolocation is not supported by your browser."
            );

            return;
        }

        setLocationLoading(true);

        navigator.geolocation.getCurrentPosition(

            async (position) => {

                try {

                    const latitude =
                        position.coords.latitude;

                    const longitude =
                        position.coords.longitude;


                    console.log(
                        "CURRENT LOCATION:",
                        {
                            latitude,
                            longitude
                        }
                    );


                    /*
                    =================================
                    GEOAPIFY REVERSE GEOCODING
                    =================================
                    */

                    const apiKey =
                        import.meta.env.VITE_GEOAPIKEY;

                    if (!apiKey) {

                        alert(
                            "Geoapify API key is missing."
                        );

                        return;
                    }


                    const result =
                        await axios.get(
                            "https://api.geoapify.com/v1/geocode/reverse",
                            {
                                params: {
                                    lat: latitude,
                                    lon: longitude,
                                    apiKey
                                }
                            }
                        );


                    const properties =
                        result.data?.features?.[0]
                            ?.properties;


                    if (!properties) {

                        alert(
                            "Unable to find address from your location."
                        );

                        return;
                    }


                    const city =
                        properties.city ||
                        properties.town ||
                        properties.village ||
                        properties.county ||
                        "";

                    const state =
                        properties.state ||
                        "";

                    const address =
                        properties.formatted ||
                        "";


                    /*
                    =================================
                    FILL FORM
                    =================================
                    */

                    setFormData((prev) => ({

                        ...prev,

                        city,
                        state,
                        address

                    }));


                    console.log(
                        "LOCATION DETAILS:",
                        {
                            city,
                            state,
                            address
                        }
                    );

                } catch (error) {

                    console.log(
                        "REVERSE GEOCODING ERROR:",
                        error.response?.data ||
                        error.message
                    );

                    alert(
                        "Unable to get address from current location."
                    );

                } finally {

                    setLocationLoading(false);

                }

            },

            (error) => {

                console.log(
                    "LOCATION ERROR:",
                    error
                );

                setLocationLoading(false);

                if (error.code === 1) {

                    alert(
                        "Please allow location permission in your browser."
                    );

                } else if (error.code === 2) {

                    alert(
                        "Your location could not be determined."
                    );

                } else if (error.code === 3) {

                    alert(
                        "Location request timed out."
                    );

                } else {

                    alert(
                        "Unable to get your current location."
                    );

                }

            },

            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }

        );

    };


    /*
    =========================================
    AUTOMATICALLY GET LOCATION FOR NEW SHOP
    =========================================
    */

    useEffect(() => {

        /*
        Only get browser location when:
        - creating a new shop
        - Redux doesn't already have location
        */

        if (
            myShopData ||
            currentCity ||
            currentState ||
            currentAddress
        ) {
            return;
        }

        getCurrentLocation();

    }, [
        myShopData,
        currentCity,
        currentState,
        currentAddress
    ]);


    /*
    =========================================
    INPUT CHANGE
    =========================================
    */

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

    };


    /*
    =========================================
    IMAGE CHANGE
    =========================================
    */

    const handleImageChange = (e) => {

        const file =
            e.target.files?.[0];

        if (!file) return;

        setImage(file);

        setPreview(
            URL.createObjectURL(file)
        );

    };


    /*
    =========================================
    CREATE / UPDATE SHOP
    =========================================
    */

    const handleSubmit = async (e) => {

        e.preventDefault();


        if (
            !formData.name.trim() ||
            !formData.city.trim() ||
            !formData.state.trim() ||
            !formData.address.trim()
        ) {

            alert(
                "Please fill all restaurant details."
            );

            return;
        }


        /*
        IMAGE REQUIRED ONLY WHILE CREATING
        */

        if (!myShopData && !image) {

            alert(
                "Please select a restaurant image."
            );

            return;
        }


        try {

            setLoading(true);


            const data =
                new FormData();


            data.append(
                "name",
                formData.name
            );

            data.append(
                "city",
                formData.city
            );

            data.append(
                "state",
                formData.state
            );

            data.append(
                "address",
                formData.address
            );


            if (image) {

                data.append(
                    "image",
                    image
                );

            }


            /*
            =====================================
            GET TOKEN
            =====================================
            */

            const token =
                localStorage.getItem("token");


            /*
            =====================================
            CREATE RESTAURANT
            =====================================
            */

            if (!myShopData) {

                const result =
                    await axios.post(
                        `${serverUrl}/api/shop/create`,
                        data,
                        {
                            withCredentials: true,

                            headers: token
                                ? {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                                : {}
                        }
                    );


                console.log(
                    "CREATE SHOP:",
                    result.data
                );


                if (result.data?.shop) {

                    dispatch(
                        setMyShopData(
                            result.data.shop
                        )
                    );

                }


                alert(
                    "Restaurant created successfully!"
                );

            }


            /*
            =====================================
            UPDATE RESTAURANT
            =====================================
            */

            else {

                const result =
                    await axios.put(
                        `${serverUrl}/api/shop/edit/${myShopData._id}`,
                        data,
                        {
                            withCredentials: true,

                            headers: token
                                ? {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                                : {}
                        }
                    );


                console.log(
                    "EDIT SHOP:",
                    result.data
                );


                if (result.data?.shop) {

                    dispatch(
                        setMyShopData(
                            result.data.shop
                        )
                    );

                }


                alert(
                    "Restaurant updated successfully!"
                );

            }


            setImage(null);

            navigate("/");

        } catch (error) {

            console.log(
                "SHOP ERROR:",
                error.response?.data ||
                error.message
            );

            alert(
                error.response?.data?.message ||
                "Something went wrong."
            );

        } finally {

            setLoading(false);

        }

    };


    /*
    =========================================
    ADD FOOD
    =========================================
    */

    const handleAddItem = () => {

        navigate(
            "/add-item"
        );

    };


    /*
    =========================================
    UI
    =========================================
    */

    return (

        <div className="min-h-screen bg-[#fff9f6] px-4 pt-24 pb-10">

            <div className="max-w-4xl mx-auto">


                {/* =================================
                    HEADER
                ================================= */}

                <div className="mb-6">

                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">

                        {myShopData
                            ? "Manage Your Restaurant"
                            : "Create Your Restaurant"}

                    </h1>

                    <p className="text-sm text-gray-500 mt-1">

                        {myShopData
                            ? "Manage your restaurant details and food items."
                            : "Create your restaurant and start adding food items."}

                    </p>

                </div>


                {/* =================================
                    EXISTING SHOP
                ================================= */}

                {myShopData && (

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">

                            <div className="relative shrink-0">

                                <img
                                    src={myShopData.image}
                                    alt={myShopData.name}
                                    className="w-28 h-28 rounded-xl object-cover"
                                />

                                <div className="absolute -bottom-2 -right-2 bg-[#ff4d2d] text-white w-9 h-9 rounded-full flex items-center justify-center shadow">

                                    <MdRestaurant
                                        size={18}
                                    />

                                </div>

                            </div>


                            <div className="flex-1">

                                <h2 className="text-xl font-bold text-gray-800">

                                    {myShopData.name}

                                </h2>


                                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">

                                    <MdLocationOn
                                        size={17}
                                    />

                                    <span>

                                        {myShopData.city},{" "}
                                        {myShopData.state}

                                    </span>

                                </div>


                                <p className="text-sm text-gray-500 mt-1">

                                    {myShopData.address}

                                </p>


                                <p className="text-xs text-gray-400 mt-2">

                                    {myShopData.items?.length || 0} food items

                                </p>

                            </div>

                        </div>

                    </div>

                )}


                {/* =================================
                    FORM
                ================================= */}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">

                    <div className="flex items-center justify-between mb-6">

                        <div>

                            <h2 className="text-lg font-semibold text-gray-800">

                                {myShopData
                                    ? "Edit Restaurant"
                                    : "Restaurant Details"}

                            </h2>

                            <p className="text-xs text-gray-500 mt-1">

                                {myShopData
                                    ? "Update your restaurant information."
                                    : "Enter your restaurant information below."}

                            </p>

                        </div>


                        {myShopData && (

                            <MdEdit
                                className="text-[#ff4d2d]"
                                size={24}
                            />

                        )}

                    </div>


                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >


                        {/* RESTAURANT NAME */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">

                                Restaurant Name

                            </label>

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter restaurant name"
                                required
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#ff4d2d] transition"
                            />

                        </div>


                        {/* CITY + STATE */}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div>

                                <label className="block text-sm font-medium text-gray-700 mb-2">

                                    City

                                </label>

                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="Current city"
                                    required
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#ff4d2d] transition"
                                />

                            </div>


                            <div>

                                <label className="block text-sm font-medium text-gray-700 mb-2">

                                    State

                                </label>

                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    placeholder="Current state"
                                    required
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#ff4d2d] transition"
                                />

                            </div>

                        </div>


                        {/* ADDRESS */}

                        <div>

                            <div className="flex justify-between items-center mb-2">

                                <label className="block text-sm font-medium text-gray-700">

                                    Restaurant Address

                                </label>


                                {!myShopData && (

                                    <button
                                        type="button"
                                        onClick={getCurrentLocation}
                                        disabled={locationLoading}
                                        className="flex items-center gap-1 text-[#ff4d2d] text-xs font-semibold hover:text-orange-600 disabled:opacity-50"
                                    >

                                        <MdMyLocation
                                            size={15}
                                        />

                                        {locationLoading
                                            ? "Getting location..."
                                            : "Use current location"}

                                    </button>

                                )}

                            </div>


                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Restaurant address"
                                required
                                rows="3"
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#ff4d2d] transition resize-none"
                            />

                        </div>


                        {/* IMAGE */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">

                                Restaurant Image

                            </label>


                            {preview && (

                                <img
                                    src={preview}
                                    alt="Restaurant preview"
                                    className="w-full h-52 md:h-60 object-cover rounded-xl mb-3"
                                />

                            )}


                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="w-full border border-gray-300 rounded-xl p-2 text-sm"
                            />


                            {myShopData && (

                                <p className="text-xs text-gray-400 mt-1">

                                    Leave empty if you don't want to change the image.

                                </p>

                            )}

                        </div>


                        {/* SUBMIT */}

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                locationLoading
                            }
                            className="w-full bg-[#ff4d2d] hover:bg-orange-600 text-white py-3 rounded-full font-semibold transition disabled:opacity-60"
                        >

                            {loading
                                ? myShopData
                                    ? "Updating..."
                                    : "Creating..."
                                : myShopData
                                    ? "Update Restaurant"
                                    : "Create Restaurant"}

                        </button>

                    </form>

                </div>


                {/* =================================
                    FOOD ITEMS
                ================================= */}

                {myShopData && (

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mt-6">

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                            <div>

                                <h2 className="text-lg font-semibold text-gray-800">

                                    Food Items

                                </h2>

                                <p className="text-sm text-gray-500 mt-1">

                                    Add food items to your restaurant menu.

                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="flex items-center justify-center gap-2 bg-[#ff4d2d] hover:bg-orange-600 text-white px-5 py-3 rounded-full font-semibold transition"
                            >

                                <MdAdd
                                    size={20}
                                />

                                Add Food Item

                            </button>

                        </div>


                        {myShopData.items &&
                        myShopData.items.length > 0 ? (

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">

                                {myShopData.items.map(
                                    (item) => (

                                        <div
                                            key={item._id}
                                            className="border border-gray-100 rounded-xl overflow-hidden bg-white"
                                        >

                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-32 object-cover"
                                            />

                                            <div className="p-3">

                                                <h3 className="text-sm font-semibold text-gray-800 truncate">

                                                    {item.name}

                                                </h3>

                                                <p className="text-xs text-gray-500 mt-1">

                                                    {item.category}

                                                </p>

                                                <p className="text-sm font-semibold text-[#ff4d2d] mt-2">

                                                    ₹{item.price}

                                                </p>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        ) : (

                            <div className="mt-5 bg-orange-50 border border-orange-100 rounded-xl p-5 text-center">

                                <MdRestaurant
                                    size={34}
                                    className="mx-auto text-[#ff4d2d]"
                                />

                                <p className="text-sm font-semibold text-gray-800 mt-2">

                                    No food items yet

                                </p>

                                <p className="text-xs text-gray-500 mt-1">

                                    Add your first food item to your restaurant.

                                </p>

                            </div>

                        )}

                    </div>

                )}

            </div>

        </div>

    );
};

export default CreateEditShop;