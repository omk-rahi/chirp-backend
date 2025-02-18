import { promisify } from "node:util";

import jwt from "jsonwebtoken";

import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import sendMail from "../utils/sendMail.js";
import { generateSecureOTP, sendCookie } from "../utils/utils.js";

export const signup = asyncHandler(async (req, res, next) => {
  const { fullName, username, email, password } = req.body;
  // Check if the email or username already exits
  const user = await User.findOne({
    $or: [{ email: email }, { username: username }],
  });

  if (user) return next(new AppError(400, "Email or Username already exits"));

  // generate otp

  const otp = generateSecureOTP();
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

  // Save the user
  const newUser = await User.create({
    fullName,
    email,
    password,
    username,
    otp,
    otpExpires,
    isOnline: false,
  });

  // Send verification email
  sendMail({
    to: newUser.email,
    subject: "Verify your email address",
    text: `Your One-Time Password (OTP) is ${otp}. Please enter this code to verify your identity.`,
  });

  // Send the response
  res.status(201).send({
    status: "success",
    message: "Registration successful, please verify your email.",
    data: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      username: newUser.username,
    },
  });
});

export const verify = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  if (new Date(user.otpExpires) < Date.now())
    return next(new AppError(400, "OTP expired. Request a new one."));

  if (otp !== user.otp) return next(new AppError(400, "Invalid OTP"));

  // 3. Mark the account verified
  user.isVerified = true;
  user.otp = null;
  user.otpExpires = null;
  await user.save();

  // 5. Send the response
  res.status(200).send({ status: "success", message: "Email verified" });
});

export const resendOTP = asyncHandler(async (req, res, next) => {
  // 1. Read email from the body
  const { email } = req.body;

  if (!email) return next(new AppError(400, "Email is required"));

  // 2. Check if the user exits
  const user = await User.findOne({ email });

  if (!user)
    return next(
      new AppError(400, "Unable to find account associated with the email")
    );

  // 3. Check if the account is already verified
  if (user.isVerified)
    return next(new AppError(400, "Your account is already verified"));

  // generate otp
  const otp = generateSecureOTP();
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

  user.otp = otp;
  user.otpExpires = otpExpires;

  //5. Send OTP email
  sendMail({
    to: newUser.email,
    subject: "Verify your email address",
    text: `Your One-Time Password (OTP) is ${otp}. Please enter this code to verify your identity.`,
  });

  // 5. Send Response
  res.status(200).json({
    status: "success",
    message: "OTP sent to your email address.",
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const { usernameOrEmail, password, rememberMe } = req.body;

  //  Check if the user exits
  const user = await User.findOne({
    $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
  }).select("+password");

  if (!user) return next(new AppError(400, "Account does not exit"));

  // Check if the account is verified

  if (!user.isVerified)
    return next(new AppError(400, "Please verify your email first"));

  // 4. Validate Password
  const isPasswordValid = await user.validatePassword(user.password, password);

  if (!isPasswordValid)
    return next(new AppError("401", "Invalid email or password"));

  // 5. Sign the JWT access token & refress token

  const token = user.generateToken(user.id);

  // 7. Send Cookies

  const cookieOption = rememberMe
    ? { maxAge: 30 * 24 * 60 * 60 * 1000 }
    : { maxAge: 1 * 24 * 60 * 60 * 1000 };

  sendCookie(res, { name: "token", value: token }, cookieOption);

  // 8. Send the response

  res.status(200).send({
    status: "success",
    data: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      bio: user.bio,
      profile: user.profile,
      isOnline: user.isOnline,
      token,
    },
  });
});

export const logout = asyncHandler(async (req, res, next) => {
  const { user } = req;

  user.token = null;
  await user.save();

  sendCookie(res, { name: "token", value: "" });

  res.status(200).json({ status: "success", message: "Logged out successful" });
});

export const userProfile = asyncHandler(async (req, res, next) => {
  const { user } = req;

  const { id, fullName, email, username, bio, profile } = user;

  res.send({
    status: "success",
    data: { id, fullName, email, username, bio, profile },
  });
});

export const updateProfile = asyncHandler(async (req, res, next) => {
  const user = req.user;

  const { fullName, email, username, bio } = req.body;

  const isEmailExits = await User.findOne({
    email: email,
    _id: { $ne: user._id },
  });

  const isUsernameExits = await User.findOne({
    username: username,
    _id: { $ne: user._id },
  });

  if (isEmailExits) return next(new AppError(400, "Email already exits"));
  if (isUsernameExits) return next(new AppError(400, "Username already exits"));

  if (fullName) user.fullName = fullName;
  if (email) user.email = email;
  if (username) user.username = username;
  if (bio) user.bio = bio;

  if (req.file) {
    user.profile = req.file.filename;
  }

  await user.save();

  return res.status(200).json({
    status: "success",
    message: "Profile updated successfully",
    data: {
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      bio: user.bio,
      profile: user.profile,
    },
  });
});

export const authenticate = asyncHandler(async (req, res, next) => {
  // 1. Read the token

  let token = req.cookies.token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  )
    token = req.headers.authorization.split(" ").at(1);

  if (!token) {
    return next(
      new AppError(401, "You are not logged in. Please log in to get access")
    );
  }

  // 2. Verify the token
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_TOKEN_SECRET
  );

  // 3. Check if the user exits
  const user = await User.findById(decoded.id);

  if (!user)
    return next(
      new AppError(
        401,
        "The user with given token does not exit. Please log in again"
      )
    );

  // 4. Allow Access
  req.user = user;

  next();
});
