import { useContext } from "react";
import GameContext, { Player } from "../GameContext";
import "../Styles/Disconnected.css";
import gameService from "../services/gameService";

export function Disconnected({ socket, roomId }) {
  const {
    isAdmin,
    playerTwo,
    setInRoom,
    setGameStarted,
    setGameCode,
    setPlayerTurn,
    setAdmin,
    setDisconnected,
    setPlayerTwo,
    setCreatingRoom,
    setNoHost,
  } = useContext(GameContext);

  function leaveGame() {
    const player: Player = { name: "", score: 0, id: "" };
    setInRoom(false);
    setGameStarted(false);
    setGameCode("");
    setPlayerTurn(false);
    setAdmin(false);
    setDisconnected(false);
    setPlayerTwo(player);
  }

  function leaveCreateRoom() {
    console.log(roomId);
    gameService.leaveGameRoom(socket, roomId);
    setCreatingRoom(false);
    setDisconnected(false);
    setGameCode("");
    setNoHost(false);
  }

  return (
    <div>
      {isAdmin ? (
        <div className="Disconnected">
          <h2>{playerTwo.name} left</h2>
          <button onClick={leaveGame}>Leave</button>
        </div>
      ) : (
        <div className="Disconnected">
          <h2>The Host left</h2>
          <button onClick={isAdmin ? leaveGame : leaveCreateRoom}>Leave</button>
        </div>
      )}
    </div>
  );
}
