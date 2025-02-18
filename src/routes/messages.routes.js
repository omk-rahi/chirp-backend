import { Router } from "express";
import { authenticate } from "../controllers/authController.js";
import { getMessages, sendMessage } from "../controllers/messageController.js";

import validateRequest from "../middlewares/validateRequest.js";
import { messageSchema } from "../schemas/messageSchema.js";

import upload from "../config/multer.js";

const messagesRouter = new Router();

messagesRouter
  .route("/")
  .post(
    authenticate,
    upload.single("image"),
    validateRequest(messageSchema),
    sendMessage
  );

messagesRouter.get("/:friendId", authenticate, getMessages);

export default messagesRouter;
