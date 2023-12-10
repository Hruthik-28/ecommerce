import dotenv from "dotenv";
import connectToDB from "./db/dbConnect.js";

dotenv.config({
    path: "./env"
})
console.log(process.env.MONGODB_URI);

connectToDB()
