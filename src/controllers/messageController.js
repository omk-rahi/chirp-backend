import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.js";
import Message from "../models/Message.js";

export const sendMessage = asyncHandler(async (req, res, next) => {
  const sender = req.user;
  const { receiverId, message } = req.body;

  const receiver = await User.findById(receiverId);

  if (!receiver) return next(new AppError(400, "User not found"));

  let newMessage;

  if (req.file) {
    const imageUrl = req.file.filename;
    newMessage = await Message.create({
      sender: sender.id,
      receiver: receiver.id,
      imageUrl,
      message: message,
    });
  } else {
    newMessage = await Message.create({
      sender: sender.id,
      receiver: receiver.id,
      message: message,
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      message: newMessage,
    },
  });
});

export const getMessages = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const { friendId } = req.params;

  const friend = await User.findById(friendId);

  if (!friend) return next(new AppError(400, "User not found"));

  const messages = await Message.find({
    $or: [
      { sender: user.id, receiver: friend.id },
      { sender: friend.id, receiver: user.id },
    ],
  }).sort("createdAt");

  res.status(200).json({ status: "success", data: { messages } });
});
