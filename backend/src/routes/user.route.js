import {Router} from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route('/register').post(upload.none(), registerUser)
router.route('/login').post(upload.none(), loginUser)
router.route('/logout').post(upload.none(), logoutUser)

export default router;