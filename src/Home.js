import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { socket } from "./clientSideSocket";

export default function Home() {
  const [room, setRoom] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setRoom(e.target.value);

    console.log("value of room input:", e.target.value);
  };

  const joinGame = (e) => {
    e.preventDefault();
    if (room === "") {
      return;
    }
    socket.connect();
    socket.emit("check-room", room);
  };
  useEffect(() => {
    socket.on("isExist", (value) => {
      if (value) {
        navigate("/game", { state: { value } });
      }
    });
  }, []);

  function createGame() {
    const uid = function () {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };

    socket.connect();
    socket.emit("create-room", uid());
  }

  return (
    <>
      <div className="main">
        <div className="grid">
          <p className="gameMessage"> Hello there! </p>
          <button onClick={() => createGame()}>Create a game </button>
          <Link to="/game">to game</Link>
          <button onClick={joinGame}>Join a game</button>

          <input
            type="text"
            id="room"
            name="room"
            onChange={handleChange}
            value={room}
            autoComplete="off"
          />
        </div>
      </div>
    </>
  );
}

// <button>Queue up for a game</button>
