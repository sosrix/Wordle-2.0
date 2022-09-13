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
let word = "";
let colorsArr = [];

const io = require("socket.io")(3003, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});
io.on("connection", (socket) => {
  console.log("SOCKET CONNECTING " + socket.id);
  setRandomWordle();

  socket.on("disconnect", function () {
    console.log("SOCKET DISCONNECTING " + socket.id);
  });
  socket.on("submitted-word", (tryWord) => {
    console.log(tryWord);
    checkWord(tryWord);
    io.to(socket.id).emit("treated-colors", colorsArr);
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
