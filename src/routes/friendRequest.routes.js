import { Router } from "express";
import { authenticate } from "../controllers/authController.js";
import {
  acceptRequest,
  getAllFriendRequests,
  rejectRequest,
  sendRequest,
} from "../controllers/FriendRequestController.js";

const requestRouter = new Router();

requestRouter
  .route("/")
  .get(authenticate, getAllFriendRequests)
  .post(authenticate, sendRequest);

requestRouter
  .route("/:requestId")
  .patch(authenticate, acceptRequest)
  .delete(authenticate, rejectRequest);

export default requestRouter;
