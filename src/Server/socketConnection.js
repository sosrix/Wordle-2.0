const io = require("socket.io")(3003);

io.on("connection", (socket) => {
  console.log(socket.id);
});
