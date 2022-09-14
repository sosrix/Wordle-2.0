//////////////

const { MongoClient } = require("mongodb");

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
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  const collection = db.collection("liveGames");

  // the following code inject into the collection liveGames
  if (action === "init") {
    const insertResult = await collection.insertMany([
      { player_token: socketID, random_word: word },
    ]);
  }
  if (action === "find") {
    const filteredDocs = await collection
      .find({ player_token: socketID })
      .toArray();
    let newData = filteredDocs[0].random_word;
    console.log(newData);

    colorsArr = [];

    tryWord.forEach((c, key) => {
      const realC = newData[key];
      if (realC === c) {
        colorsArr.push("#0f0");
      } else {
        const isExist = newData.split("").some((el) => el === c);
        if (isExist) {
          colorsArr.push("#ff0");
        } else {
          colorsArr.push("#d4d5ce");
        }
      }
    });
  }

  // done
  return "done.";
}

//////////////////////////////

const dataWords = [
  "WINER",
  "BEFOR",
  "APPLE",
  "NEVER",
  "HELLO",
  "WORLD",
  "SUPER",
  "MOVIE",
  "FAKER",
  "LOSER",
];

const io = require("socket.io")(3003, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});
io.on("connection", (socket) => {
  console.log("SOCKET CONNECTING " + socket.id);
  setRandomWordle();
  main("init", socket.id, word)
    .then(console.log)
    .catch(console.error)
    .finally(() => client.close());

  socket.on("disconnect", function () {
    console.log("SOCKET DISCONNECTING " + socket.id);
  });
  socket.on("submitted-word", (tryWord) => {
    console.log(tryWord);
    main("find", socket.id, word, tryWord)
      .then(() => io.to(socket.id).emit("treated-colors", colorsArr))
      .catch(console.error)
      .finally(() => client.close());
  });
});

function setRandomWordle() {
  const randRange = Math.floor(Math.random() * 10);
  word = dataWords[randRange];
  console.log(word, "word has been set");
}

function checkWord(tryWord) {
  colorsArr = [];

  tryWord.forEach((c, key) => {
    const realC = word[key];
    if (realC === c) {
      colorsArr.push("#0f0");
    } else {
      const isExist = word.split("").some((el) => el === c);
      if (isExist) {
        colorsArr.push("#ff0");
      } else {
        colorsArr.push("#d4d5ce");
      }
    }
  });

  return colorsArr;
}
