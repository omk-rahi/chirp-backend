import z from "zod";

export const messageSchema = z.object({
  receiverId: z.string({ required_error: "Please provide receiverId" }),
  message: z.string().optional(),
  image: z.string().optional(),
});
