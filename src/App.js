import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Game from "./Game";
import Home from "./Home";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <h1 className="title">WORDLE 2.0</h1>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
