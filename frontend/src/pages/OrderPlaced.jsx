import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaHouse, FaClipboardList } from "react-icons/fa6";

const OrderPlaced = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-sm p-6 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center">
            <FaCheck className="text-white" size={26} />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mt-5">
          Order Placed!
        </h1>

        <p className="text-sm text-gray-500 mt-2">
          Your order has been placed successfully.
        </p>

        <p className="text-xs text-gray-400 mt-1">
          Your delicious food will be delivered to you soon.
        </p>

        <div className="flex flex-col gap-3 mt-7">
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 rounded-lg bg-[#ff4d2d] hover:bg-orange-600 text-white text-sm font-semibold flex items-center justify-center gap-2"
          >
            <FaHouse size={14} />
            Continue Shopping
          </button>

          <button
            onClick={() => navigate("/my-orders")}
            className="w-full py-3 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold flex items-center justify-center gap-2"
          >
            <FaClipboardList size={14} />
            View My Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderPlaced;