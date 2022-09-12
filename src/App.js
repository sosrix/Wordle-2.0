import "./App.css";
import Game from "./Game";
import { io } from "socket.io-client";

function App() {
  const socket = io("http://localhost:3003");
  socket.on("connect", () =>
    console.log(`Connected with the id : ${socket.id}`)
  );

  return (
    <div className="App">
      <h1>Let's play wordle 2.0</h1>
      <Game />
    </div>
  );
}

export default App;
