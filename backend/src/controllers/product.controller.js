import {ApiError, ApiResponse, asyncHandler, sendMail, uploadOnCloudinary} from '../utils/index.js';
import { Product } from '../models/ecommerce/product.model.js';
import { Category } from '../models/ecommerce/category.model.js';

export const createProduct = asyncHandler(async(req, res) => {
    const {title, price, category, description, stock} = req.body;

    if (!title || !price || !category ||!description ||!stock) {
        throw new ApiError(400, "All fields are mandatory");
    }

    //check for category that the product needs to be added
    const categoryToBeAdded = await Category.findById(category);

    if (!categoryToBeAdded) {
        throw new ApiError(404, "Category doesn't exist");
    }

    //check for mainImage and upload to cloudinary
    const mainImageLocalPath = req.files?.mainImage[0].path;

    if (!mainImageLocalPath) {
        throw new ApiError(400, "main image is required");
    }

    const mainImage = await uploadOnCloudinary(mainImageLocalPath);

    if (!mainImage) {
        throw new ApiError(400, "main image is required");
    }

    //check for subImages and upload to cloudinary
    const subImages = req.files?.subImages && req.files?.subImages.length ?
        await Promise.all(
            req.files.subImages.map(async(image) => {
                const subImageLocalPath = image.path;
                const subImage = await uploadOnCloudinary(subImageLocalPath);
                const url = subImage.url
                return {url};
            })
        ) : [];


    const owner = req.user._id;

    const product = await Product.create({
        title,
        price,
        category,
        description,
        mainImage: {
            url: mainImage.url
        },
        subImages,
        stock,
        owner
    });

    return res
        .status(201)
        .json(
            new ApiResponse(201, product, "product created successfully")
        )
});
