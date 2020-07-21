var app = require("express")();
// var http = require("http").createServer(app);
var http = require("https").createServer(app);
const io = require("socket.io")(http);
const crypto = require("crypto");
var cors = require("cors");

app.use(cors());
app.set("port", process.env.PORT || 4000);

// app.get("/", (req, res) => {
//   res.send("<h1>Hello world</h1>");
// });
const rooms = [];
var usernames = {};

io.on("connection", (socket) => {
  socket.on("setUserId", function (uId) {
    socket.userId = uId;
  });

  socket.on("adduser", function (username, room) {
    socket.username = username;
    socket.room = room;
    usernames[username] = username;
    socket.join(room);
    socket.emit("updatechat", "SERVER", "you have connected to " + socket.room);
    socket.broadcast
      .to(room)
      .emit("updatechat", "SERVER", username + " has connected to this room");
  });

  socket.on("create", function (room) {
    rooms.push(room);
    socket.emit("getroom", room);
  });

  socket.on("sendchat", function (room, username, data) {
    // io.sockets.in("room-" + room).emit("updatechat", username, data);
    io.to(room).emit("updatechat", username, data);
  });

  // socket.on("check-user", function (room) {
  //   var clients = io.sockets.adapter.rooms[room].length;
  //   socket.emit("total-user", clients);
  // });

  socket.on("draw-coordinates", function (data) {
    // console.log(data);
    io.emit("draw", data);
  });

  socket.on("disconnect", function () {
    delete usernames[socket.username];
    io.sockets.emit("updateusers", usernames);
    socket.broadcast.emit(
      "updatechat",
      "SERVER",
      socket.username + " has disconnected"
    );
    socket.leave(socket.room);
  });
});

http.listen(app.get("port"), () => {
  console.log("listening on *:4000");
});
