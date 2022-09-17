//////////////

const { MongoClient, ObjectId } = require("mongodb");

// Connection URL
const url = "mongodb://0.0.0.0:27017";
const client = new MongoClient(url);

// Database Name
const dbName = "wordleProject";
let word = "";
let randomRoom = "";
let playersCount = 0;
let roomsMap = {};
let wordlesMap = {};
let colorObj = {};
let livePlayers = {};
let queueRooms = [];

async function main(action, socketID, word, tryWord, randomRoom) {
  // Use connect method to connect to the server
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
      // const currentPlayer = livePlayers[randomRoom].indexOf(socketID);
      // livePlayers[randomRoom][currentPlayer] = "passed";
      await collection.insertMany([
        {
          player_token: socketID,
          random_word: await wordlesMap[randomRoom],
          roomID: randomRoom,
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
        },
      ]);
      livePlayers[socketID] = randomRoom;
      console.log("player 2 ready");
    }
  }
  if (action === "disconnect") {
    if (colorObj[socketID]) {
      delete colorObj[socketID];
      delete livePlayers[socketID];
      delete livePlayers[randomRoom];
      delete wordlesMap[randomRoom];
    }
  }

  if (action === "find") {
    if (!colorObj[socketID]) {
      colorObj[socketID] = [];
    }
    const filteredDocs = await collection
      .find({ player_token: socketID })
      .toArray();
    let wordFromDB = filteredDocs[0].random_word;
    console.log(wordFromDB);

    tryWord.forEach((c, key) => {
      const realC = wordFromDB[key];
      if (realC === c) {
        colorObj[socketID].push("#0f0");
      } else {
        const isExist = wordFromDB.split("").some((el) => el === c);
        if (isExist) {
          colorObj[socketID].push("#ff0");
        } else {
          colorObj[socketID].push("#d4d5ce");
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
      io.to(socketID).emit("end-game-win", wordFromDB);
    }
  }

  // done
  return "done.";
}
//////////////////////////////

const io = require("socket.io")(3003, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});
io.on("connection", (socket) => {
  playersCount++;
  console.log(
    "SOCKET CONNECTING " + socket.id,
    "-Total players [" + playersCount + "]"
  );

  socket.on("create-room", (room) => {
    if (!livePlayers[room]) {
      livePlayers[room] = [];
    }
    if (livePlayers[room].includes(socket.id)) {
      console.log("player EXIST");
    } else {
      livePlayers[room].push(socket.id);
      console.log("player Added");
      socket.join(room);
      socket.emit("Wait-other-player", room);
    }
  });

  socket.on("check-queue", () => {
    const roomIdGen = function () {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };
    const room = roomIdGen();
    if (!livePlayers[room]) {
      livePlayers[room] = [];
    }

    if (
      queueRooms.length === 1 &&
      !livePlayers[queueRooms[0]].includes(socket.id)
    ) {
      socket.join(queueRooms[0]);
      livePlayers[queueRooms[0]].push(socket.id);
      io.in(queueRooms[0]).emit("found-game", queueRooms[0]);
      queueRooms.pop();
    }
    if (livePlayers[socket.id]) {
      return;
    } else {
      queueRooms.push(room);
      socket.join(queueRooms[0]);
      livePlayers[queueRooms[0]].push(socket.id);
      livePlayers[socket.id] = true;
      socket.emit("Wait-other-player", room);
    }
    console.log(queueRooms);
  });

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

  socket.on("initialize-game", (room) => {
    main("init", socket.id, word, "null", room)
      .then(console.log)
      .catch(console.error)
      .finally(() => client.close());

    socket.emit("isExist", room);
  });

  socket.on("disconnect", function () {
    if (roomsMap[randomRoom] > 0) {
      roomsMap[randomRoom]--;
    }
    playersCount--;
    console.log(
      "SOCKET DISCONNECTING [" + socket.id,
      "-Total players " + playersCount + "]"
    );
    main("disconnect", socket.id, word)
      .catch(console.error)
      .finally(() => client.close());
  });
  socket.on("submitted-word", (tryWord) => {
    console.log(tryWord);
    main("find", socket.id, word, tryWord)
      .then(() => {})
      .catch(console.error);
  });
});

setInterval(function () {
  console.log(livePlayers);
}, 7000);
