function CategoryCard({ data, isSelected, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex-shrink-0 flex flex-col items-center group cursor-pointer focus:outline-none transition-transform duration-200 active:scale-95"
        >
            {/* Circular / Rounded Dish Image */}
            <div
                className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 transition-all duration-300 shadow-sm bg-white p-0.5 ${
                    isSelected
                        ? "border-[#ff4d2d] ring-4 ring-[#ff4d2d]/20 shadow-md scale-105"
                        : "border-orange-100 group-hover:border-[#ff4d2d] group-hover:shadow-lg group-hover:-translate-y-1"
                }`}
            >
                <img
                    src={data.image}
                    alt={data.category}
                    className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                />
            </div>

            {/* Category Title */}
            <span
                className={`mt-2 text-xs sm:text-sm font-semibold truncate max-w-[90px] text-center transition-colors ${
                    isSelected
                        ? "text-[#ff4d2d] font-bold"
                        : "text-gray-700 group-hover:text-[#ff4d2d]"
                }`}
            >
                {data.category}
            </span>
        </button>
    );
}

export default CategoryCard;