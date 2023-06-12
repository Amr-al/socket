const io = require("socket.io")(5000, {
  cors: {
    origin: "*",
  },
});

let requests = [];

let meetingId;

io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("join", (id) => {
    console.log("join: ", id, socket.id);
    if (id != null) {
      socket.join(id);
    }
  });

  socket.on("join room", (room) => {
    console.log("user joined room" + room);
    socket.join(room);
  });

  socket.on("sendMessage", (data) => {
    console.log("ffff", data);
    data.users.forEach((person) => {
      socket.to(person._id).emit("messageSent");
    });
  });

  socket.on("updateAllChats", (data) => {
    console.log("yyy ", data);
    data.users.forEach((person) => {
      socket.to(person._id).emit("updateAllChats");
    });
  });

  socket.on("reloadConv", (users) => {
    users.forEach((id) => {
      socket.to(id).emit("reloadConv");
    });
  });

  socket.on("typing", (data) => {
    console.log("xxx", data);
    socket.broadcast.to(data.id).emit("typing", data.user);
  });

  socket.on("stop typing", (data) => {
    console.log("ssss", data);
    socket.broadcast.to(data.id).emit("stop typing", data.user);
  });

  socket.on("meeting", (id) => {
    meetingId = id;
    if (id != null) {
      socket.join(id);
    }
  });

  socket.on("ask", ({ userId, hostId }) => {
    console.log("ask: ", userId, "to: ", meetingId);
    if (!requests.includes(userId)) requests.push(userId);
    requests = requests.filter((id) => id !== hostId);
    socket.to(meetingId).emit("toHost", { requests, userId, hostId });
  });

  socket.on("accept", ({ userId, hostId }) => {
    console.log(userId);
    socket.to(meetingId).emit("accept", {
      userId: userId,
      hostId,
    });
    requests = requests.filter((id) => id !== userId);

    socket.to(meetingId).emit("toHost", { requests, userId, hostId });
  });

  socket.on("reject", ({ userId, hostId }) => {
    console.log({ userId, hostId });
    socket.to(meetingId).emit("reject", {
      userId: userId,
      hostId,
    });

    requests = requests.filter((id) => id !== userId);

    socket.to(meetingId).emit("toHost", { requests, userId, hostId });
  });
});
