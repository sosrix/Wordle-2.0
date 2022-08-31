import { useEffect, useState, useCallback } from "react";

export default function Game() {
  const [maxLine, maxCol] = [6, 5];

  const [chars, setChars] = useState(
    new Array(maxLine).fill(null).map(() => new Array(maxCol).fill(""))
  );
  const [line, setLine] = useState(0);
  const [col, setCol] = useState(0);
  const [word, setWord] = useState([]);
  const [colors, setColors] = useState([]);
  const [gameState, setGameState] = useState(true);
  const [gameMessage, setGameMessage] = useState("Guess the word");
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

  const check = useCallback(() => {
    console.log("checking ...");
    if (!dataWords.includes(chars[line].join(""))) {
      console.log("Word not found");
      return;
    }

    if (col === maxCol && gameState) {
      const tryWord = chars[line];

      tryWord.forEach((c, key) => {
        const realC = word[key];
        if (realC === c) {
          const newColors = colors;
          newColors.push("#0f0");
          setColors(newColors);
        } else {
          const isExist = word.some((el) => el === c);
          if (isExist) {
            const newColors = colors;
            newColors.push("#ff0");
            setColors(newColors);
          } else {
            const newColors = colors;
            newColors.push("#d4d5ce");
            setColors(newColors);
          }
        }
      });
      if (tryWord.join("") === word.join("")) {
        // Check for win
        setGameState(false);
        setGameMessage("Game ended, You WON!");
        return;
      }
      if (line === maxLine - 1) {
        // Check for win
        setGameState(false);
        setGameMessage("Game ended, You LOST!");

        return;
      }
      setLine((line) => line + 1);
      setCol(0);
    }
  }, [chars, col, line, maxCol, maxLine, word, colors, gameState]);

  const setElement = useCallback(
    (char) => {
      if (col >= maxCol) {
        //mssg 1
        console.log(
          "Maximum letters excided press Enter to check if the word's correct"
        );
        return;
      }

      if (line >= maxLine) {
        console.log(
          "You're out of lines, Press Play again to try one more time"
        );
        // mssg 2
        return;
      }

      const newChars = chars;
      newChars[line][col] = char.toUpperCase();
      setChars(newChars);
      setCol((col) => col + 1);
    },
    [col, line, maxCol, maxLine, chars]
  );

  const deletLastElment = useCallback(() => {
    if (col >= 0) {
      const newChars = chars;
      newChars[line][col - 1] = "";
      setChars(newChars);
      const newCol = col > 0 ? col - 1 : 0;
      setCol(newCol);
    }
  }, [chars, col, line, setChars]);

  const keyDownListner = useCallback(
    (event) => {
      const { keyCode, key } = event;
      if (keyCode === 8) {
        deletLastElment();
      }

      if (keyCode === 13) {
        return check();
      }

      if (keyCode >= 65 && keyCode <= 90) {
        return setElement(key);
      }
    },
    [setElement, deletLastElment, check]
  );
  useEffect(() => {
    const randRange = Math.floor(Math.random() * 10);

    setWord([...dataWords[randRange]]);
    console.log("word has been set");
  }, [gameState]);

  useEffect(() => {
    document.addEventListener("keydown", keyDownListner);

    return () => {
      document.removeEventListener("keydown", keyDownListner);
    };
  }, [keyDownListner]);

  const resetGame = (e) => {
    setChars(
      new Array(maxLine).fill(null).map(() => new Array(maxCol).fill(""))
    );
    setColors([]);
    setLine(0);
    setCol(0);
    setGameState(true);
    setGameMessage("Guess the word");
    e.target.blur();
    console.log("RESET");
  };

  return (
    <>
      <div className="main">
        <div className="grid">
          <p className="gameMessage"> {gameMessage} </p>

          {chars.map((line, key) => (
            <div className="line" key={key}>
              {line.map((el, elKey) => (
                <div
                  key={elKey}
                  className="element"
                  style={{
                    backgroundColor: colors[key * maxCol + elKey]
                      ? colors[key * maxCol + elKey]
                      : "",
                  }}
                >
                  {el ? <span className="letter">{el}</span> : ""}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      {gameState ? (
        ""
      ) : (
        <button onClick={(e) => resetGame(e)}>Play again</button>
      )}
      {line > 0 && line < maxLine - 1 && gameState ? (
        <button onClick={(e) => resetGame(e)}>Give up</button>
      ) : (
        ""
      )}
    </>
  );
}
