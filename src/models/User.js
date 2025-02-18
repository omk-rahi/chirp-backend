import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Schema, model } from "mongoose";

const transform = function (doc, ret, options) {
  const obj = { ...ret, id: ret._id };
  delete obj.__v;
  delete obj._id;
  return obj;
};

const userSchema = new Schema(
  {
    fullName: String,
    email: String,
    username: String,
    bio: {
      type: String,
      default: "Hi There, I'm using Chirp.",
    },
    profile: {
      type: String,
      default: "base-avatar.png",
    },
    password: {
      type: String,
      select: false,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    otp: String,
    otpExpires: String,

    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    friendRequests: [
      {
        sender: { type: Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["pending", "accepted", "declined"],
          default: "pending",
        },
      },
    ],
  },
  {
    toObject: {
      transform,
    },
    toJSON: {
      transform,
    },
    timestamps: true,
  }
);

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();

  const hashedPassword = bcrypt.hashSync(this.password, 12);

  this.password = hashedPassword;

  next();
});

userSchema.methods.validatePassword = async (hashPassword, givenPassword) => {
  return await bcrypt.compare(givenPassword, hashPassword);
};

userSchema.methods.generateToken = (userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_TOKEN_SECRET, {
    expiresIn: process.env.JWT_TOKEN_EXPIRE_TIME,
  });
  return token;
};

const User = model("User", userSchema);

export default User;
