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

  const check = useCallback(() => {
    console.log("check");
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
        endTheGame("won");
        return;
      }
      setLine((line) => line + 1);
      setCol(0);
    }
  }, [chars, col, line, maxCol, maxLine, word, colors]);

  function endTheGame(winOrLose) {
    if (winOrLose === "won") {
      console.log("Game ended, You won");
    } else if (winOrLose === "lost") {
      console.log("Game ended, You lost");
    }
  }

  const setElement = useCallback(
    (char) => {
      if (col >= maxCol) {
        //mssg 1
        console.log("mssg 1");
        return;
      }
      if (line >= maxLine) {
        console.log("mssg 2");
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
    const dataWords = [
      "WINER",
      "BEFORE",
      "APPLE",
      "NEVER",
      "HELLO",
      "WORLD",
      "SUPER",
      "MOVIE",
      "FAKER",
      "LOSER",
    ];
    setWord([...dataWords[5]]);
    console.log("word has been set");
  }, []);

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
    e.target.blur();
    console.log("RESET");
  };

  return (
    <>
      <div className="main">
        <div className="grid">
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
                  {el}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <button onClick={(e) => resetGame(e)}>Play again</button>
    </>
  );
}
