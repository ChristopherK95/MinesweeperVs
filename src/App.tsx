import React, { useEffect, useRef, useState } from "react";
import "./Styles/App.css";
import { Lobby } from "./Components/Lobby";
import { Game } from "./Components/Game";
import { CreateGame } from "./Components/CreateGame";
import { EventLog } from "./Components/EventLog";
import socketService from "./services/socketService";
import GameContext, {
  IGameContextProps,
  Player,
  Event,
  Tile,
} from "./GameContext";

function App() {
  const [isAdmin, setAdmin] = useState(false);
  const [isCreatingRoom, setCreatingRoom] = useState(false);
  const [isInRoom, setInRoom] = useState(false);
  const [isPlayerTurn, setPlayerTurn] = useState(false);
  const [isGameStarted, setGameStarted] = useState(false);

  const defaultPlayer: Player = {
    name: "",
    score: 0,
    id: "",
  };

  const [playerOne, setPlayerOne] = useState(defaultPlayer);
  const [playerTwo, setPlayerTwo] = useState(defaultPlayer);
  const [gameCode, setGameCode] = useState("");
  const [tileArr, setTileArr] = useState<Tile[]>([]);
  const [tileAmount, setTileAmount] = useState<number>(15);
  const [bombsSetting, setBombsSetting] = useState(50);
  const [roundTimeSetting, setRoundTimeSetting] = useState(30);
  const [roundTime, setRoundTime] = useState(30);
  const [events, setEvents] = useState<Event[]>([]);
  const [isWinner, setWinner] = useState(false);
  const [disconnected, setDisconnected] = useState(false);
  const [noHost, setNoHost] = useState(false);

  const connectSocket = async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const socket = await socketService
      .connect("https://minesweeper-versus-server.herokuapp.com/")
      .catch((err) => {
        console.log("Error: ", err);
      });
  };
  // https://minesweeper-versus-server.herokuapp.com/
  // "http://localhost:9000"
  const gameContextValue: IGameContextProps = {
    gameCode,
    setGameCode,
    playerOne,
    setPlayerOne,
    playerTwo,
    setPlayerTwo,
    tileArr,
    setTileArr,
    tileAmount,
    setTileAmount,
    bombsSetting,
    setBombsSetting,
    roundTimeSetting,
    setRoundTimeSetting,
    roundTime,
    setRoundTime,
    isAdmin,
    setAdmin,
    isCreatingRoom,
    setCreatingRoom,
    isInRoom,
    setInRoom,
    isPlayerTurn,
    setPlayerTurn,
    isGameStarted,
    setGameStarted,
    isWinner,
    setWinner,
    disconnected,
    setDisconnected,
    noHost,
    setNoHost,
  };

  useEffect(() => {
    connectSocket();
  }, []);

  const tileRef = useRef();

  return (
    <GameContext.Provider value={gameContextValue}>
      <div className="App">
        {isInRoom && (
          <div className="Container">
            <EventLog tileRef={tileRef} events={events} />{" "}
            <Game
              tileRef={tileRef}
              tileAmount={tileAmount}
              setEvents={setEvents}
            />
          </div>
        )}
        {isCreatingRoom && (
          <CreateGame
            admin={isAdmin}
            playerOne={playerOne}
            gameCode={gameCode}
          />
        )}
        {!isInRoom && !isCreatingRoom && <Lobby />}
      </div>
    </GameContext.Provider>
  );
}

export default App;
