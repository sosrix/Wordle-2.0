// setting up mongodb
const { MongoClient, ObjectId } = require("mongodb");

// setting up socket.io
const io = require("socket.io")(3003, {
  cors: {
    origin: ["https://wordle2-0.herokuapp.com"],
  },
});

// Connection URL
const url = process.env.MONGODB_URI;
const client = new MongoClient(url);

// Database Name
const dbName = "wordleProject";

// states of the game
let connectedPlayerCount = 0;
let wordlesMap = {};
let colorObj = {};
let livePlayers = {};
let queueRooms = [];
let createdRooms = [];

// the main function to make on demand custom calls to the database
async function main(action, socketID, tryWord, randomRoom) {
  // connecting to the server
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection("liveGames");

  // the following code inject into the collection liveGames
  if (action === "init") {
    let randRange = Math.floor(Math.random() * 200);
    const allWords = await collection
      .find({ _id: ObjectId("63213ca1594160ec3ea18b17") })
      .toArray();
    if (!wordlesMap[randomRoom]) {
      wordlesMap[randomRoom] = await allWords[0][randRange].toUpperCase();
    }
    if (livePlayers[randomRoom] && livePlayers[randomRoom][0] === socketID) {
      await collection.insertMany([
        {
          player_token: socketID,
          random_word: await wordlesMap[randomRoom],
          roomID: randomRoom,
          number_of_tries: 0,
        },
      ]);

      livePlayers[socketID] = randomRoom;
      console.log("player 1 ready");
    } else if (
      livePlayers[randomRoom] &&
      livePlayers[randomRoom][1] === socketID
    ) {
      await collection.insertMany([
        {
          player_token: socketID,
          random_word: await wordlesMap[randomRoom],
          roomID: randomRoom,
          number_of_tries: 0,
        },
      ]);
      livePlayers[socketID] = randomRoom;
      console.log("player 2 ready");
    }
  }
  if (action === "disconnect") {
    delete colorObj[socketID];
    delete livePlayers[socketID];
    delete livePlayers[randomRoom];
    delete wordlesMap[randomRoom];
    queueRooms.splice(queueRooms.indexOf(socketID), 1);
    createdRooms.splice(createdRooms.indexOf(socketID), 1);
  }

  if (action === "find") {
    let numOftriesBefore = 0;
    if (!colorObj[socketID]) {
      colorObj[socketID] = [];
    }
    const filteredDocs = await collection
      .find({ player_token: socketID })
      .toArray();

    numOftriesBefore = await filteredDocs[0].number_of_tries;
    if (numOftriesBefore >= 6) {
      console.log("You consumed your attempts");
      return;
    }

    const updateResult = await collection.updateOne(
      { player_token: socketID },
      {
        $set: {
          [tryWord.join("")]: "try number " + (numOftriesBefore + 1),
          number_of_tries: numOftriesBefore + 1,
        },
      }
    );

    let wordFromDB = filteredDocs[0].random_word;

    tryWord.forEach((c, key) => {
      const realC = wordFromDB[key];
      if (realC === c) {
        colorObj[socketID].push("#43aa13");
      } else {
        const isExist = wordFromDB.split("").some((el) => el === c);
        if (isExist) {
          colorObj[socketID].push("#aa9f00");
        } else {
          colorObj[socketID].push("#363636");
        }
      }
    });

    io.to(livePlayers[socketID]).emit(
      "treated-colors",
      colorObj[socketID],
      socketID
    );

    if (tryWord.join("") === wordFromDB) {
      // Check for win
      io.to(socketID).emit("end-game", wordFromDB, "win");
      return;
    }
    if (numOftriesBefore == 5) {
      // Check for win
      io.to(socketID).emit("end-game", wordFromDB, "lost");
      return;
    }

    console.log(numOftriesBefore);
  }
  return;
}

// on user visit we create a new socket
io.on("connection", (socket) => {
  connectedPlayerCount++;
  console.log(
    "SOCKET CONNECTING " + socket.id,
    "-Total players [" + connectedPlayerCount + "]"
  );
  // check-authentication
  socket.on("check-authentication", (socketID) => {
    if (livePlayers[socketID]) {
      socket.emit("authentication", true);
    } else {
      socket.emit("authentication", false);
    }
  });
  // creating a new room
  socket.on("create-room", (room) => {
    if (livePlayers[socket.id]) {
      return;
    }
    if (!livePlayers[room]) {
      livePlayers[room] = [];
    }
    if (livePlayers[room].includes(socket.id)) {
      console.log("player EXIST");
    } else {
      livePlayers[room].push(socket.id);
      livePlayers[socket.id] = true;
      console.log("player Added");
      socket.join(room);
      socket.emit("Wait-other-player", room);
      createdRooms.push(socket.id);
    }
  });

  // joining the Queue for games and initializing a game if 2 players are ready in Queue
  socket.on("check-queue", () => {
    if (livePlayers[socket.id]) {
      return;
    }
    const roomIdGen = function () {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };
    const room = roomIdGen();
    if (!livePlayers[room]) {
      livePlayers[room] = [];
    }

    if (
      queueRooms.length > 0 &&
      !livePlayers[queueRooms[queueRooms.length - 1]].includes(socket.id)
    ) {
      socket.join(queueRooms[queueRooms.length - 1]);
      livePlayers[queueRooms[queueRooms.length - 1]].push(socket.id);
      io.in(queueRooms[queueRooms.length - 1]).emit(
        "found-game",
        queueRooms[queueRooms.length - 1]
      );
      livePlayers[socket.id] = true;
      queueRooms.pop();
    } else {
      queueRooms.push(room);
      socket.join(queueRooms[queueRooms.length - 1]);
      livePlayers[queueRooms[queueRooms.length - 1]].push(socket.id);
      livePlayers[socket.id] = true;
      socket.emit("Wait-other-player", room);
    }
  });

  // Check if a room is there and join it through the room token
  socket.on("check-room", (room) => {
    if (!livePlayers[room]) {
      console.log(`This ${room} doesn't exist, try creating one :)`);
    }
    if (
      Object.keys(livePlayers).includes(room) &&
      livePlayers[room].length === 1
    ) {
      livePlayers[room].push(socket.id);
      socket.join(room);
      io.in(room).emit("found-game", room);
    }
  });

  // get called if all requirement are set, and starts a game with the 2 players in the same room
  socket.on("initialize-game", (room) => {
    main("init", socket.id, "null", room)
      .catch(console.error)
      .finally(() => client.close());

    socket.emit("isExist", room);
  });

  // clean up on socket disconnect
  socket.on("disconnect", function () {
    connectedPlayerCount--;
    console.log(
      "SOCKET DISCONNECTING [" + socket.id,
      "-Total players " + connectedPlayerCount + "]"
    );
    main("disconnect", socket.id)
      .catch(console.error)
      .finally(() => client.close());
  });

  // checking player intries and provide feedback
  socket.on("submitted-word", (tryWord) => {
    console.log(tryWord);
    main("find", socket.id, tryWord)
      .then(() => {})
      .catch(console.error)
      .finally(() => client.close());
  });
});
