import {Model, Schema} from "mongoose";

const profileSchema = new Schema({
    firstName:{
        type: String,
        default: ""
    },
    lastName:{
        type: String,
        default: ""
    },
    phoneNumber:{
        type: Number,
        default: ""
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, 
{
    timestamps: true
}
)

export const Profile = Model("Profile", profileSchema);