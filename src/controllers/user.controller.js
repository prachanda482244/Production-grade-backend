import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { generateAccessAndRefreshTokens } from "../utils/generateAccessAndRefreshTokens.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { cookieOptions } from "../utils/cookieOptions.js"

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists : username ,email
  // check for images , check for avatars
  // upload them to cloudinary , avatar
  // create user object , create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  const { username, email, password, fullname } = req.body
  if (
    [username, email, password, fullname].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All field required")
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  })

  if (existedUser) {
    throw new ApiError(409, "User with username and email already exists ")
  }

  const avatarLocalPath = req.files?.avatar[0]?.path
  // const coverImageLocalPath = req.files?.coverImage[0]?.path

  let coverImageLocalPath

  if (
    req.files &&
    Array.isArray(req.files.coverImage && req.files.coverImage.length > 0)
  ) {
    coverImageLocalPath = req.files.coverImage[0].path
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required")
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!avatar) {
    throw new ApiError(400, "Avatar file is missing")
  }

  const user = await User.create({
    username: username.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    fullname,
    password,
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )
  if (!createdUser) {
    throw new ApiError(500, "Failed to register the user")
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"))
})
const loginUser = asyncHandler(async (req, res) => {
  // Req body - data
  // username or email
  // find the user
  // password check
  // generate access and refresh token
  // send cookies

  const { email, username, password } = req.body
  console.log(email)
  if (!(username || email)) {
    throw new ApiError(400, "Username or email is required")
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  })

  if (!existedUser) {
    throw new ApiError(404, "User does not exist")
  }

  const isPasswordValid = await existedUser.isPasswordCorrect(password)

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    existedUser._id
  )
  const loggedInUser = await User.findById(existedUser._id).select(
    "-password -refreshToken"
  )
  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    )
})

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req?.user?._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  )

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"))
})
export { registerUser, loginUser, logoutUser }
