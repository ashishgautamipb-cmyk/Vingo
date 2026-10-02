import React from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const CategoryCard = ({
    data,
    index,
    totalItems,
    onScrollLeft,
    onScrollRight,
    showLeftArrow,
    showRightArrow,
}) => {
    return (
        <div
            className="
                relative
                flex-shrink-0
                w-[85px]
                sm:w-[95px]
                cursor-pointer
                transition-all
                duration-300
                hover:-translate-y-1
                hover:scale-105
            "
        >

            {/* IMAGE CONTAINER */}
            <div
                className="
                    relative
                    w-full
                    h-[85px]
                    sm:h-[95px]
                    rounded-xl
                    overflow-hidden
                    border
                    border-[#ff4d2d]
                    bg-white
                    shadow-sm
                    transition-all
                    duration-300
                    hover:shadow-md
                "
            >

                {/* IMAGE */}
                <img
                    src={data.image}
                    alt={data.category}
                    className="
                        w-full
                        h-full
                        object-cover
                        transition-transform
                        duration-300
                        hover:scale-110
                    "
                />

                {/* LEFT ARROW - FIRST ITEM */}
                {index === 0 && showLeftArrow && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onScrollLeft();
                        }}
                        className="
                            absolute
                            left-1
                            top-1/2
                            -translate-y-1/2
                            w-6
                            h-6
                            sm:w-7
                            sm:h-7
                            rounded-full
                            bg-white/95
                            shadow-md
                            flex
                            items-center
                            justify-center
                            text-gray-700
                            hover:bg-[#ff4d2d]
                            hover:text-white
                            transition-all
                            z-10
                        "
                    >
                        <IoIosArrowBack
                            size={16}
                        />
                    </button>
                )}

                {/* RIGHT ARROW - LAST ITEM */}
                {index === totalItems - 1 && showRightArrow && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onScrollRight();
                        }}
                        className="
                            absolute
                            right-1
                            top-1/2
                            -translate-y-1/2
                            w-6
                            h-6
                            sm:w-7
                            sm:h-7
                            rounded-full
                            bg-white/95
                            shadow-md
                            flex
                            items-center
                            justify-center
                            text-gray-700
                            hover:bg-[#ff4d2d]
                            hover:text-white
                            transition-all
                            z-10
                        "
                    >
                        <IoIosArrowForward
                            size={16}
                        />
                    </button>
                )}

            </div>

            {/* CATEGORY NAME */}
            <p
                className="
                    text-center
                    text-gray-700
                    text-xs
                    sm:text-sm
                    font-medium
                    mt-1.5
                    truncate
                "
            >
                {data.category}
            </p>

        </div>
    );
};

export default CategoryCard;