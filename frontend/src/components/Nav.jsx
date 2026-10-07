import { useEffect, useRef, useState } from "react";
import { FiShoppingCart, FiSearch, FiX, FiMapPin, FiChevronDown, FiPlus, FiClipboard, FiLogOut, FiUser } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

import { serverUrl } from "../App";
import { clearUserData, setCurrentCity } from "../redux/userSlice";
import useGetMyOrders from "../hooks/useGetMyOrder";

const POPULAR_CITIES = [
    "Greater Noida",
    "Una",
    "Delhi NCR",
    "Mumbai",
    "Bangalore",
    "Chandigarh",
    "Jaipur"
];

function Nav() {
    const { userData, currentCity } = useSelector((state) => state.user);
    const { myShopData } = useSelector((state) => state.owner);
    const { items: cartItems = [] } = useSelector((state) => state.cart);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const profileRef = useRef(null);
    const cityRef = useRef(null);

    const [showSearch, setShowSearch] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showCityMenu, setShowCityMenu] = useState(false);
    const [customCity, setCustomCity] = useState("");
    const [searchText, setSearchText] = useState("");

    const { orders = [] } = useGetMyOrders();

    const isUser = userData?.role === "user";
    const isOwner = userData?.role === "owner";

    const userName =
        userData?.fullName ||
        userData?.name ||
        userData?.username ||
        "User";

    const firstLetter =
        userName?.trim()?.charAt(0)?.toUpperCase() || "U";

    const city = currentCity || "Greater Noida";
    const cartCount = cartItems.length;

    const ownerOrderCount = isOwner
        ? orders.reduce(
              (count, order) =>
                  count +
                  (order.shopOrders || []).filter(
                      (shopOrder) => shopOrder.status !== "delivered"
                  ).length,
              0
          )
        : 0;

    // Close menus on outside click
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
            if (cityRef.current && !cityRef.current.contains(event.target)) {
                setShowCityMenu(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    const handleSelectCity = (selectedCity) => {
        dispatch(setCurrentCity(selectedCity));
        localStorage.setItem("city", selectedCity);
        setShowCityMenu(false);
    };

    const handleCustomCitySubmit = (e) => {
        e.preventDefault();
        if (customCity.trim()) {
            handleSelectCity(customCity.trim());
            setCustomCity("");
        }
    };

    const handleLogout = async () => {
        try {
            await axios.get(`${serverUrl}/api/auth/signout`, {
                withCredentials: true,
            });
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            dispatch(clearUserData());
            setShowProfileMenu(false);
            setShowSearch(false);
            navigate("/signin", { replace: true });
        } catch (error) {
            console.warn("Logout error:", error.response?.data || error.message);
            // Fallback clear
            localStorage.removeItem("token");
            dispatch(clearUserData());
            navigate("/signin", { replace: true });
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchText.trim()) return;
        navigate(`/search?query=${encodeURIComponent(searchText.trim())}`);
    };

    return (
        <header className="w-full h-[72px] fixed top-0 left-0 z-50 bg-white/95 backdrop-blur-md border-b border-orange-100/70 shadow-sm transition-all">
            <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-6">
                
                {/* BRAND & LOCATION */}
                <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
                    {/* LOGO */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#ff4d2d] to-[#ff7d59] flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform">
                            V
                        </div>
                        <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                            Vingo<span className="text-[#ff4d2d]">.</span>
                        </span>
                    </Link>

                    {/* LOCATION SELECTOR PILL */}
                    <div ref={cityRef} className="relative hidden sm:block">
                        <button
                            type="button"
                            onClick={() => setShowCityMenu((prev) => !prev)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50/70 hover:bg-orange-100/70 border border-orange-200/60 text-xs font-semibold text-gray-800 transition cursor-pointer"
                        >
                            <FiMapPin className="text-[#ff4d2d] w-3.5 h-3.5" />
                            <span className="max-w-[130px] truncate">{city}</span>
                            <FiChevronDown className="text-gray-400 w-3.5 h-3.5" />
                        </button>

                        {/* CITY DROPDOWN MODAL */}
                        {showCityMenu && (
                            <div className="absolute top-10 left-0 w-64 bg-white rounded-2xl shadow-xl border border-orange-100 p-3 z-50 animate-fade-in">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-2 mb-2">
                                    Select Your Delivery City
                                </p>
                                <div className="space-y-1 max-h-48 overflow-y-auto no-scrollbar">
                                    {POPULAR_CITIES.map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => handleSelectCity(c)}
                                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                                                city.toLowerCase() === c.toLowerCase()
                                                    ? "bg-[#ff4d2d] text-white font-semibold"
                                                    : "text-gray-700 hover:bg-orange-50"
                                            }`}
                                        >
                                            <span>{c}</span>
                                            {city.toLowerCase() === c.toLowerCase() && (
                                                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">Active</span>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Custom City Input */}
                                <form onSubmit={handleCustomCitySubmit} className="mt-2.5 pt-2 border-t border-gray-100 flex gap-1.5">
                                    <input
                                        type="text"
                                        value={customCity}
                                        onChange={(e) => setCustomCity(e.target.value)}
                                        placeholder="Other city name..."
                                        className="flex-1 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#ff4d2d]"
                                    />
                                    <button
                                        type="submit"
                                        className="px-2.5 py-1.5 bg-[#ff4d2d] text-white rounded-lg text-xs font-bold hover:bg-[#e03a1a] transition cursor-pointer"
                                    >
                                        Set
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                {/* SEARCH BAR (Center Desktop) */}
                {isUser && (
                    <form
                        onSubmit={handleSearch}
                        className="hidden md:flex flex-1 max-w-md items-center bg-gray-100/80 hover:bg-gray-100/95 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#ff4d2d]/20 focus-within:border-[#ff4d2d] border border-gray-200/60 rounded-full px-4 py-2 transition duration-150"
                    >
                        <FiSearch className="text-gray-400 w-4 h-4 mr-2.5 flex-shrink-0" />
                        <input
                            type="text"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder="Search for restaurants, burgers, pizza..."
                            className="w-full bg-transparent text-xs text-gray-800 placeholder-gray-400 outline-none"
                        />
                        {searchText && (
                            <button
                                type="button"
                                onClick={() => setSearchText("")}
                                className="text-gray-400 hover:text-gray-600 ml-1"
                            >
                                <FiX className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </form>
                )}

                {/* RIGHT ACTIONS */}
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    {/* Mobile Search Toggle */}
                    {isUser && (
                        <button
                            type="button"
                            onClick={() => setShowSearch((prev) => !prev)}
                            className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-orange-50 hover:text-[#ff4d2d] transition"
                            aria-label="Toggle search"
                        >
                            {showSearch ? <FiX size={20} /> : <FiSearch size={20} />}
                        </button>
                    )}

                    {/* OWNER: ADD FOOD ITEM */}
                    {isOwner && myShopData && (
                        <button
                            type="button"
                            onClick={() => navigate("/add-item")}
                            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4a] text-white text-xs font-bold shadow-md shadow-orange-500/20 hover:brightness-105 active:scale-95 transition cursor-pointer"
                        >
                            <FiPlus className="w-4 h-4" />
                            <span>Add Food Item</span>
                        </button>
                    )}

                    {/* MY ORDERS */}
                    {(isUser || isOwner) && (
                        <button
                            type="button"
                            onClick={() => navigate("/my-orders")}
                            className="relative flex items-center gap-1.5 px-3 py-2 rounded-full bg-orange-50 hover:bg-orange-100/70 border border-orange-200/60 text-[#ff4d2d] text-xs font-semibold transition cursor-pointer"
                        >
                            <FiClipboard className="w-4 h-4" />
                            <span className="hidden sm:inline">My Orders</span>
                            {isOwner && ownerOrderCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff4d2d] text-white text-[9px] font-black flex items-center justify-center">
                                    {ownerOrderCount}
                                </span>
                            )}
                        </button>
                    )}

                    {/* USER CART */}
                    {isUser && (
                        <button
                            type="button"
                            onClick={() => navigate("/cart")}
                            className="relative p-2.5 rounded-full bg-gray-100 hover:bg-orange-50 hover:text-[#ff4d2d] text-gray-700 transition cursor-pointer"
                            aria-label="View shopping cart"
                        >
                            <FiShoppingCart size={18} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#ff4d2d] text-white text-[10px] font-black flex items-center justify-center shadow-sm">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    )}

                    {/* PROFILE AVATAR & DROPDOWN */}
                    <div ref={profileRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setShowProfileMenu((prev) => !prev)}
                            className="flex items-center gap-2 pl-1 cursor-pointer focus:outline-none"
                        >
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-[#ff4d2d] via-orange-500 to-amber-500 text-white font-bold text-sm flex items-center justify-center shadow-sm ring-2 ring-orange-200/70">
                                {firstLetter}
                            </div>
                            <div className="hidden xl:flex flex-col items-start leading-tight">
                                <span className="text-xs font-bold text-gray-800 max-w-[100px] truncate">
                                    {userName}
                                </span>
                                <span className="text-[10px] font-semibold text-[#ff4d2d] uppercase">
                                    {userData?.role || "user"}
                                </span>
                            </div>
                            <FiChevronDown className="text-gray-400 w-3.5 h-3.5 hidden xl:block" />
                        </button>

                        {/* DROPDOWN MENU */}
                        {showProfileMenu && (
                            <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2.5 z-50 animate-fade-in space-y-1">
                                <div className="px-3 py-2 rounded-xl bg-orange-50/60 mb-1">
                                    <p className="text-xs font-bold text-gray-900 truncate">{userName}</p>
                                    <p className="text-[10px] text-gray-500 truncate">{userData?.email}</p>
                                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-white text-[9px] font-bold text-[#ff4d2d] uppercase border border-orange-200">
                                        {userData?.role || "user"}
                                    </span>
                                </div>

                                {isUser && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setShowProfileMenu(false);
                                                navigate("/cart");
                                            }}
                                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-orange-50 hover:text-[#ff4d2d] transition flex items-center gap-2.5 cursor-pointer"
                                        >
                                            <FiShoppingCart className="w-4 h-4" />
                                            <span>My Cart ({cartCount})</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowProfileMenu(false);
                                                navigate("/my-orders");
                                            }}
                                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-orange-50 hover:text-[#ff4d2d] transition flex items-center gap-2.5 cursor-pointer"
                                        >
                                            <FiClipboard className="w-4 h-4" />
                                            <span>Order History</span>
                                        </button>
                                    </>
                                )}

                                {isOwner && (
                                    <button
                                        onClick={() => {
                                            setShowProfileMenu(false);
                                            navigate("/add-item");
                                        }}
                                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-orange-50 hover:text-[#ff4d2d] transition flex items-center gap-2.5 cursor-pointer"
                                    >
                                        <FiPlus className="w-4 h-4" />
                                        <span>Add Menu Item</span>
                                    </button>
                                )}

                                <div className="pt-1 border-t border-gray-100">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition flex items-center gap-2.5 cursor-pointer"
                                    >
                                        <FiLogOut className="w-4 h-4" />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MOBILE SEARCH BAR DROPDOWN */}
            {isUser && showSearch && (
                <div className="md:hidden px-4 py-2.5 bg-white border-b border-orange-100 shadow-md animate-fade-in">
                    <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-full px-4 py-2 border border-gray-200">
                        <FiSearch className="text-gray-400 w-4 h-4 mr-2 flex-shrink-0" />
                        <input
                            type="text"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder="Search dishes or restaurants..."
                            autoFocus
                            className="w-full bg-transparent text-xs text-gray-800 outline-none"
                        />
                        <button type="submit" className="text-xs font-bold text-[#ff4d2d] ml-2">
                            Search
                        </button>
                    </form>
                </div>
            )}
        </header>
    );
}

export default Nav;