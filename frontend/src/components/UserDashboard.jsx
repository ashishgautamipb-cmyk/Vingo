import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { FaChevronLeft, FaChevronRight, FaFire, FaStore, FaUtensils } from "react-icons/fa";
import { FiMapPin, FiTag } from "react-icons/fi";

import CategoryCard from "./CategoryCard";
import FoodCard from "./FoodCard";
import BestShopCard from "./BestShopCard";
import categories from "../redux/category";
import useGetItemsByCity from "../hooks/useGetItemsByCity";
import { setCurrentCity } from "../redux/userSlice";

import { serverUrl } from "../App";

function UserDashboard() {
    const dispatch = useDispatch();
    const [shops, setShops] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [vegOnly, setVegOnly] = useState(false);

    const categoryRef = useRef(null);

    const { currentCity } = useSelector((state) => state.user);

    // ==============================
    // GET ALL SHOPS
    // ==============================
    const getShops = async () => {
        try {
            const token = localStorage.getItem("token");
            const result = await axios.get(`${serverUrl}/api/shop/get-shops`, {
                withCredentials: true,
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            setShops(result.data?.shops || []);
        } catch (error) {
            console.warn(
                "GET SHOPS ERROR:",
                error.response?.data || error.message
            );
        }
    };

    useEffect(() => {
        getShops();
    }, []);

    // Filter shops by city
    const userCity = currentCity ? currentCity.trim().toLowerCase() : "";
    const matchedCityShops = shops.filter((shop) => {
        const shopCity = shop.city ? shop.city.trim().toLowerCase() : "";
        return shopCity === userCity;
    });

    // If city has matching shops, show them. Otherwise fallback to all shops so screen is never blank!
    const displayShops = matchedCityShops.length > 0 ? matchedCityShops : shops;
    const isShowingFallbackShops = matchedCityShops.length === 0 && shops.length > 0;

    // ==============================
    // FOOD ITEMS
    // ==============================
    const { items = [], loading } = useGetItemsByCity(currentCity || "Greater Noida");

    // Filter items by category & veg
    const filteredItems = items.filter((item) => {
        if (selectedCategory && item.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
            return false;
        }
        if (vegOnly && item.foodType !== "veg") {
            return false;
        }
        return true;
    });

    // ==============================
    // CATEGORY SCROLL
    // ==============================
    const scrollCategories = (direction) => {
        if (!categoryRef.current) return;
        const container = categoryRef.current;
        const scrollAmount = container.clientWidth * 0.75;
        container.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    const handleSwitchCity = (newCity) => {
        dispatch(setCurrentCity(newCity));
        localStorage.setItem("city", newCity);
    };

    return (
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-10">
            {/* ================================= */}
            {/* HERO PROMOTIONAL BANNER */}
            {/* ================================= */}
            <div className="relative w-full rounded-3xl overflow-hidden shadow-xl shadow-orange-500/10 min-h-[220px] sm:min-h-[280px] flex items-center bg-gray-950">
                <img
                    src="/promo-banner.jpg"
                    alt="Delicious Gourmet Pizza & Burger"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/70 to-transparent" />

                <div className="relative z-10 p-6 sm:p-10 max-w-lg space-y-3 sm:space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-bold">
                        <FiTag className="text-orange-400" />
                        <span>FLAT 50% OFF</span>
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight tracking-tight">
                        Craving Excellence?<br />
                        <span className="bg-gradient-to-r from-[#ff4d2d] via-orange-400 to-amber-300 bg-clip-text text-transparent">
                            Delivered in 25 Mins.
                        </span>
                    </h1>

                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed line-clamp-2">
                        Order delicious wood-fired pizzas, gourmet burgers, aromatic biryanis & desserts from top restaurants.
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                        <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-mono font-bold text-xs">
                            USE: VINGO50
                        </span>
                    </div>
                </div>
            </div>

            {/* ================================= */}
            {/* CATEGORIES SECTION */}
            {/* ================================= */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <FaFire className="text-[#ff4d2d] text-lg" />
                            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                                Inspiration for your first order
                            </h2>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                            Explore popular cuisines and handcrafted dishes
                        </p>
                    </div>

                    {/* Scroll buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => scrollCategories("left")}
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-orange-50 text-gray-700 hover:text-[#ff4d2d] border border-gray-200 shadow-sm flex items-center justify-center transition cursor-pointer"
                            aria-label="Scroll left"
                        >
                            <FaChevronLeft size={12} />
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollCategories("right")}
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-orange-50 text-gray-700 hover:text-[#ff4d2d] border border-gray-200 shadow-sm flex items-center justify-center transition cursor-pointer"
                            aria-label="Scroll right"
                        >
                            <FaChevronRight size={12} />
                        </button>
                    </div>
                </div>

                {/* Horizontal Category Dishes */}
                <div
                    ref={categoryRef}
                    className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide no-scrollbar py-2 px-1"
                >
                    {categories.map((cate, index) => (
                        <CategoryCard
                            key={index}
                            data={cate}
                            isSelected={selectedCategory?.toLowerCase() === cate.category?.toLowerCase()}
                            onClick={() => {
                                setSelectedCategory((prev) =>
                                    prev?.toLowerCase() === cate.category?.toLowerCase()
                                        ? null
                                        : cate.category
                                );
                            }}
                        />
                    ))}
                </div>
            </section>

            {/* ================================= */}
            {/* RESTAURANTS SECTION */}
            {/* ================================= */}
            <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <FaStore className="text-[#ff4d2d] text-lg" />
                            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                                Top Restaurants in {currentCity || "Your City"}
                            </h2>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                            Curated spots serving hot meals with fast delivery
                        </p>
                    </div>

                    {/* Quick City Switcher Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        <span className="text-xs text-gray-400 font-medium whitespace-nowrap">City:</span>
                        {["Greater Noida", "Una", "Delhi NCR"].map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => handleSwitchCity(c)}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                                    currentCity?.toLowerCase() === c.toLowerCase()
                                        ? "bg-[#ff4d2d] text-white shadow-sm"
                                        : "bg-orange-50 hover:bg-orange-100 text-gray-700 border border-orange-100"
                                }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Fallback Notice if current city has no specific shops */}
                {isShowingFallbackShops && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between text-xs text-amber-900">
                        <div className="flex items-center gap-2">
                            <FiMapPin className="text-amber-600 flex-shrink-0" />
                            <span>
                                No restaurants registered in <strong>{currentCity}</strong> yet. Showing popular dining spots from nearby hubs:
                            </span>
                        </div>
                    </div>
                )}

                {/* Restaurant Cards Grid */}
                {displayShops.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <p className="text-gray-500 font-medium">No restaurants found currently.</p>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-5 justify-center sm:justify-start">
                        {displayShops.map((shop) => (
                            <BestShopCard key={shop._id} shop={shop} />
                        ))}
                    </div>
                )}
            </section>

            {/* ================================= */}
            {/* POPULAR DISHES & FOOD ITEMS */}
            {/* ================================= */}
            <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <FaUtensils className="text-[#ff4d2d] text-lg" />
                            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                                Suggested Food Items
                            </h2>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                            Handpicked dishes ready to be prepared fresh
                        </p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-2">
                        {selectedCategory && (
                            <button
                                type="button"
                                onClick={() => setSelectedCategory(null)}
                                className="px-3 py-1 rounded-full bg-orange-100 text-[#ff4d2d] text-xs font-bold hover:bg-orange-200 transition"
                            >
                                Category: {selectedCategory} ✕
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setVegOnly((prev) => !prev)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition border cursor-pointer ${
                                vegOnly
                                    ? "bg-emerald-600 border-emerald-600 text-white"
                                    : "bg-white border-gray-200 text-gray-700 hover:border-emerald-500"
                            }`}
                        >
                            🌱 Veg Only
                        </button>
                    </div>
                </div>

                {/* Dishes Grid */}
                {loading ? (
                    <div className="p-12 text-center text-gray-500 text-sm">
                        <div className="w-8 h-8 border-3 border-orange-200 border-t-[#ff4d2d] rounded-full animate-spin mx-auto mb-2" />
                        Loading mouth-watering food items...
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-3xl border border-gray-100 shadow-sm space-y-2">
                        <p className="text-gray-500 font-medium">
                            No dishes found matching your current selection.
                        </p>
                        {(selectedCategory || vegOnly) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedCategory(null);
                                    setVegOnly(false);
                                }}
                                className="text-xs font-bold text-[#ff4d2d] hover:underline cursor-pointer"
                            >
                                Reset Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-4 sm:gap-5 justify-center sm:justify-start">
                        {filteredItems.map((item) => (
                            <FoodCard key={item._id} item={item} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default UserDashboard;