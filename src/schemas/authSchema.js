import z from "zod";

export const signUpSchema = z.object({
  fullName: z.string({ required_error: "Fullname is required" }),

  username: z
    .string({ required_error: "Username is required" })
    .min(3, { message: "Username must be at least 4 characters" }),

  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Please provide a valid email address" }),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, { message: "Password must be 8 character long" }),
});

export const loginSchema = z.object({
  usernameOrEmail: z.string({
    required_error: "Please provide usernameOrEmail field",
  }),
  password: z.string({ required_error: "Password is required" }),
  rememberMe: z.boolean().optional(),
});

export const verifyOTPSchema = z.object({
  email: z.string({ required_error: "Email is required" }),
  otp: z.string({ required_error: "OTP is required" }).length(6, "Invalid OTP"),
});

export const updateProfileSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().optional(),
  username: z.string().optional(),
  bio: z.string().optional(),
});
