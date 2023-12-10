import {Model, Schema} from "mongoose";

const cartSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    items: {
        type: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: "Product"
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: [1, "Quantity can not be less then 1."],
                    default: 1
                }
            }
        ]
    }
}, 
{
    timestamps: true
}
)

export const Cart = Model("Cart", cartSchema);