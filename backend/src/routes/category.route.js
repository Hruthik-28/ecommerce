import {Router} from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js";
import { createCategory } from "../controllers/category.controller.js";
import { AvailableUserRoles } from "../constants.js";

const router = Router();

router.route('/')
    .post(
        upload.none(),
        verifyJWT,
        verifyRole([AvailableUserRoles.ADMIN]),
        createCategory
    )

export default router