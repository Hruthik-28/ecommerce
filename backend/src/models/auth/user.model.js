import {Model, Schema} from "mongoose";
import { AvailableUserRoles } from "../../constants.js";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    role: {
        type: String,
        required: true,
        enum: AvailableUserRoles,
        default: AvailableUserRoles.USER
    },
    refreshToken: {
        type: String,
    },
    forgotPasswordToken: {
        type: String,
    },
    forgotPasswordExpiry: {
        type: Date,
    },
}, 
{
    timestamps: true
}
)

export const User = Model("User", userSchema);