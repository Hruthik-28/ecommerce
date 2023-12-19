import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = new express();

app.use(cors({
    origin: `${process.env.CORS}`,
    credentials: true
}))

app.use(express.urlencoded({extended: true, limit: '16kb'}))
app.use(express.json({limit: '16kb'}))
app.use(express.static('public'))
app.use(cookieParser())

//routes import

import userRouter from "./routes/user.route.js"
import productRouter from "./routes/product.route.js"
import categoryRouter from "./routes/category.route.js"

app.use('/api/v1/user', userRouter)
app.use('/api/v1/product', productRouter)
app.use('/api/v1/category', categoryRouter)

export default app;