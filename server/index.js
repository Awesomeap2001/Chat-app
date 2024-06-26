const express = require("express");
const cors = require("cors");
const connectdb = require("./db/connectDB");
const socket = require("socket.io");
const userRouter = require("./routes/userRoutes");
const messageRouter = require("./routes/messagesRoute");

const app = express();
app.use(cors());
app.use(express.json());
require("dotenv").config();

const PORT = process.env.PORT || 8080;

connectdb()

app.use("/api/auth", userRouter)
app.use("/api/messages", messageRouter)

const server = app.listen(PORT, () => {
    console.log(`Server running at Port - ${PORT}`)
})

// Socket.io Code
const io = socket(server, {
    cors: {
        origin: "*",
        credentials: true
    }
})

global.onlineUsers = new Map();

io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id)
    });

    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-receive", data.message)
        }
    })
})