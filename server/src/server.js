import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import http from "http";
import { initSocket } from "./middleware/socket.js";

//port
const port = process.env.PORT || 6000;

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
};

startServer();
