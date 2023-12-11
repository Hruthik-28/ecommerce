import {ApiError, ApiResponse, asyncHandler} from '../utils/index.js'
import { User } from '../models/auth/user.model.js'
import { AvailableUserRoles } from "../constants.js";

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findOne(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken

        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating the access token"
        );
    }
}

const registerUser = asyncHandler(async(req, res, next) => {
    const {username, email, password, role} = req.body

    if(!username || !email || !password || !role){
        throw new ApiError(400, "All fields are required")
    }

    const userExists = await User.findOne({
        $or: [{username, email}]
    })

    if (userExists) {
        throw new ApiError(409, "User with this email or username already exists!!!")
    }

    const user = await User.create({
        username,
        email,
        password,
        role: role || AvailableUserRoles.USER
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(
            200,
            createdUser,
            "User registered successfully !!!."
        )
    )
})

const loginUser = asyncHandler(async(req, res, next) => {
    const {username, email, password} = req.body

    if (!email || !password) {
        throw new ApiError(400, "Username or email is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
    console.log(accessToken, refreshToken);

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV
    }

    return res
            .status(200)
            .cookie("accesToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {user: loggedInUser, accessToken, refreshToken},
                    "User login successfull !!!."
            )
    )
})

const logoutUser = asyncHandler(async(req, res, next) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            },
        },
        {new: true}
    )

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out !!!."))
})

export {
    registerUser,
    loginUser,
    generateAccessAndRefreshToken,
    logoutUser
}