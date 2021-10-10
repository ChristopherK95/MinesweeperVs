import React, { useContext, useEffect, useState } from "react";
import GameContext from "../GameContext";
import gameService from "../services/gameService";
import socketService from "../services/socketService";
import { ReactComponent as Player } from "../SVG/PlayerSVG.svg";
import "../Styles/GameOver.css";

export function GameOver({ restart }) {
  const { isWinner } = useContext(GameContext);
  const [waitingText, setWaitingText] = useState<string | number>(
    "Waiting for other player"
  );
  const [isReady, setReady] = useState<boolean>(false);
  const [readyPlayers, setReadyPlayers] = useState<{
    playerOne: boolean;
    playerTwo: boolean;
  }>({ playerOne: false, playerTwo: false });

  function ready() {
    const socket = socketService.socket;
    if (!socket) return;
    setReady(true);
    setReadyPlayers((readyPlayers) => ({ ...readyPlayers, playerOne: true }));
    gameService.ready(socket);
  }

  function handleReadyPlayers() {
    const socket = socketService.socket;
    if (!socket) return;
    gameService.onReady(socket, () => {
      setReadyPlayers((readyPlayers) => ({ ...readyPlayers, playerTwo: true }));
      setWaitingText(3);
    });
  }

  function newGame() {
    restart();
  }

  useEffect(() => {
    handleReadyPlayers();
  }, []);

  useEffect(() => {
    if (isReady) {
      const interval = setInterval(() => {
        if (
          readyPlayers.playerOne &&
          readyPlayers.playerTwo &&
          typeof waitingText == "number" &&
          waitingText !== 0
        ) {
          setWaitingText(waitingText - 1);
        } else if (waitingText === 0) {
          newGame();
          clearInterval(interval);
        } else {
          if (
            typeof waitingText === "string" &&
            waitingText[waitingText.length - 3] === "."
          ) {
            setWaitingText("Waiting for other player");
          } else {
            setWaitingText(waitingText + ".");
          }
        }
      }, 500);
      return () => clearInterval(interval);
    }
  });

  return (
    <div className="GameOver">
      <h1 className="Title">{isWinner ? "You Won!" : "You Lost!"}</h1>
      {!isReady && <h2>Play Again?</h2>}
      {isReady ? (
        <div className="WaitingDiv">
          <h2>{waitingText}</h2>
          <div>
            <i className={`${readyPlayers.playerOne ? "Ready" : "NotReady"}`}>
              <Player />
            </i>
            <i className={`${readyPlayers.playerTwo ? "Ready" : "NotReady"}`}>
              <Player />
            </i>
          </div>
        </div>
      ) : (
        <button onClick={ready}>New Game</button>
      )}
    </div>
  );
}
