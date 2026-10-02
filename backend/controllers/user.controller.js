import User from "../models/user.model.js";

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({
                message: "userId is not found"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User is not found"
            });
        }

        return res.status(200).json(user);

    } catch (error) {
        return res.status(500).json({
            message: `get current error ${error.message}`
        });
    }
};

export const updateUserLocation = async (req, res) => {
    try {
        const userId = req.userId;

        const {
            latitude,
            longitude
        } = req.body;

        if (!userId) {
            return res.status(400).json({
                message: "userId is not found"
            });
        }

        if (
            latitude === undefined ||
            longitude === undefined
        ) {
            return res.status(400).json({
                message:
                    "Latitude and longitude are required"
            });
        }

        const user =
            await User.findOneAndUpdate(
                {
                    _id: userId
                },
                {
                    location: {
                        type: "Point",
                        coordinates: [
                            Number(longitude),
                            Number(latitude)
                        ]
                    }
                },
                {
                    returnDocument: "after"
                }
            );

        if (!user) {
            return res.status(404).json({
                message: "User is not found"
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "User location updated successfully",
            location: user.location
        });

    } catch (error) {
        console.log(
            "Update location error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                `update location error ${error.message}`
        });
    }
};