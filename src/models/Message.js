import { Schema, model } from "mongoose";

const transform = function (doc, ret, options) {
  const obj = { ...ret, id: ret._id };
  delete obj.__v;
  delete obj._id;
  return obj;
};

const messageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: { type: String },
    imageUrl: { type: String },
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

const Message = model("Message", messageSchema);

export default Message;
