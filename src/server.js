import { createServer } from "node:http";

import "dotenv/config";

import { openDBConnection } from "./config/db.js";

import app from "./app.js";
import setupSocket from "./socket.js";

const PORT = process.env.PORT || 3000;

// Connect to database
openDBConnection();

// Start Server

const server = createServer(app);

// Setting up sockets

setupSocket(server);

server.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);

process.on("uncaughtException", (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error(`Unhandled Rejection: ${reason}`);
  process.exit(1);
});
