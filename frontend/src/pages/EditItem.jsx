import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { serverUrl } from "../App";

const EditItem = () => {
    const { itemId } = useParams();
    const navigate = useNavigate();

    const { shopData } = useSelector(
        (state) => state.owner
    );

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        foodType: "",
        price: "",
    });

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!shopData?.items) return;

        const item = shopData.items.find(
            (item) => item._id === itemId
        );

        if (item) {
            setFormData({
                name: item.name || "",
                category: item.category || "",
                foodType: item.foodType || "",
                price: item.price || "",
            });

            setPreview(item.image || "");
        }
    }, [shopData, itemId]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const data = new FormData();

            data.append("name", formData.name);
            data.append("category", formData.category);
            data.append("foodType", formData.foodType);
            data.append("price", formData.price);

            if (image) {
                data.append("image", image);
            }

            const result = await axios.post(
                `${serverUrl}/api/item/edit-item/${itemId}`,
                data,
                {
                    withCredentials: true,
                }
            );

            console.log(
                "EDIT ITEM RESPONSE:",
                result.data
            );

            alert("Food item updated successfully");

            navigate("/");
        } catch (error) {
            console.log(
                "EDIT ITEM ERROR:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                    "Failed to update food item"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#fff9f6]">

            <div className="w-full max-w-2xl mx-auto px-4 pt-20 pb-10">

                <div className="bg-white rounded-2xl shadow-md p-5 sm:p-7">

                    <h1 className="text-2xl font-bold text-gray-800 mb-1">
                        Edit Food Item
                    </h1>

                    <p className="text-sm text-gray-500 mb-6">
                        Update your food item details
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Food Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter food name"
                                required
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#ff4d2d]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category
                            </label>

                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#ff4d2d]"
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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Food Type
                            </label>

                            <select
                                name="foodType"
                                value={formData.foodType}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#ff4d2d]"
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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price
                            </label>

                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="Enter price"
                                min="0"
                                required
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#ff4d2d]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Food Image
                            </label>

                            {preview && (
                                <img
                                    src={preview}
                                    alt="Food preview"
                                    className="w-full h-48 object-cover rounded-xl mb-3"
                                />
                            )}

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="w-full border border-gray-200 rounded-xl p-2 text-sm"
                            />

                            <p className="text-xs text-gray-500 mt-1">
                                Leave empty if you don't want to
                                change the current image.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/")
                                }
                                className="w-1/2 border border-gray-300 text-gray-700 py-2.5 rounded-full font-semibold hover:bg-gray-100 transition-all"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-1/2 bg-[#ff4d2d] text-white py-2.5 rounded-full font-semibold hover:bg-orange-600 transition-all disabled:opacity-60"
                            >
                                {loading
                                    ? "Updating..."
                                    : "Update Item"}
                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>
    );
};

export default EditItem;