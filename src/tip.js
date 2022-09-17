import { useEffect } from "react";

export default function Tip({ bgColor, theTip, id }) {
  let tipBtn = "";
  const obj = {
    WhatIsWordle:
      "Wordle is a daily word game where players have six attempts to guess a five letter word. Feedback for each guess is given in the form of colored  tiles to indicate if letters match the correct position.",
    Rules:
      "Colors : A correct letter turns green and A correct letter in the wrong place turns yellow also An incorrect letter turns gray with Letters can be used more than once but Answers are never plurals",
    extraRules:
      "You can join the Queue and play against a stranger live, or Create a game and play against a friend - Or joing an already existing game created by your Ex-friend who's your NEMESIS now ",
  };
  useEffect(() => {
    tipBtn = document.getElementById(id);
  }, []);
  function closeTip() {
    console.log("click");
    if (tipBtn) {
      tipBtn.style.display = "none";
    }
  }
  return (
    <div className="info" style={{ backgroundColor: bgColor }} id={id}>
      <span className="closebtn" onClick={closeTip}>
        &times;
      </span>
      {obj[theTip]}
    </div>
  );
}
