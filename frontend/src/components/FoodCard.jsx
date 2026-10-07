import { useDispatch, useSelector } from "react-redux";
import { FaStar, FaPlus, FaMinus } from "react-icons/fa";
import { addToCart, increaseQuantity, decreaseQuantity } from "../redux/cartSlice";

function FoodCard({ item }) {
    const dispatch = useDispatch();

    const cartItems = useSelector((state) => state.cart.items || []);
    const cartItem = cartItems.find((ci) => ci._id === item._id);

    const isInCart = Boolean(cartItem && cartItem.quantity > 0);
    const quantity = cartItem ? cartItem.quantity : 0;

    const handleAddInitial = (e) => {
        e.stopPropagation();
        dispatch(
            addToCart({
                ...item,
                quantity: 1,
            })
        );
    };

    const handleIncrease = (e) => {
        e.stopPropagation();
        dispatch(increaseQuantity(item._id));
    };

    const handleDecrease = (e) => {
        e.stopPropagation();
        dispatch(decreaseQuantity(item._id));
    };

    return (
        <div className="w-[190px] sm:w-[210px] bg-white rounded-2xl overflow-hidden border border-orange-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group">
            {/* Top Image Container */}
            <div className="relative w-full h-[130px] sm:h-[140px] overflow-hidden bg-gray-100">
                <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Food Type Indicator (Veg/Non-Veg) */}
                <div className="absolute top-2.5 left-2.5 w-5 h-5 bg-white/95 rounded-md flex items-center justify-center shadow-md backdrop-blur-sm">
                    <div
                        className={`w-3 h-3 rounded-sm border-2 flex items-center justify-center ${
                            item.foodType === "veg"
                                ? "border-green-600"
                                : "border-red-600"
                        }`}
                    >
                        <div
                            className={`w-1.5 h-1.5 rounded-full ${
                                item.foodType === "veg"
                                    ? "bg-green-600"
                                    : "bg-red-600"
                            }`}
                        />
                    </div>
                </div>

                {/* Rating Badge */}
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-gray-800 flex items-center gap-1 shadow-sm">
                    <FaStar className="text-amber-400 text-[10px]" />
                    <span>4.5</span>
                </div>
            </div>

            {/* Bottom Content */}
            <div className="p-3.5 flex flex-col justify-between flex-1">
                <div>
                    <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-[#ff4d2d] transition-colors">
                        {item.name}
                    </h3>
                    <p className="text-[11px] font-medium text-gray-400 truncate mt-0.5 capitalize">
                        {item.category || "Delicious Dish"} • {item.shop?.name || "Restaurant"}
                    </p>
                </div>

                {/* Price & Action Row */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-medium">Price</span>
                        <span className="text-sm sm:text-base font-extrabold text-gray-900">
                            ₹{item.price}
                        </span>
                    </div>

                    {/* Quantity or ADD Button */}
                    {!isInCart ? (
                        <button
                            type="button"
                            onClick={handleAddInitial}
                            className="px-3.5 py-1.5 rounded-xl bg-orange-50 hover:bg-[#ff4d2d] text-[#ff4d2d] hover:text-white border border-[#ff4d2d]/30 text-xs font-extrabold shadow-sm active:scale-95 transition-all cursor-pointer"
                        >
                            ADD +
                        </button>
                    ) : (
                        <div className="flex items-center rounded-xl bg-[#ff4d2d] text-white shadow-md shadow-orange-500/25 overflow-hidden">
                            <button
                                type="button"
                                onClick={handleDecrease}
                                className="px-2 py-1.5 hover:bg-[#e03a1a] transition cursor-pointer"
                                aria-label="Decrease quantity"
                            >
                                <FaMinus className="w-2.5 h-2.5" />
                            </button>
                            <span className="px-2 text-xs font-black select-none">
                                {quantity}
                            </span>
                            <button
                                type="button"
                                onClick={handleIncrease}
                                className="px-2 py-1.5 hover:bg-[#e03a1a] transition cursor-pointer"
                                aria-label="Increase quantity"
                            >
                                <FaPlus className="w-2.5 h-2.5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FoodCard;