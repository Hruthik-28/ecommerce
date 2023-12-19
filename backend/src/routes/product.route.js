import {Router} from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js";
import { createProduct } from "../controllers/product.controller.js";
import { AvailableUserRoles } from "../constants.js";

const router = Router();

router.route('/')
    // .get(getAllProducts)
    .post(
        verifyJWT,
        verifyRole([AvailableUserRoles.ADMIN]),
        upload.fields([
            {
                name: "mainImage",
                maxCount: 1
            },
            {
                name: "subImages",
                maxCount: 4
            }
        ]),
        createProduct
    )

export default router;