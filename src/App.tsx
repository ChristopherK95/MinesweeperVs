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
  const defaultPlayer: Player = {
    name: "",
    score: 0,
    id: "",
  };
  // GameContext states.
  const [gameCode, setGameCode] = useState("");
  const [playerOne, setPlayerOne] = useState(defaultPlayer);
  const [playerTwo, setPlayerTwo] = useState(defaultPlayer);
  const [tileArr, setTileArr] = useState<Tile[]>([]);
  const [tileAmount, setTileAmount] = useState<number>(12);
  const [bombsSetting, setBombsSetting] = useState(50);
  const [roundTimeSetting, setRoundTimeSetting] = useState(30);
  const [roundTime, setRoundTime] = useState(30);
  const [isAdmin, setAdmin] = useState(false);
  const [isCreatingRoom, setCreatingRoom] = useState(false);
  const [isInRoom, setInRoom] = useState(false);
  const [isPlayerTurn, setPlayerTurn] = useState(false);
  const [isGameStarted, setGameStarted] = useState(false);
  const [isWinner, setWinner] = useState(false);
  const [disconnected, setDisconnected] = useState(false);
  const [noHost, setNoHost] = useState(false);

  const [events, setEvents] = useState<Event[]>([]);
  const connectSocket = async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const socket = await socketService
      // .connect("http://localhost:9000")
      .connect("https://minesweeper-versus-server.herokuapp.com/")
      .catch((err) => {
        console.log("Error: ", err);
      });
  };
  const gameContextValue: IGameContextProps = {
    gameCode,
    playerOne,
    playerTwo,
    tileArr,
    tileAmount,
    bombsSetting,
    roundTimeSetting,
    roundTime,
    isAdmin,
    isCreatingRoom,
    isInRoom,
    isPlayerTurn,
    isGameStarted,
    isWinner,
    disconnected,
    noHost,
    setGameCode,
    setPlayerOne,
    setPlayerTwo,
    setTileArr,
    setTileAmount,
    setBombsSetting,
    setRoundTimeSetting,
    setRoundTime,
    setAdmin,
    setCreatingRoom,
    setInRoom,
    setPlayerTurn,
    setGameStarted,
    setWinner,
    setDisconnected,
    setNoHost,
  };

  useEffect(() => {
    connectSocket();
  }, []);

  const tileRef = useRef();

  return (
    <GameContext.Provider value={gameContextValue}>
      <div className="App">
        <div id="Title">
          <h1>
            Minesweeper <br /> <span>Vs</span>
          </h1>
        </div>
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
