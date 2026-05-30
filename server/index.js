import express from "express";
import { Server } from "socket.io";
import http from "http";

const app = express();
const server = http.createServer(app);

app.get("/", (req, res) => {
  res.send("WebRTC Signaling Server is Running");
});

const io = new Server(server, {
  cors: {
    origin: [
      "https://yootwo.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST"],
    credentials: true,
    transports: ["websocket", "polling"],
  },
  allowEIO3: true,
});

const socketIDToUsernameMap = new Map();
const socketIDToMeetIDMap = new Map();

io.on("connection", (socket) => {
  socket.on("room:join", (data) => {

	data.meetid = data.meetid.toLowerCase();
	
    const { username, meetid } = data;
    const roomInfo = io.sockets.adapter.rooms.get(meetid);

    if (roomInfo) {
      const usersInRoom = Array.from(roomInfo);
      if (usersInRoom.length >= 2) {
        io.to(socket.id).emit("error:meet", {
          error: "Can't join the room.",
          message: `Sorry! Room '${meetid}' is already full.`,
        });
        return;
      }
    } else if (!roomInfo && !data.newmeet) {
      io.to(socket.id).emit("error:meet", {
        error: "Can't join the room.",
        message: `Sorry! Room '${meetid}' closed / does not exist.`,
      });
      return;
    }

    socketIDToMeetIDMap.set(socket.id, meetid);
    socketIDToUsernameMap.set(socket.id, username);
    socket.join(meetid);

    console.log(
      `User ${username} with socket ID ${socket.id} joined meet ${meetid}.`,
    );

    io.to(socket.id).emit("room:join", data);
  });

  socket.on("peer:ready", (data) => {
    socket.to(data.room).emit("user:joined", {
      username: data.username,
      id: socket.id,
      meetid: data.room,
    });
  });

  socket.on("user:accepted", (data) => {
    console.log("User accepted to the room: ", data.room);
    const roomInfo = io.sockets.adapter.rooms.get(data.room);

    if (roomInfo) {
      const usersInRoom = Array.from(roomInfo);
      console.log(`Users in room ${data.room}:`, usersInRoom);
    } else {
      console.log(`Room ${data.room} does not exist or is empty.`);
    }

    io.to(data.room).emit("user:here", data);
  });

  socket.on("receive:offer", (data) => {
    io.to(data.room).emit("receive:offer", data);
  });

  socket.on("receive:answer", (data) => {
    io.to(data.room).emit("receive:answer", data);
  });

  socket.on("negotiate", (data) => {
    io.to(data.to).emit("negotiated", { from: socket.id, data });
  });

  socket.on("negotiation:complete", (data) => {
    io.to(data.to).emit("negotiation:complete", data);
  });

  socket.on("ice:send", (data) => {
    socket.to(data.to).emit("ice:receive", { candidate: data.candidate });
  });

  socket.on("disconnect", () => {
    const room = socketIDToMeetIDMap.get(socket.id);
    const username = socketIDToUsernameMap.get(socket.id);

    if (room) {
      io.to(room).emit("user:left", { id: socket.id, username });
    }
  });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
