import {ApiError, ApiResponse, asyncHandler, sendMail, uploadOnCloudinary} from '../utils/index.js';
import { Category } from '../models/ecommerce/category.model.js';

export const createCategory = asyncHandler(async(req, res) => {
    const {name} = req.body;

    if (!name) {
        throw new ApiError(400, "Category name is mandatory");
    }

    const category = await Category.create({
        name,
        owner: req.user._id
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                category,
                "category created successfully"
            )
        )
});