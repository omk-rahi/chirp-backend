import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const sendRequest = asyncHandler(async (req, res, next) => {
  const sender = req.user.id;
  const { to } = req.body;

  if (!to)
    return next(
      new AppError(400, "Please specify whom you want to send request")
    );

  if (sender === to)
    return next(new AppError(400, "You can't send request to yourself"));

  const user = await User.findById(to);

  if (!user) return next(new AppError(400, "User does not exit"));

  const doesRequestExit = user.friendRequests.some((request) =>
    request.sender.equals(sender)
  );

  if (doesRequestExit)
    return next(new AppError(400, "Friend request already exits!"));

  // check if there are already friends
  const isAlreadyFriend = user.friends.some((friend) => friend.equals(sender));
  console.log(isAlreadyFriend);

  if (isAlreadyFriend)
    return next(new AppError(400, "You are already friends with this user"));

  user.friendRequests = [...user.friendRequests, { sender, status: "pending" }];

  await user.save();

  res.status(201).json({
    status: "success",
    message: "Friend Request sent successfully.",
  });
});

export const getAllFriendRequests = asyncHandler(async (req, res, next) => {
  const { user } = req;

  await user.populate({
    path: "friendRequests.sender",
    select: "fullName username email profile bio",
  });

  res.status(200).json({
    status: "success",
    data: {
      requests: user.friendRequests,
    },
  });
});

export const acceptRequest = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const { requestId } = req.params;

  if (!requestId) return next(new AppError(400, "Request ID is required"));

  // Find the request
  const friendRequest = user.friendRequests.id(requestId);

  if (!friendRequest)
    return next(new AppError(400, "Friend request not found"));

  const sender = await User.findById(friendRequest.sender);

  // Remove request
  user.friendRequests.pull({ _id: requestId });

  // Add each other as friends
  user.friends.push(sender.id);
  sender.friends.push(user.id);

  await user.save();
  await sender.save();

  res.status(200).json({
    status: "success",
    message: "Friend request accepted.",
  });
});

export const rejectRequest = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const { requestId } = req.params;

  if (!requestId) return next(new AppError(400, "Request ID is required"));

  // Find the friend request
  const friendRequest = user.friendRequests.id(requestId);

  if (!friendRequest)
    return next(new AppError(404, "Friend request not found"));

  // Remove the request from friendRequests
  user.friendRequests.pull(requestId);

  // Save the updated user data
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Friend request rejected.",
  });
});
