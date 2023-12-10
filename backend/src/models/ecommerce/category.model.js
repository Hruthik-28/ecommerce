import mongoose, {Schema} from "mongoose";

const categorySchema = new Schema({
    name:{
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
}, 
{
    timestamps: true
}
)

export const Category = mongoose.model("Category", categorySchema);