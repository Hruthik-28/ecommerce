import {ApiError, ApiResponse, asyncHandler, sendMail, forgotPasswordMailgenContent} from '../utils/index.js'
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

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV
    }

    return res
            .status(200)
            .cookie("accessToken", accessToken, options)
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

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        { new: true }
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

const getCurrentUser = asyncHandler(async(req, res, next) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "Current user fetched successfully")
        )
})

const changeCurrentPassword = asyncHandler(async(req, res, next) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user._id)

    const isOldPasswordCorrect = await user.comparePassword(oldPassword)

    if (!isOldPasswordCorrect) {
        throw new ApiError(400, "Invalid old password.")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Password changed successfully !!!.")
        )
})

const forgotPasswordRequest = asyncHandler(async(req, res, next) => {
    const {email} = req.body

    //get email from user and check if user exists
    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(400, "User doesnot exist.")
    }

    //generate a temporary token
    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken() // generate password reset creds

    //save the hash version of token and expiry in db
    user.forgotPasswordToken = hashedToken
    user.forgotPasswordExpiry = tokenExpiry

    // Send mail with the password reset link. It should be the link of the frontend url with token
    await sendMail({
        email: user?.email,
        subject: "Password reset request",
        mailgenContent: forgotPasswordMailgenContent(
            user?.username,
            // ! NOTE: Following link should be the link of the frontend page responsible to request password reset
            // ! Frontend will send the below token with the new password in the request body to the backend reset password endpoint
            // * Ideally take the url from the .env file which should be the url of the frontend
            `${req.protocol}://${req.get(
                "host"
            )}/api/v1/users/reset-password/${unHashedToken}`
        )
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                {}, 
                "Password reset mail has been sent on your mail id"
            )
        )
})

export {
    registerUser,
    loginUser,
    generateAccessAndRefreshToken,
    logoutUser,
    getCurrentUser,
    changeCurrentPassword,
    forgotPasswordRequest
}