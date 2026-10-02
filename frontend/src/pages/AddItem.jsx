import React, {
    useState
} from "react";

import axios from "axios";

import {
    useDispatch
} from "react-redux";

import {
    useNavigate
} from "react-router-dom";

import {
    serverUrl
} from "../App";

import {
    setMyShopData
} from "../redux/ownerSlice";


const AddItem = () => {

    const navigate =
        useNavigate();

    const dispatch =
        useDispatch();


    const [formData, setFormData] =
        useState({

            name: "",

            category: "",

            foodType: "",

            price: "",

        });


    const [image, setImage] =
        useState(null);


    const [preview, setPreview] =
        useState("");


    const [loading, setLoading] =
        useState(false);


    // ==========================================
    // CHANGE INPUT
    // ==========================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setFormData(
            (prev) => ({

                ...prev,

                [name]: value,

            })
        );
    };


    // ==========================================
    // IMAGE
    // ==========================================

    const handleImageChange = (e) => {

        const file =
            e.target.files[0];


        if (!file) return;


        setImage(file);


        setPreview(
            URL.createObjectURL(file)
        );
    };


    // ==========================================
    // SUBMIT
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        if (!image) {

            alert(
                "Please select a food image"
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
                "category",
                formData.category
            );


            data.append(
                "foodType",
                formData.foodType
            );


            data.append(
                "price",
                formData.price
            );


            data.append(
                "image",
                image
            );


            const result =
                await axios.post(

                    `${serverUrl}/api/item/add-item`,

                    data,

                    {
                        withCredentials: true
                    }

                );


            console.log(
                "ADD ITEM RESPONSE:",
                result.data
            );


            if (
                result.data.shop
            ) {

                dispatch(
                    setMyShopData(
                        result.data.shop
                    )
                );

            }


            alert(
                "Food item added successfully"
            );


            navigate("/");


        } catch (error) {

            console.log(
                "ADD ITEM ERROR:",
                error.response?.data ||
                error.message
            );


            alert(

                error.response?.data?.message ||

                "Failed to add food item"

            );

        } finally {

            setLoading(false);

        }
    };


    return (

        <div className="min-h-screen bg-[#fff9f6] px-4 pt-24 pb-10">


            <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md p-6">


                <h1 className="text-2xl font-bold text-gray-800 mb-1">

                    Add Food Item

                </h1>


                <p className="text-sm text-gray-500 mb-6">

                    Add a new item to your restaurant menu.

                </p>


                <form
                    onSubmit={
                        handleSubmit
                    }
                    className="space-y-5"
                >


                    {/* FOOD NAME */}

                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">

                            Food Name

                        </label>


                        <input

                            type="text"

                            name="name"

                            value={
                                formData.name
                            }

                            onChange={
                                handleChange
                            }

                            placeholder="Enter food name"

                            required

                            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#ff4d2d]"

                        />

                    </div>


                    {/* CATEGORY */}

                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">

                            Category

                        </label>


                        <select

                            name="category"

                            value={
                                formData.category
                            }

                            onChange={
                                handleChange
                            }

                            required

                            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#ff4d2d]"

                        >

                            <option value="">

                                Select Category

                            </option>


                            <option value="Snacks">

                                Snacks

                            </option>


                            <option value="Main Course">

                                Main Course

                            </option>


                            <option value="Desserts">

                                Desserts

                            </option>


                            <option value="Pizza">

                                Pizza

                            </option>


                            <option value="Burgers">

                                Burgers

                            </option>


                            <option value="Sandwiches">

                                Sandwiches

                            </option>


                            <option value="South Indian">

                                South Indian

                            </option>


                            <option value="North Indian">

                                North Indian

                            </option>


                            <option value="Chinese">

                                Chinese

                            </option>


                            <option value="Fast Food">

                                Fast Food

                            </option>


                            <option value="Others">

                                Others

                            </option>

                        </select>

                    </div>


                    {/* FOOD TYPE */}

                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">

                            Food Type

                        </label>


                        <select

                            name="foodType"

                            value={
                                formData.foodType
                            }

                            onChange={
                                handleChange
                            }

                            required

                            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#ff4d2d]"

                        >

                            <option value="">

                                Select Food Type

                            </option>


                            <option value="veg">

                                Veg

                            </option>


                            <option value="non veg">

                                Non Veg

                            </option>

                        </select>

                    </div>


                    {/* PRICE */}

                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">

                            Price

                        </label>


                        <input

                            type="number"

                            name="price"

                            value={
                                formData.price
                            }

                            onChange={
                                handleChange
                            }

                            placeholder="Enter price"

                            min="0"

                            required

                            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#ff4d2d]"

                        />

                    </div>


                    {/* IMAGE */}

                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">

                            Food Image

                        </label>


                        {preview && (

                            <img

                                src={
                                    preview
                                }

                                alt="Preview"

                                className="w-full h-48 object-cover rounded-xl mb-3"

                            />

                        )}


                        <input

                            type="file"

                            accept="image/*"

                            onChange={
                                handleImageChange
                            }

                            required

                            className="w-full border border-gray-300 rounded-xl p-2"

                        />

                    </div>


                    {/* BUTTON */}

                    <button

                        type="submit"

                        disabled={
                            loading
                        }

                        className="w-full bg-[#ff4d2d] text-white py-3 rounded-full font-semibold hover:bg-orange-600 transition disabled:opacity-60"

                    >

                        {loading
                            ? "Adding..."
                            : "Add Food Item"}

                    </button>

                </form>

            </div>

        </div>
    );
};


export default AddItem;