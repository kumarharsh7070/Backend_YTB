import { Router} from "express";
import { loginUser,  logoutUser, registerUser } from "../Controller/User.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../utils/multer.js";

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
export default router;