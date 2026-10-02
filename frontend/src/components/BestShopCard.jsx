import React from "react";

function BestShopCard({ shop }) {
    return (
        <div className="w-[220px] bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02]">

            {/* Shop Image */}
            <div className="w-full h-[140px] overflow-hidden">
                <img
                    src={shop.image}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Shop Details */}
            <div className="p-3">
                <h2 className="text-lg font-semibold text-gray-800 truncate">
                    {shop.name}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                    {shop.city}, {shop.state}
                </p>

                <p className="text-sm text-gray-500 truncate mt-1">
                    {shop.address}
                </p>
            </div>

        </div>
    );
}

export default BestShopCard;