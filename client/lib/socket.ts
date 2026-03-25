import { io } from "socket.io-client";

export const socket = io(
  process.env.NEXT_PUBLIC_API_URL2! || "https://swiftride-gvce.onrender.com",
  {
    autoConnect: false,
  }
);