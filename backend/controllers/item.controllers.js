import Shop from "../models/shop.model.js";
import Item from "../models/item.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";


// ==========================================
// ADD ITEM
// ==========================================

export const addItem = async (
    req,
    res
) => {

    try {

        const {
            name,
            category,
            foodType,
            price
        } = req.body;


        // ======================================
        // IMAGE
        // ======================================

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message:
                    "Food image is required"

            });
        }


        const image =
            await uploadOnCloudinary(
                req.file.path
            );


        if (!image) {

            return res.status(400).json({

                success: false,

                message:
                    "Food image upload failed"

            });
        }


        // ======================================
        // FIND OWNER'S SHOP
        // ======================================

        const shop =
            await Shop.findOne({
                owner: req.userId
            });


        if (!shop) {

            return res.status(404).json({

                success: false,

                message:
                    "Shop not found. Please create your restaurant first."

            });
        }


        // ======================================
        // CREATE ITEM
        // ======================================

        const item =
            await Item.create({

                name,

                category,

                foodType,

                price: Number(price),

                image,

                shop: shop._id

            });


        // ======================================
        // ADD ITEM TO SHOP
        // ======================================

        shop.items.push(
            item._id
        );


        await shop.save();


        await shop.populate(
            "items"
        );


        return res.status(201).json({

            success: true,

            message:
                "Food item added successfully",

            item,

            shop

        });


    } catch (error) {

        console.error(
            "Add item error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                `Add item error: ${error.message}`

        });
    }
};


// ==========================================
// EDIT ITEM
// ==========================================

export const editItem = async (
    req,
    res
) => {

    try {

        const itemId =
            req.params.itemId;


        const {
            name,
            category,
            foodType,
            price
        } = req.body;


        const item =
            await Item.findById(
                itemId
            );


        if (!item) {

            return res.status(404).json({

                success: false,

                message:
                    "Item not found"

            });
        }


        // Find owner's shop

        const shop =
            await Shop.findOne({

                _id: item.shop,

                owner: req.userId

            });


        if (!shop) {

            return res.status(403).json({

                success: false,

                message:
                    "You are not allowed to edit this item"

            });
        }


        // ======================================
        // IMAGE
        // ======================================

        let image;


        if (req.file) {

            image =
                await uploadOnCloudinary(
                    req.file.path
                );
        }


        // ======================================
        // UPDATE
        // ======================================

        item.name =
            name;

        item.category =
            category;

        item.foodType =
            foodType;

        item.price =
            Number(price);


        if (image) {

            item.image =
                image;
        }


        await item.save();


        await shop.populate(
            "items"
        );


        return res.status(200).json({

            success: true,

            message:
                "Food item updated successfully",

            item,

            shop

        });


    } catch (error) {

        console.error(
            "Edit item error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                `Edit item error: ${error.message}`

        });
    }
};


// ==========================================
// DELETE ITEM
// ==========================================

export const deleteItem = async (
    req,
    res
) => {

    try {

        const {
            itemId
        } = req.params;


        const item =
            await Item.findById(
                itemId
            );


        if (!item) {

            return res.status(404).json({

                success: false,

                message:
                    "Item not found"

            });
        }


        const shop =
            await Shop.findOne({

                _id: item.shop,

                owner: req.userId

            });


        if (!shop) {

            return res.status(403).json({

                success: false,

                message:
                    "You are not allowed to delete this item"

            });
        }


        await Item.findByIdAndDelete(
            itemId
        );


        shop.items =
            shop.items.filter(
                (id) =>
                    id.toString() !==
                    itemId
            );


        await shop.save();


        await shop.populate(
            "items"
        );


        return res.status(200).json({

            success: true,

            message:
                "Food item deleted successfully",

            shop

        });


    } catch (error) {

        console.error(
            "Delete item error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                `Delete item error: ${error.message}`

        });
    }
};


// ==========================================
// GET ITEMS BY CITY
// ==========================================

export const getItemsByCity = async (
    req,
    res
) => {

    try {

        const {
            city
        } = req.query;


        let shops = [];

        if (city && city.trim() && city.trim().toLowerCase() !== "all") {
            shops = await Shop.find({
                city: {
                    $regex: `^${city.trim()}$`,
                    $options: "i"
                }
            }).populate("items");
        }

        // If no shops found in this specific city, fallback to all shops
        if (shops.length === 0) {
            shops = await Shop.find({}).populate("items");
        }

        const items = [];

        shops.forEach((shop) => {
            if (Array.isArray(shop.items)) {
                shop.items.forEach((item) => {
                    if (item) {
                        items.push({
                            ...item.toObject(),
                            shop: {
                                _id: shop._id,
                                name: shop.name,
                                city: shop.city,
                                state: shop.state,
                                address: shop.address,
                                image: shop.image
                            }
                        });
                    }
                });
            }
        });

        return res.status(200).json({
            success: true,
            items
        });


    } catch (error) {

        console.error(
            "Get items by city error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                `Get items by city error: ${error.message}`

        });
    }
};