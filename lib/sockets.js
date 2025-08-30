import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
const URL =
  process.env.NODE_ENV === "production"
    ? "https://antonios-sockets.onrender.com/"
    : "http://localhost:3001";
// "http://localhost:3001";

export const socket = io(URL, {
  reconnectionAttempts: 2,
  reconnectionDelay: 3000,
  autoConnect: false,
});
