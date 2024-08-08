const { createServer } = require("http");
const { Server } = require("socket.io");

const port = process.env.SOCKET_PORT || 3000;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A client connected");

  socket.on("send-message", (msg) => {
    socket.broadcast.emit("receive-message", msg);
  });

  socket.on("disconnect", () => {
    console.log("A client disconnected");
  });
});

httpServer.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}`);
});
