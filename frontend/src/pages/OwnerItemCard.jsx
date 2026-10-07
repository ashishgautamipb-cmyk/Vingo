import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";

import { serverUrl } from "../App";
import { setMyShopData } from "../redux/ownerSlice";

const OwnerItemCard = ({ item }) => {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleDelete = async () => {

        const confirmDelete =
            window.confirm(
                `Are you sure you want to delete ${item.name}?`
            );

        if (!confirmDelete) {
            return;
        }

        try {

            const token =
                localStorage.getItem("token");

            const result =
                await axios.delete(
                    `${serverUrl}/api/item/delete-item/${item._id}`,
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
                "DELETE ITEM RESPONSE:",
                result.data
            );

            if (result.data.shop) {

                dispatch(
                    setMyShopData(
                        result.data.shop
                    )
                );
            }

            alert(
                "Food item deleted successfully"
            );

        } catch (error) {

            console.log(
                "DELETE ITEM ERROR:",
                error.response?.data ||
                error.message
            );

            alert(
                error.response?.data?.message ||
                    "Failed to delete food item"
            );
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">

            <img
                src={item.image}
                alt={item.name}
                className="w-full h-36 object-cover"
            />

            <div className="p-3">

                <div className="flex justify-between gap-2">

                    <div>

                        <h3 className="font-bold text-gray-800">
                            {item.name}
                        </h3>

                        <p className="text-xs text-gray-500 mt-1">
                            {item.category}
                        </p>

                    </div>

                    <p className="font-bold text-[#ff4d2d]">
                        ₹{item.price}
                    </p>

                </div>

                <div className="flex justify-between items-center mt-3">

                    <span
                        className={`text-xs px-2 py-1 rounded-full ${
                            item.foodType === "veg"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                        }`}
                    >
                        {item.foodType}
                    </span>

                    <div className="flex gap-2">

                        <button
                            onClick={() =>
                                navigate(
                                    `/edit-item/${item._id}`
                                )
                            }
                            className="w-8 h-8 rounded-full bg-orange-100 text-[#ff4d2d] flex items-center justify-center hover:bg-orange-200"
                        >
                            <FaEdit size={13} />
                        </button>

                        <button
                            onClick={handleDelete}
                            className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200"
                        >
                            <FaTrash size={13} />
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default OwnerItemCard;