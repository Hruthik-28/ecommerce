import dotenv from "dotenv";
import connectToDB from "./db/dbConnect.js";
import app from "./app.js";

dotenv.config({
    path: "./env"
})

connectToDB()
.then(() => {
    const PORT = process.env.PORT || 8001
    app.listen(PORT, () => {
        console.log(`Server listening on: ${process.env.PORT}`)
    })
})
.catch((error) => console.log("MONGODB connection failed!!!", error))
