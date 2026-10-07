import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaMinus, FaTrash, FaShoppingBag } from "react-icons/fa";
import Nav from "../components/Nav";

import {
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
} from "../redux/cartSlice";

function CartPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cartItems = useSelector((state) => state.cart.items);

  // =====================================
  // TOTAL PRICE
  // =====================================

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  // =====================================
  // GO TO HOME
  // =====================================

  const handleAddItems = () => {
    navigate("/");
  };

  return (
    <div
      className="
                min-h-screen
                bg-[#fff9f6]
                pt-[88px]
                px-4
                pb-10
            "
    >
      <Nav />
      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div
        className="
                    max-w-[900px]
                    mx-auto
                    flex
                    items-center
                    justify-between
                    mb-6
                "
      >
        <h1
          className="
                        text-2xl
                        font-bold
                        text-gray-800
                    "
        >
          My Cart
        </h1>

        {cartItems.length > 0 && (
          <span
            className="
                            text-sm
                            text-gray-500
                        "
          >
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
          </span>
        )}
      </div>

      {/* ================================= */}
      {/* EMPTY CART */}
      {/* ================================= */}

      {cartItems.length === 0 ? (
        <div
          className="
                        max-w-[500px]
                        mx-auto
                        bg-white
                        rounded-2xl
                        shadow-sm
                        border
                        border-orange-100
                        p-8
                        text-center
                    "
        >
          <div
            className="
                            w-16
                            h-16
                            mx-auto
                            rounded-full
                            bg-orange-50
                            flex
                            items-center
                            justify-center
                            mb-4
                        "
          >
            <FaShoppingBag
              className="
                                text-[#ff4d2d]
                            "
              size={26}
            />
          </div>

          <h2
            className="
                            text-xl
                            font-semibold
                            text-gray-800
                        "
          >
            Your cart is empty
          </h2>

          <p
            className="
                            text-sm
                            text-gray-500
                            mt-2
                            mb-5
                        "
          >
            Add some delicious food to your cart.
          </p>

          {/* ADD ITEMS */}

          <button
            onClick={handleAddItems}
            className="
                            bg-[#ff4d2d]
                            hover:bg-orange-600
                            text-white
                            px-6
                            py-2.5
                            rounded-lg
                            text-sm
                            font-semibold
                            flex
                            items-center
                            justify-center
                            gap-2
                            mx-auto
                            transition
                        "
          >
            <FaPlus size={12} />
            Add Items
          </button>
        </div>
      ) : (
        /* ================================= */
        /* CART WITH ITEMS */
        /* ================================= */

        <div
          className="
                        max-w-[900px]
                        mx-auto
                    "
        >
          {/* CART ITEMS */}

          <div
            className="
                            flex
                            flex-col
                            gap-3
                        "
          >
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="
                                        bg-white
                                        rounded-xl
                                        border
                                        border-orange-100
                                        shadow-sm
                                        p-3
                                        flex
                                        items-center
                                        gap-4
                                    "
              >
                {/* IMAGE */}

                <img
                  src={item.image}
                  alt={item.name}
                  className="
                                            w-[80px]
                                            h-[70px]
                                            rounded-lg
                                            object-cover
                                            flex-shrink-0
                                        "
                />

                {/* DETAILS */}

                <div
                  className="
                                            flex-1
                                            min-w-0
                                        "
                >
                  <h2
                    className="
                                                text-sm
                                                font-semibold
                                                text-gray-800
                                                truncate
                                            "
                  >
                    {item.name}
                  </h2>

                  <p
                    className="
                                                text-sm
                                                text-gray-500
                                                mt-1
                                            "
                  >
                    ₹{item.price}
                  </p>
                </div>

                {/* QUANTITY */}

                <div
                  className="
                                            flex
                                            items-center
                                        "
                >
                  <button
                    onClick={() => dispatch(decreaseQuantity(item._id))}
                    className="
                                                w-7
                                                h-7
                                                border
                                                border-gray-300
                                                rounded-l-full
                                                flex
                                                items-center
                                                justify-center
                                                text-gray-600
                                                hover:bg-gray-100
                                            "
                  >
                    <FaMinus size={9} />
                  </button>

                  <div
                    className="
                                                h-7
                                                min-w-[30px]
                                                border-t
                                                border-b
                                                border-gray-300
                                                flex
                                                items-center
                                                justify-center
                                                text-xs
                                                font-semibold
                                            "
                  >
                    {item.quantity}
                  </div>

                  <button
                    onClick={() => dispatch(increaseQuantity(item._id))}
                    className="
                                                w-7
                                                h-7
                                                border
                                                border-gray-300
                                                rounded-r-full
                                                flex
                                                items-center
                                                justify-center
                                                text-gray-600
                                                hover:bg-gray-100
                                            "
                  >
                    <FaPlus size={9} />
                  </button>
                </div>

                {/* ITEM TOTAL */}

                <div
                  className="
                                            w-[70px]
                                            text-right
                                            font-semibold
                                            text-gray-800
                                            text-sm
                                        "
                >
                  ₹{item.price * item.quantity}
                </div>

                {/* DELETE */}

                <button
                  onClick={() => dispatch(removeFromCart(item._id))}
                  className="
                                            w-8
                                            h-8
                                            flex
                                            items-center
                                            justify-center
                                            text-red-500
                                            hover:bg-red-50
                                            rounded-lg
                                        "
                >
                  <FaTrash size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* ================================= */}
          {/* ADD MORE ITEMS */}
          {/* ================================= */}

          <button
            onClick={handleAddItems}
            className="
                            mt-5
                            bg-white
                            border
                            border-[#ff4d2d]
                            text-[#ff4d2d]
                            hover:bg-[#ff4d2d]
                            hover:text-white
                            px-5
                            py-2.5
                            rounded-lg
                            text-sm
                            font-semibold
                            flex
                            items-center
                            gap-2
                            transition
                        "
          >
            <FaPlus size={11} />
            Add More Items
          </button>

          {/* ================================= */}
          {/* TOTAL */}
          {/* ================================= */}

          <div
            className="
                            mt-6
                            bg-white
                            rounded-xl
                            border
                            border-orange-100
                            shadow-sm
                            p-5
                        "
          >
            <div
              className="
                                flex
                                items-center
                                justify-between
                                text-lg
                                font-bold
                                text-gray-800
                            "
            >
              <span>Total</span>

              <span>₹{totalPrice}</span>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="
        w-full
        mt-4
        bg-[#ff4d2d]
        hover:bg-orange-600
        text-white
        py-3
        rounded-lg
        font-semibold
        transition
        cursor-pointer
    "
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
