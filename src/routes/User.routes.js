import { Router} from "express";
import { loginUser,  logoutUser, registerUser,refreshAccessToken} from "../Controller/User.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/Multer.middleware.js";
const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        { 
            name:'coverImage',
            maxCount:1
        },
    ]),
    registerUser)

router.route("/login").post(loginUser)

 // secure route with jwt
 router.route("/logout").post(verifyJWT, logoutUser)
 router.route("/refresh-token").post(refreshAccessToken)
 
export default router;