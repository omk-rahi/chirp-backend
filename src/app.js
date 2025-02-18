import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

import errorHandler from "./middlewares/errorHandler.js";

import authRouter from "./routes/auth.routes.js";
import requestRouter from "./routes/friendRequest.routes.js";
import friendsRouter from "./routes/friends.routes.js";
import userRouter from "./routes/users.routes.js";
import messagesRouter from "./routes/messages.routes.js";

const app = express();

app.use(morgan("dev"));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static("uploads"));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use("/api/auth/", authRouter);
app.use("/api/friends/", friendsRouter);
app.use("/api/friends/request", requestRouter);
app.use("/api/users/", userRouter);
app.use("/api/messages/", messagesRouter);

app.use(errorHandler);

export default app;
