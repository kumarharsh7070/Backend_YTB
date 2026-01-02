import { Router} from "express";
import { loginUser,  logoutUser, 
    registerUser,refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser,
    updateAccountDetails,
     updateUserAvatar,
      updateUserCoverImage,
      getUserChannelProfile,
       getWatchHistory,getAllUsers,deleteUser,forgotPassword,resetPassword} from "../Controller/User.controller.js";
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
router.get("/all", verifyJWT, getAllUsers)
router.delete("/:userId", verifyJWT, deleteUser)
 // secure route with jwt
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.get("/channel/:username", verifyJWT, getUserChannelProfile);
router.route("/history").get(verifyJWT, getWatchHistory)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

 export default router;