import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.js";

export const searchUser = asyncHandler(async (req, res, next) => {
  const { query } = req.query;

  let filters;

  if (query)
    filters = {
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    };

  const users = await User.find({
    ...filters,
    _id: { $ne: req.user.id },
  }).select("fullName email username bio profile");

  res.status(200).json({ status: "success", data: { users } });
});
