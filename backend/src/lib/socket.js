// import { Server } from "socket.io";
// import http from "http";

// let io;
// let server;
// // used to store online users
// const userSocketMap = {}; // {userId: socketId}

// export const initSocket = (app) => {
//   server = http.createServer(app);

//   // Set server timeout to prevent hanging connections
//   server.timeout = 30000; // 30 seconds

//   io = new Server(server, {
//     cors: {
//       // Allow connections from any origin in development
//       origin: process.env.NODE_ENV === "production" ? false : "*",
//       methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//       credentials: true,
//       allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
//     },
//     // Add connection timeout settings
//     connectTimeout: 10000, // 10 seconds
//     pingTimeout: 5000, // 5 seconds
//     pingInterval: 10000, // 10 seconds
//     upgradeTimeout: 10000, // 10 seconds
//     maxHttpBufferSize: 1e6, // 1MB
//   });

//   io.on("connection", (socket) => {
//     console.log("A user connected", socket.id);

//     const userId = socket.handshake.query.userId;
//     if (userId) userSocketMap[userId] = socket.id;

//     // io.emit() is used to send events to all the connected clients
//     io.emit("getOnlineUsers", Object.keys(userSocketMap));

//     socket.on("disconnect", () => {
//       console.log("A user disconnected", socket.id);
//       delete userSocketMap[userId];
//       io.emit("getOnlineUsers", Object.keys(userSocketMap));
//     });

//     // Handle connection errors
//     socket.on("error", (error) => {
//       console.error("Socket error:", error);
//     });
//   });

//   return { io, server };
// };

// export function getReceiverSocketId(userId) {
//   return userSocketMap[userId];
// }

// export { io, server };
import { Server } from "socket.io";
import http from "http";

let io;
let server;

// Store online users: { userId: socketId }
const userSocketMap = {};

export const initSocket = (app) => {
  server = http.createServer(app);

  server.timeout = 30000; // Prevent hanging connections

  io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === "production" ? false : "*",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    },
    connectTimeout: 10000,
    pingTimeout: 5000,
    pingInterval: 10000,
    upgradeTimeout: 10000,
    maxHttpBufferSize: 1e6, // 1MB
  });

  io.on("connection", (socket) => {
    console.log("✅ A user connected:", socket.id);

    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap[userId] = socket.id;
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }

    // 🔁 Redundant but safe registration
    socket.on("register-user", (userId) => {
      if (userId) {
        userSocketMap[userId] = socket.id;
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
      }
    });

    // 📞 Handle outgoing call
    socket.on("call-user", ({ targetUserId, offer }) => {
      try {
        const targetSocketId = userSocketMap[targetUserId];
        if (targetSocketId) {
          io.to(targetSocketId).emit("incoming-call", {
            from: socket.id,
            offer,
          });
        } else {
          console.warn("Target user not found for call-user:", targetUserId);
        }
      } catch (error) {
        console.error("Error in call-user:", error);
      }
    });

    // ✅ Handle call answer
    socket.on("answer-call", ({ to, answer }) => {
      try {
        if (to && answer) {
          io.to(to).emit("call-answered", { answer });
        }
      } catch (error) {
        console.error("Error in answer-call:", error);
      }
    });

    // ❌ Handle call end
    socket.on("end-call", ({ targetSocketId }) => {
      try {
        if (targetSocketId) {
          io.to(targetSocketId).emit("call-ended");
        }
      } catch (error) {
        console.error("Error in end-call:", error);
      }
    });

    // 🔌 Handle disconnection
    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
      const disconnectedUserId = Object.keys(userSocketMap).find(
        (id) => userSocketMap[id] === socket.id
      );
      if (disconnectedUserId) {
        delete userSocketMap[disconnectedUserId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
      }
    });

    // ⚠️ Handle unexpected socket errors
    socket.on("error", (error) => {
      console.error("⚠️ Socket error:", error);
    });
  });

  return { io, server };
};

// Utility to get a user's socket id
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

export { io, server };
