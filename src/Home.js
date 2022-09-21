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

  function queueUp() {
    socket.emit("check-queue");
    setLoader("in-queue");
  }

  function exitQueue() {
    socket.disconnect();
    setLoader(false);
  }

  const joinGame = (e) => {
    e.preventDefault();
    if (room === "") {
      return;
    }
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

  return (
    <>
      <LoaderWrapper>
        <LoaderWrapper.loadingAnimation />
      </LoaderWrapper>

      <div className="home">
        <div>
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
              <button onClick={exitQueue}>
                <span>Exit Queue</span>
                <i></i>
              </button>
              <LoaderWrapper.loadingAnimation />
            </div>
          ) : (
            ""
          )}
          <div className="grid">
            <p className="gameMessage">Start playing!</p>
            <button onClick={queueUp}>
              <span> Queue up</span>
              <i></i>
            </button>

            <button onClick={createGame}>
              <span> Create a game</span>
              <i></i>
            </button>

            <p className="seperater"></p>
            <button onClick={joinGame}>
              <span> Join a game</span>
              <i></i>
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
      </div>
      <div className="tips-container">
        <Tip bgColor="#6e5c5511" theTip="WhatIsWordle" id="tip1" />
        <Tip bgColor="#6e5c5511" theTip="Rules" id="tip2" />
        <Tip bgColor="#6e5c5511" theTip="extraRules" id="tip3" />
      </div>
    </>
  );
}
