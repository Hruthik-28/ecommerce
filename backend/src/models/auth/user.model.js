import mongoose, {Schema} from "mongoose";
import { AvailableUserRoles, USER_TEMPORARY_TOKEN_EXPIRY } from "../../constants.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto"

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
);

userSchema.pre("save", async function(next){
    if(!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password, 10)
    return next()
});

userSchema.methods = {
    comparePassword: async function(plainTextPassword) {
        return await bcrypt.compare(plainTextPassword, this.password)
    },
    generateAccessToken: function(){
        return jwt.sign(
            {
                _id: this._id,
                email: this.email,
                username: this.username,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY
            }
        )
    },
    generateRefreshToken: function(){
        return jwt.sign(
            {
                _id: this._id
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY
            }
        )
    },
    generateTemporaryToken: function(){
        //this token should be client facing
        const unhashedToken = crypto.randomBytes(20).toString("hex")

        // This should stay in the DB to compare at the time of verification
        const hashedToken = crypto
            .createHash("sha256")
            .update(unhashedToken)
            .digest("hex");
        
        // This is the expiry time for the token (20 minutes)
        const tokenExpiry = Date.now() + USER_TEMPORARY_TOKEN_EXPIRY

        return {
            unhashedToken,
            hashedToken,
            tokenExpiry
        }
    }
}

export const User = mongoose.model("User", userSchema);