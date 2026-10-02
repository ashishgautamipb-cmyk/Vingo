import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import shopRouter from "./routes/shop.routes.js";
import itemRouter from "./routes/item.routes.js";
import orderRouter from "./routes/order.routes.js";

dotenv.config();

const app = express();

const port = process.env.PORT || 5000;

const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
    cors({
        origin: function (origin, callback) {

            // Allow requests without an origin
            // such as Postman/server-to-server requests
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(
                new Error("Not allowed by CORS")
            );
        },
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);

const startServer = async () => {
    await connectDb();

    app.listen(port, () => {
        console.log(`server started at ${port}`);
    });
};

startServer();