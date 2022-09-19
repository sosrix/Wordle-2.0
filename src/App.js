import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Game from "./Game";
import Home from "./Home";
import Chat from "./playersChat";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <h1 className="glitch" data-text="WORDLE 2.0">
          WORDLE 2.0
        </h1>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
