import { FaStar } from "react-icons/fa";
import { FiClock, FiMapPin } from "react-icons/fi";

function BestShopCard({ shop }) {
    return (
        <div className="w-[240px] sm:w-[260px] bg-white rounded-2xl overflow-hidden border border-orange-100/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between">
            {/* Image Header with Badges */}
            <div className="relative w-full h-[140px] sm:h-[150px] overflow-hidden bg-gray-100">
                <img
                    src={shop.image}
                    alt={shop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Gradient overlay on bottom of image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Rating Badge */}
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-sm text-[11px] font-bold text-gray-900 flex items-center gap-1 shadow-sm">
                    <FaStar className="text-amber-400 text-[10px]" />
                    <span>4.6</span>
                </div>

                {/* Delivery Time Badge */}
                <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-semibold text-white">
                    <FiClock className="w-3 h-3 text-[#ffb703]" />
                    <span>20-30 mins</span>
                </div>
            </div>

            {/* Shop Details */}
            <div className="p-3.5">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-gray-900 truncate group-hover:text-[#ff4d2d] transition-colors">
                        {shop.name}
                    </h3>
                </div>

                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <FiMapPin className="text-[#ff4d2d] flex-shrink-0 w-3 h-3" />
                    <span className="truncate">{shop.city}, {shop.state}</span>
                </div>

                <p className="text-[11px] text-gray-400 truncate mt-1">
                    {shop.address || "Fresh Gourmet Food & Drinks"}
                </p>

                {/* Bottom Tag */}
                <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                        Free Delivery
                    </span>
                    <span className="text-gray-400">
                        {shop.items?.length || 0} dishes
                    </span>
                </div>
            </div>
        </div>
    );
}

export default BestShopCard;