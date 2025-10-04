import { asyncHandler } from "../utils/asyncHandler.js";   
import { ApiError } from "../utils/ApiError.js";
import jwt from 'jsonwebtoken';
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // extract token either from cookies or Authorization header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Access token is missing");
    }

    // verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    //  find user in DB without password & refreshToken
    const user = await User.findById(decoded?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user; // attach user to request
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});
