import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";


// ==========================================
// CREATE SHOP
// ==========================================

export const createShop = async (req, res) => {

    try {

        const {
            name,
            city,
            state,
            address
        } = req.body;


        // ======================================
        // CHECK EXISTING SHOP
        // ======================================

        const existingShop =
            await Shop.findOne({
                owner: req.userId
            });


        if (existingShop) {

            return res.status(400).json({

                success: false,

                message:
                    "You already have a restaurant",

                shop: existingShop

            });
        }


        // ======================================
        // VALIDATION
        // ======================================

        if (
            !name ||
            !city ||
            !state ||
            !address
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "All shop details are required"

            });
        }


        if (!req.file) {

            return res.status(400).json({

                success: false,

                message:
                    "Shop image is required"

            });
        }


        // ======================================
        // UPLOAD IMAGE
        // ======================================

        const image =
            await uploadOnCloudinary(
                req.file.path
            );


        if (!image) {

            return res.status(400).json({

                success: false,

                message:
                    "Image upload failed"

            });
        }


        // ======================================
        // CREATE SHOP
        // ======================================

        const shop =
            await Shop.create({

                name,

                image,

                owner: req.userId,

                city,

                state,

                address,

                items: []

            });


        await shop.populate("owner");

        await shop.populate("items");


        return res.status(201).json({

            success: true,

            message:
                "Shop created successfully",

            shop

        });


    } catch (error) {

        console.error(
            "Create shop error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                `Create shop error: ${error.message}`

        });
    }
};


// ==========================================
// EDIT SHOP
// ==========================================

export const editShop = async (
    req,
    res
) => {

    try {

        const {
            name,
            city,
            state,
            address
        } = req.body;


        const shop =
            await Shop.findOne({

                _id:
                    req.params.shopId,

                owner:
                    req.userId

            });


        if (!shop) {

            return res.status(404).json({

                success: false,

                message:
                    "Shop not found"

            });
        }


        // ======================================
        // IMAGE
        // ======================================

        let image =
            shop.image;


        if (req.file) {

            const uploadedImage =
                await uploadOnCloudinary(
                    req.file.path
                );


            if (uploadedImage) {

                image =
                    uploadedImage;
            }
        }


        // ======================================
        // UPDATE
        // ======================================

        shop.name =
            name || shop.name;

        shop.city =
            city || shop.city;

        shop.state =
            state || shop.state;

        shop.address =
            address || shop.address;

        shop.image =
            image;


        await shop.save();


        await shop.populate("owner");

        await shop.populate("items");


        return res.status(200).json({

            success: true,

            message:
                "Shop updated successfully",

            shop

        });


    } catch (error) {

        console.error(
            "Edit shop error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                `Edit shop error: ${error.message}`

        });
    }
};


// ==========================================
// GET MY SHOP
// ==========================================

export const getMyShop = async (
    req,
    res
) => {

    try {

        const shop =
            await Shop.findOne({
                owner: req.userId
            })
            .populate("owner")
            .populate("items");


        return res.status(200).json({

            success: true,

            shop: shop || null

        });


    } catch (error) {

        console.error(
            "Get my shop error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                `Get my shop error: ${error.message}`

        });
    }
};


// ==========================================
// GET ALL SHOPS
// ==========================================

export const getShops = async (
    req,
    res
) => {

    try {

        const shops =
            await Shop.find({})
            .populate("owner")
            .populate("items");


        return res.status(200).json({

            success: true,

            shops

        });


    } catch (error) {

        console.error(
            "Get shops error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                `Get shops error: ${error.message}`

        });
    }
};