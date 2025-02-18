import { Router } from "express";
import validateRequest from "../middlewares/validateRequest.js";

import {
  resendOTP,
  signup,
  verify,
  login,
  authenticate,
  logout,
  userProfile,
  updateProfile,
} from "../controllers/authController.js";

import {
  loginSchema,
  signUpSchema,
  updateProfileSchema,
  verifyOTPSchema,
} from "../schemas/authSchema.js";

import upload from "../config/multer.js";

const authRouter = new Router();

authRouter.route("/signup").post(validateRequest(signUpSchema), signup);
authRouter.route("/login").post(validateRequest(loginSchema), login);
authRouter.route("/otp/verify").post(validateRequest(verifyOTPSchema), verify);
authRouter.route("/otp/resend").post(resendOTP);

authRouter.route("/logout").post(authenticate, logout);
authRouter.route("/me").get(authenticate, userProfile);
authRouter
  .route("/me")
  .patch(
    authenticate,
    validateRequest(updateProfileSchema),
    upload.single("image"),
    updateProfile
  );

export default authRouter;
