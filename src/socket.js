import { Server } from "socket.io";

import User from "./models/User.js";

const users = new Map();

const setOnlineStatus = async (userId, status) => {
  const user = await User.findById(userId);
  if (user) {
    user.isOnline = status;
    await user.save();
  }
};

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", async (socket) => {
    const userId = socket.handshake.query.userId;
    console.log(userId);

    if (userId) {
      setOnlineStatus(userId, true);
      users.set(socket.id, userId);
      socket.emit("refetch");
    }

    // socket.on("disconnect", async () => {
    //   const userId = users.get(socket.id);
    //   if (userId) {
    //     // setOnlineStatus(userId, false);
    //     socket.emit("userDisconnected");
    //   }
    // });

    socket.on("sendMessage", ({ sender }) => {
      io.emit("receiveMessage", {
        sender: sender,
      });
    });

    socket.on("userConnected", ({ userId }) => {
      setOnlineStatus(userId, true);
      socket.emit("refetch");
    });

    socket.on("userDisconnected", ({ userId }) => {
      setOnlineStatus(userId, false);
      socket.emit("refetch");
    });
  });

  return io;
};

export default setupSocket;
