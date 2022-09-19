import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { socketID, socket } from "./clientSideSocket.js";
import LoaderWrapper from "./loaderwrapper";

export default function Game() {
  const [gameAuth, setGameAuth] = useState(true);
  const [maxLine, maxCol] = [6, 5];
  const [chars, setChars] = useState(
    new Array(maxLine).fill(null).map(() => new Array(maxCol).fill(""))
  );
  const [line, setLine] = useState(0);
  const [col, setCol] = useState(0);
  const [colors, setColors] = useState([]);
  const [gameState, setGameState] = useState(true);
  const [gameMessage, setGameMessage] = useState("Guess the word");

  ////////PLAYER 2//////////
  const [charsP2, setCharP2] = useState(
    new Array(maxLine).fill(null).map(() => new Array(maxCol).fill(""))
  );
  const [colorsP2, setColorsP2] = useState([]);
  /////////////////////////
  const navigate = useNavigate();

  useEffect(() => {
    if (!gameAuth) {
      socket.disconnect();
      navigate("/");
    }
  }, [gameAuth]);

  useEffect(() => {
    socket.emit("check-authentication", socketID);
    socket.on("authentication", (value) => {
      setGameAuth(value);
    });

    socket.on("treated-colors", (colorsArr, otherSocket) => {
      if (socketID === otherSocket) {
        setColors(colorsArr);
      } else {
        setColorsP2(colorsArr);
      }
    });

    socket.on("end-game", (wordFromDB, result) => {
      if (result === "win") {
        // That's a win
        console.log("Congrats you found the wordle :", wordFromDB);
        setGameState(false);
        setGameMessage("Congratulations you found the wordle!");
        return;
      }
      if (result === "lost") {
        console.log("Sadly you didn't find the wordle :", wordFromDB);
        setGameState(false);
        setGameMessage(`Sadly you didn't find the wordle! ${wordFromDB}`);
      }
    });
  }, []);

  const check = useCallback(() => {
    console.log("checking ...");

    if (col === maxCol && gameState) {
      const tryWord = chars[line];
      socket.emit("submitted-word", tryWord);

      if (line === maxLine - 1) {
        return;
      }
      setLine((line) => line + 1);
      setCol(0);
    }
  }, [chars, col, line, maxCol, maxLine, colors, gameState]);

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
        socket.disconnect();

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
      if (keyCode === 8 && gameState) {
        deletLastElment();
      }

      if (keyCode === 13 && gameState) {
        return check();
      }

      if (keyCode >= 65 && keyCode <= 90 && gameState) {
        return setElement(key);
      }
    },
    [setElement, deletLastElment, check, gameState]
  );

  useEffect(() => {
    document.addEventListener("keydown", keyDownListner);

    return () => {
      document.removeEventListener("keydown", keyDownListner);
    };
  }, [keyDownListner]);

  const resetGame = (e) => {
    setGameAuth(false);
    socket.disconnect();
    setChars(
      new Array(maxLine).fill(null).map(() => new Array(maxCol).fill(""))
    );
    setColors([]);
    setLine(0);
    setCol(0);
    setGameState(true);
    setGameMessage("Guess the word");
    e.target.blur();
  };

  return (
    <div className="game">
      <div className="main">
        <div className="grid">
          <p className="gameMessage">{gameMessage}</p>
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
        <div className="grid">
          <p className="gameMessage"> Your nemesis's progress </p>

          {charsP2.map((line, key) => (
            <div className="line" key={key}>
              {line.map((el, elKey) => (
                <div
                  key={elKey}
                  className="element"
                  style={{
                    backgroundColor: colorsP2[key * maxCol + elKey]
                      ? colorsP2[key * maxCol + elKey]
                      : "",
                  }}
                ></div>
              ))}
            </div>
          ))}
        </div>
      </div>
      {gameState ? (
        ""
      ) : (
        <button className="in-game-button" onClick={(e) => resetGame(e)}>
          Play again
        </button>
      )}
      {line > 0 && line < maxLine - 1 && gameState ? (
        <button className="in-game-button" onClick={(e) => resetGame(e)}>
          Give up 😔
        </button>
      ) : (
        ""
      )}
      <LoaderWrapper>
        <LoaderWrapper.loadingAnimation />
      </LoaderWrapper>
    </div>
  );
}
