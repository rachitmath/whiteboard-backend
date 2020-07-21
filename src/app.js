var app = require("express")();
// var cors = require("cors");
// app.use(cors());
// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });
var http = require("http").createServer(app);
// var server = app.listen(3000, () => {
//   console.log("Server is listening on port: 3000");
// });
// // var http = require("https").createServer(app);
// const io = require("socket.io").listen(server).origins("*:*");

const io = require("socket.io")(http, {
  handlePreflightRequest: (req, res) => {
    const headers = {
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Origin": "*", //or the specific origin you want to give access to,
      "Access-Control-Allow-Credentials": true,
    };
    res.writeHead(200, headers);
    res.end();
  },
});

io.set("origins", "*:*");

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

http.listen(3000, () => {
  console.log("listening on *:3000");
});
