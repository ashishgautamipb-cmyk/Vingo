import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
    try {
        let token = req.cookies?.token;

        // If cookie token is not available,
        // check Authorization header
        if (!token) {
            const authHeader = req.headers.authorization;

            if (
                authHeader &&
                authHeader.startsWith("Bearer ")
            ) {
                token = authHeader.split(" ")[1];
            }
        }

        // No token found
        if (!token) {
            return res.status(400).json({
                message: "Token not found"
            });
        }

        // Verify token
        const decodeToken = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (!decodeToken) {
            return res.status(400).json({
                message: "Token not verified"
            });
        }

        console.log("Decoded Token:", decodeToken);

        req.userId = decodeToken.userId;

        next();

    } catch (error) {
        console.log("isAuth error:", error.message);

        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

export default isAuth;