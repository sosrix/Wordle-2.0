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
let roomsMap = { roomid010101: 0 };
let wordlesMap = {};
let queueRooms = [];
let colorObj = {};
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
    word = await allWords[0][randRange].toUpperCase();

    if (roomsMap[randomRoom] === 0) {
      await collection.insertMany([
        { player_token: socketID, random_word: await word, roomID: randomRoom },
      ]);
      roomsMap[randomRoom] = 1;
      wordlesMap[randomRoom] = await word;
      console.log(roomsMap[randomRoom]);
    } else if (roomsMap[randomRoom] === 1) {
      console.log(wordlesMap);
      await collection.insertMany([
        {
          player_token: socketID,
          random_word: await wordlesMap[randomRoom],
          roomID: randomRoom,
        },
      ]);
      roomsMap[randomRoom] = 2;
    } else {
      console.log("room doesn't exist or full");
    }
  }
  if (action === "disconnect") {
    await collection.deleteMany({
      player_token: socketID,
    });
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
    if (!roomsMap[room] && roomsMap[room] !== 0) {
      roomsMap[room] = 0;
    }
    if (roomsMap[room] > 2) {
      console.log("prblm");
    }
    randomRoom = room;
    socket.emit("isExist", room);
    socket.join(room);
    console.log(roomsMap);
    console.log(socket.id);

    main("init", socket.id, word, "null", randomRoom)
      .then(console.log)
      .catch(console.error);
  });

  socket.on("check-queue", (socketID) => {
    const roomIdGen = function () {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };
    if (queueRooms.length === 2 && !queueRooms.includes(socketID)) {
      const roomQ = queueRooms[1];
      socket.join(queueRooms[1]);
      console.log(queueRooms);
      socket.to(queueRooms[0]).emit("GameFound", roomQ);

      queueRooms = [];
    } else if (queueRooms.length === 0) {
      queueRooms.push(socket.id);
      queueRooms.push(roomIdGen());
      socket.join(queueRooms[1]);
    }
  });

  socket.on("check-room", (room) => {
    if (!roomsMap[room] && roomsMap[room] !== 0) {
      console.log(`This ${room} doesn't exist, try creating one :)`);
    } else {
      socket.emit("isExist", room);
      randomRoom = room;
      socket.join(room);
      console.log("You have been added to the room", roomsMap[room]);
      main("init", socket.id, word, "null", randomRoom)
        .then(console.log)
        .catch(console.error);
    }
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
      .then(() => {
        io.to(randomRoom).emit(
          "treated-colors",
          colorObj[socket.id],
          socket.id
        );
      })
      .catch(console.error);
  });
});
