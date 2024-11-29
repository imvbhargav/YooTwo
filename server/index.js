import { Server } from 'socket.io';

// Start a new server at port 3000 and enable to be accessble by any site using cors true.
const io = new Server(3000, {
	cors: true,
});

// Maps to store data associated with usernames and rooms.
const socketIDToUsernameMap = new Map();
const socketIDToMeetIDMap = new Map();

// On connection is established.
io.on("connection", (socket) => {

	// Handle room join.
	socket.on("room:join", (data) => {

		// get username and Meet ID from the received data.
		const { username, meetid } = data;

		// Check if the room is already full (2 members exists).
		const roomInfo = io.sockets.adapter.rooms.get(meetid);
		if (roomInfo) {
			const usersInRoom = Array.from(roomInfo);
			if (usersInRoom.length >= 2) {
				io.to(socket.id).emit("error:full", { error: "Can't join the room.", message: `Sorry! Room '${meetid}' is already full.` });
				return;
			}
		}

		// Associate socket ID with username and meet ID.
		socketIDToMeetIDMap.set(socket.id, meetid);
		socketIDToUsernameMap.set(socket.id, username);

		// Join the room with the meet ID.
		socket.join(meetid);

		// Log in server the joining of the user.
		console.log(`User ${username} with socket ID ${socket.id} joined meet ${meetid}.`);

		// Notify users in the room and the joining user.
		io.to(meetid).emit("user:joined", { username, id: socket.id, meetid });

		// Notify the user that their joining is successful.
		io.to(socket.id).emit("room:join", data);
	});

	// Handle new user joining, as accepting the new user.
 	socket.on("user:accepted", (data) => {

		// Log in the server that user is being accepted.
		console.log("User accepted to the room: ", data.room);

		// Get the room information and console log all the users in a room.
		const roomInfo = io.sockets.adapter.rooms.get(data.room);
		if (roomInfo) {
			const usersInRoom = Array.from(roomInfo);
			console.log(`Users in room ${data.room}:`, usersInRoom);
		} else {
			console.log(`Room ${data.room} does not exist or is empty.`);
		}

		// Notify the users in the room about the user accepting the request.
		io.to(data.to).emit("user:here", data);
		io.to(data.room).emit("user:here", data);
	});

	// Handle offer to create a WebRTC Connection.
	socket.on("receive:offer", (data) => {
		io.to(data.room).emit("receive:offer", data);
	});

	// Handle answer receive to establish successful WebRTC Connection.
	socket.on("receive:answer", (data) => {
		io.to(data.room).emit("receive:answer", data);
	});

	socket.on("negotiate", (data) => {
		io.to(data.to).emit("negotiated", { from: socket.id, data});
	});

	socket.on("negotiation:complete", (data) => {
		io.to(data.to).emit("negotiation:complete", data);
	});

	// Handle socket disconnection.
	socket.on("disconnect", () => {
		const room = socketIDToMeetIDMap.get(socket.id);
		const username = socketIDToUsernameMap.get(socket.id);

		io.to(room).emit("user:left", {id: socket.id, username});
	});
});
