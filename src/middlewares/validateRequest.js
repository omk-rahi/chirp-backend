import AppError from "../utils/AppError.js";

const validateRequest = (schema) => (req, res, next) => {
  console.log("Incoming Request Body:", req.body);

  const result = schema.safeParse(req.body);
  if (!result.success)
    return next(new AppError(400, result.error.errors[0].message));

  next();
};

export default validateRequest;
