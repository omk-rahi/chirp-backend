import AppError from "../utils/AppError.js";

const devError = (err, res) => {
  res.status(Number(err.statusCode)).send({
    status: err.status,
    message: err.message,
    stack: err.stack,
  });
};

const prodError = (err, res) => {
  if (err.isOperational) {
    res
      .status(err.statusCode)
      .send({ status: err.status, message: err.message });
  } else {
    res.status(500).json({
      status: "error",
      message: "something went very wrong!",
    });
  }
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (err.name === "JsonWebTokenError")
    err = new AppError(401, "Invalid token");

  if (err.name === "TokenExpiredError")
    err = new AppError(
      401,
      "Your token is expired. Please request a new token"
    );

  if (err.name === "CastError" || err.name === "BSONError")
    err = new AppError(400, "Invalid Id");

  if (process.env.NODE_ENV === "development") devError(err, res);
  else if (process.env.NODE_ENV === "production") prodError(err, res);
};

export default errorHandler;
