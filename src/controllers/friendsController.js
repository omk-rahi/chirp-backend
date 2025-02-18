import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.js";

export const getAllFriends = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate({
    path: "friends",
    select: "fullName email username bio profile isOnline",
  });

  res.status(200).json({
    status: "success",
    data: {
      friends: user.friends,
    },
  });
});

export const removeFriend = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const { friendId } = req.params;

  if (!friendId) return next(new AppError(400, "Friend ID is required"));

  // Find the friend
  const friend = await User.findById(friendId);
  if (!friend) return next(new AppError(404, "Friend not found"));

  // Remove each other from friends list
  user.friends.pull(friendId);
  friend.friends.pull(user.id);

  // Save both users
  await user.save();
  await friend.save();

  res.status(200).json({
    status: "success",
    message: "Friend removed successfully.",
  });
});
