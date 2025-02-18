import crypto from "node:crypto";

export const getServerPath = (req) => {
  return `${req.protocol}://${req.hostname}:${process.env.PORT}`;
};

export const sendCookie = (res, { name, value }, options) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    ...options,
  };

  res.cookie(name, value, cookieOptions);
};

export const generateSecureOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};
