import {Router} from "express";
import { 
            registerUser, 
            loginUser, 
            logoutUser, 
            getCurrentUser, 
            changeCurrentPassword, 
            forgotPasswordRequest ,
            resetForgottenPassword,
        } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

//unprotected routes

router.route('/register').post(upload.none(), registerUser)
router.route('/login').post(upload.none(), loginUser)

//protected routes
router.route('/logout').post(upload.none(), verifyJWT, logoutUser)
router.route('/current-user').get(upload.none(), verifyJWT, getCurrentUser)
router.route('/change-password').post(upload.none(), verifyJWT, changeCurrentPassword)
router.route('/forgot-password').post(upload.none(), verifyJWT, forgotPasswordRequest)
router.route('/forgot-password/:resetToken').post(upload.none(), verifyJWT, resetForgottenPassword)

export default router;