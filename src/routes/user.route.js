import { Router } from "express"
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const userRouter = Router()

userRouter.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
)
userRouter.route("/login").post(loginUser)

// Secured Routes
userRouter.route("/logout").post(verifyJWT, logoutUser)
userRouter.route("/refresh-access-token").post(refreshAccessToken)
userRouter.route("/change-password").post(verifyJWT, changeCurrentPassword)
userRouter.route("/current-user").get(verifyJWT, getCurrentUser)
userRouter
  .route("/update-account-details")
  .patch(verifyJWT, updateAccountDetails)

userRouter
  .route("/avatar-update")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
userRouter
  .route("/cover-image-update")
  .patch(verifyJWT, upload.single("/coverImage"), updateUserCoverImage)
userRouter.route("/channel/:username").get(verifyJWT, getUserChannelProfile)
userRouter.route("/watch-history").get(verifyJWT, getWatchHistory)

export default userRouter
