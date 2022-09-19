import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "./clientSideSocket";
import Tip from "./tip";
import LoaderWrapper from "./loaderwrapper";

export default function Home() {
  const [room, setRoom] = useState("");
  const [loader, setLoader] = useState(false);
  const [token, setToken] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setRoom(e.target.value);
  };

  const joinGame = (e) => {
    e.preventDefault();
    if (room === "") {
      return;
    }
    console.log("sendind request to check room");
    socket.emit("check-room", room.toLowerCase());
  };

  function createGame() {
    const uid = function () {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };
    socket.emit("create-room", uid());
    setLoader("waiting-room");
  }
  useEffect(() => {
    socket.on("isExist", (value) => {
      if (value) {
        navigate("/game");
      }
    });

    socket.on("disconnect", (value) => {
      socket.connect();
    });
    socket.on("Wait-other-player", (room) => {
      console.log(room);
      setToken(room);
    });
    socket.on("found-game", (room) => {
      setLoader(false);
      console.log("recieve confirmation of room found");
      socket.emit("initialize-game", room);
    });
  }, []);

  function queueUp() {
    socket.emit("check-queue");
    setLoader("in-queue");
  }

  function exitQueue() {
    socket.disconnect();
    setLoader(false);
  }

  return (
    <>
      <LoaderWrapper>
        <LoaderWrapper.loadingAnimation />
      </LoaderWrapper>
      <div className="main">
        {loader ? (
          <div className="user-message">
            {loader === "waiting-room" ? (
              <div>
                Share with your friend
                <p className="token"> Room token : {token}</p>
              </div>
            ) : (
              <p>You are in Queue</p>
            )}
            <button className="in-game-button" onClick={exitQueue}>
              Exit Queue
            </button>
            <LoaderWrapper.loadingAnimation />
          </div>
        ) : (
          ""
        )}
        <div className="grid">
          <p className="gameMessage"> </p>

          <button className="button-53" onClick={queueUp}>
            Queue up for a game
          </button>
          <button className="button-53" onClick={createGame}>
            Create a game
          </button>
          <p>________________OR_________________ </p>

          <button className="button-53" onClick={joinGame}>
            Join an existing game
          </button>

          <input
            className="inpt-join-game"
            placeholder="ROOM TOKEN"
            type="text"
            id="room"
            name="room"
            onChange={handleChange}
            value={room.toLocaleUpperCase()}
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
