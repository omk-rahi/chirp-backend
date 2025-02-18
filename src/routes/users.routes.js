import { Router } from "express";
import { authenticate } from "../controllers/authController.js";
import { searchUser } from "../controllers/usersController.js";

const userRouter = new Router();

userRouter.route("/").get(authenticate, searchUser);

export default userRouter;
