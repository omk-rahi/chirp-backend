import { Router } from "express";
import { authenticate } from "../controllers/authController.js";
import {
  getAllFriends,
  removeFriend,
} from "../controllers/friendsController.js";

const friendsRouter = new Router();

friendsRouter.route("/").get(authenticate, getAllFriends);

friendsRouter.route("/:friendId").delete(authenticate, removeFriend);

export default friendsRouter;
