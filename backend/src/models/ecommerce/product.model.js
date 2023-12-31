import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const productSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    category:{
        type: Schema.Types.ObjectId,
        ref: "Category"
    },
    description:{
        type: String,
        required: true
    },
    mainImage:{
        type: {
            url: String
        },
        required: true
    },
    subImages: {
        type: [
            {
                url: String,
            },
        ],
        default: [],
    },
    stock:{
        default: 1,
        type: Number
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
}, 
{
    timestamps: true
}
)
productSchema.plugin(mongooseAggregatePaginate);

export const Product = mongoose.model("Product", productSchema);