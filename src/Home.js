import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { socket, socketID } from "./clientSideSocket";
import Tip from "./tip";
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
    console.log("sendind request to check room");
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
    socket.emit("create-room", uid());
  }
  useEffect(() => {
    socket.on("Wait-other-player", (room) => {
      console.log(room);
    });
    socket.on("found-game", (room) => {
      console.log("recieve confirmation of room found");
      socket.emit("initialize-game", room);
    });

    socket.on("GameFound", (roomQueuedID) => {});
  }, []);

  function queueUp() {
    socket.emit("check-queue");
  }

  return (
    <>
      <div className="main">
        <div className="grid">
          <p className="gameMessage"> Hello there! </p>

          <button className="button-53" role="button" onClick={queueUp}>
            Queue up for a game
          </button>
          <button className="button-53" role="button" onClick={createGame}>
            Create a game
          </button>
          <p>________________OR_________________ </p>

          <button className="button-53" role="button" onClick={joinGame}>
            Join an existing game
          </button>

          <input
            className="inpt-join-game"
            placeholder="ROOM TOKEN"
            type="text"
            id="room"
            name="room"
            onChange={handleChange}
            value={room}
            autoComplete="off"
          />
        </div>
      </div>
      <div className="tips-container">
        <Tip bgColor="#5e3c55" theTip="WhatIsWordle" id="tip1" />
        <Tip bgColor="#1d3b55" theTip="Rules" id="tip2" />
        <Tip bgColor="#6e5c55" theTip="extraRules" id="tip3" />
      </div>
    </>
  );
}
