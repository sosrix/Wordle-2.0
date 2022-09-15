//////////////

const { MongoClient, ObjectId } = require("mongodb");

// Connection URL
const url = "mongodb://0.0.0.0:27017";
const client = new MongoClient(url);

// Database Name
const dbName = "wordleProject";
let word = "";
let colorsArr = [];
async function main(action, socketID, word, tryWord) {
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

    await collection.insertMany([
      { player_token: socketID, random_word: await word },
    ]);
  }
  if (action === "disconnect") {
    await collection.deleteMany({
      player_token: socketID,
    });
  }

  if (action === "find") {
    const filteredDocs = await collection
      .find({ player_token: socketID })
      .toArray();
    let wordFromDB = filteredDocs[0].random_word;
    console.log(wordFromDB);

    colorsArr = [];

    tryWord.forEach((c, key) => {
      const realC = wordFromDB[key];
      if (realC === c) {
        colorsArr.push("#0f0");
      } else {
        const isExist = wordFromDB.split("").some((el) => el === c);
        if (isExist) {
          colorsArr.push("#ff0");
        } else {
          colorsArr.push("#d4d5ce");
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
  console.log("SOCKET CONNECTING " + socket.id);
  main("init", socket.id, word)
    .then(console.log)
    .catch(console.error)
    .finally(() => client.close());

  socket.on("disconnect", function () {
    console.log("SOCKET DISCONNECTING " + socket.id);
    main("disconnect", socket.id, word)
      .catch(console.error)
      .finally(() => client.close());
  });
  socket.on("submitted-word", (tryWord) => {
    console.log(tryWord);
    main("find", socket.id, word, tryWord)
      .then(() => {
        io.to(socket.id).emit("treated-colors", colorsArr);
      })
      .catch(console.error)
      .finally(() => client.close());
  });

  setInterval(function () {
    io.to(socket.id).emit("treated-colors-secondplayer", []);
  }, 3000);
});
