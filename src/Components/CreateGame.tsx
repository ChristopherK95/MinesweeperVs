import Repeatable from "react-repeatable";
import { useContext, useEffect, useState } from "react";
import "../Styles/CreateGame.css";
import GameContext, { Player } from "../GameContext";
import socketService from "../services/socketService";
import gameService from "../services/gameService";
import { ReactComponent as Arrow } from "../SVG/Arrow.svg";
import { ReactComponent as Crown } from "../SVG/Crown.svg";
import { Disconnected } from "./Disconnected";

export function CreateGame({ admin, playerOne, gameCode }) {
  const [copied, setCopied] = useState<boolean>(false);
  const [tooManyBombs, setTooManyBombs] = useState<boolean>(false);
  const {
    setPlayerTwo,
    playerTwo,
    setGameStarted,
    setPlayerTurn,
    setInRoom,
    setCreatingRoom,
    setTileAmount,
    tileAmount,
    setBombsSetting,
    bombsSetting,
    setRoundTimeSetting,
    roundTimeSetting,
    setDisconnected,
    disconnected,
    isInRoom,
    setNoHost,
    noHost,
  } = useContext(GameContext);
  const socket = socketService.socket;

  function awaitPlayerTwo() {
    if (socket) {
      gameService.onPlayerJoined(socket, (player) => {
        setPlayerTwo(player);
      });
    }
  }

  function handleTileAmountSetting() {
    if (socket) {
      gameService.onTileAmountUpdate(socket, (tileAmount) => {
        setTileAmount(tileAmount);
      });
    }
  }

  function handleBombsSetting() {
    if (socket) {
      gameService.onBombsSettingUpdate(socket, (totalBombs) => {
        setBombsSetting(totalBombs);
      });
    }
  }

  function handleRoundTimeSetting() {
    if (socket) {
      gameService.onRoundTimeSettingUpdate(socket, (roundTime) => {
        setRoundTimeSetting(roundTime);
      });
    }
  }

  function handleGameStart() {
    if (socket) {
      gameService.onStartGame(socket, (data) => {
        setGameStarted(true);
        if (data.turn === socket.id) {
          setPlayerTurn(true);
        } else {
          setPlayerTurn(false);
        }
        setBombsSetting(data.totalBombs);
        setRoundTimeSetting(data.roundTime);
        setInRoom(true);
        setCreatingRoom(false);
      });
    }
  }

  function handleDisconnected() {
    if (socket) {
      gameService.onDisconnected(socket, () => {
        setDisconnected(true);
      });
    }
  }

  useEffect(() => {
    if (!isInRoom && disconnected) {
      const player: Player = { ...playerTwo, name: "" };
      setPlayerTwo(player);

      if (!admin) {
        setNoHost(true);
      }
    }
  }, [disconnected]);

  function onStartClick() {
    if (!socket) return;
    gameService.startGame(socket, bombsSetting, roundTimeSetting);
  }

  function onTilesChange(val: number) {
    if ((val === -1 && tileAmount === 9) || (val === 1 && tileAmount === 16)) {
      return;
    }
    const tiles = tileAmount + val;
    setTileAmount(tiles);
    if (socket) {
      gameService.updateTileAmount(socket, tiles, gameCode);
    }
  }

  function onBombsChange(val: number) {
    if (
      (val === -1 && bombsSetting === 15) ||
      (val === 1 && bombsSetting === 150)
    )
      return;
    const bombs = bombsSetting + val;
    setBombsSetting(bombs);
    if (socket) {
      gameService.updateBombsSetting(socket, bombsSetting + val, gameCode);
    }
  }

  function onRoundTimeChange(val: number) {
    if (
      (val === -10 && roundTimeSetting === 30) ||
      (val === 10 && roundTimeSetting === 180)
    )
      return;
    const time = roundTimeSetting + val;
    setRoundTimeSetting(time);
    if (socket) {
      gameService.updateRoundTimeSetting(socket, time, gameCode);
    }
  }

  function calcBombTileRatio() {
    if (bombsSetting / (tileAmount * tileAmount) >= 0.7) {
      setTooManyBombs(true);
    } else {
      setTooManyBombs(false);
    }
  }

  function copyCode() {
    if (!gameCode) return;
    navigator.clipboard.writeText(gameCode);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  useEffect(() => {
    calcBombTileRatio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bombsSetting, tileAmount]);

  useEffect(() => {
    handleDisconnected();
    if (!admin) return;
    awaitPlayerTwo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    handleGameStart();
    handleTileAmountSetting();
    handleBombsSetting();
    handleRoundTimeSetting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="Create-game">
      {noHost && <Disconnected socket={socket} roomId={gameCode} />}
      <div className="Top-bar">
        <h2>Creating game</h2>
      </div>
      <div className="Body">
        {admin && (
          <div className="Code">
            <h2 className="Title">Game code</h2>
            <h3 onClick={copyCode} className={`${copied && "clicked"}`}>
              {copied ? "Copied" : gameCode}
            </h3>
          </div>
        )}
        <div className="Settings">
          <h2 className="Title">Settings</h2>
          <div className="Setting">
            <h3>Amount of tiles</h3>
            <div className="Counter">
              <input type="text" readOnly={true} value={tileAmount} />
              {admin && (
                <div className="Buttons">
                  <Repeatable
                    className="button"
                    onClick={() => onTilesChange(1)}
                    onHold={() => onTilesChange(1)}
                    repeatInterval={50}
                    repeatDelay={200}
                  >
                    <Arrow />
                  </Repeatable>
                  <Repeatable
                    className="button"
                    onClick={() => onTilesChange(-1)}
                    onHold={() => onTilesChange(-1)}
                    repeatInterval={50}
                    repeatDelay={200}
                  >
                    <Arrow />
                  </Repeatable>
                </div>
              )}
            </div>
            <p>(default: 50 bombs out of 225 tiles)</p>
          </div>
          <div className="Setting">
            <h3>Amount of bombs</h3>
            <div className="Counter">
              <input type="text" readOnly={true} value={bombsSetting} />
              {admin && (
                <div className="Buttons">
                  <Repeatable
                    className="button"
                    onClick={() => onBombsChange(1)}
                    onHold={() => onBombsChange(1)}
                    repeatInterval={50}
                    repeatDelay={200}
                  >
                    <Arrow />
                  </Repeatable>
                  <Repeatable
                    className="button"
                    onClick={() => onBombsChange(-1)}
                    onHold={() => onBombsChange(-1)}
                    repeatInterval={50}
                    repeatDelay={200}
                  >
                    <Arrow />
                  </Repeatable>
                </div>
              )}
            </div>
            <p>(default: 50 bombs out of 225 tiles)</p>
          </div>
          <div className="Setting">
            <h3>Time per round</h3>
            <div className="Counter">
              <input
                type="text"
                readOnly={true}
                value={`${roundTimeSetting}s`}
              />
              {admin && (
                <div className="Buttons">
                  <Repeatable
                    className="button"
                    onClick={() => onRoundTimeChange(10)}
                    onHold={() => onRoundTimeChange(10)}
                    repeatInterval={50}
                    repeatDelay={200}
                  >
                    <Arrow />
                  </Repeatable>
                  <Repeatable
                    className="button"
                    onClick={() => onRoundTimeChange(-10)}
                    onHold={() => onRoundTimeChange(-10)}
                    repeatInterval={50}
                    repeatDelay={200}
                  >
                    <Arrow />
                  </Repeatable>
                </div>
              )}
            </div>
            <p>(Default: 30 seconds)</p>
          </div>
        </div>
        <div className="Players">
          <h2 className="Title">Players</h2>
          <div className="Player">
            <h2>
              {playerOne.name} <span>(you)</span>
            </h2>
            {admin && (
              <i>
                <Crown />
              </i>
            )}
          </div>
          {playerTwo!.name !== "" && (
            <div className="Player">
              <h2>{playerTwo!.name}</h2>
              {!admin && (
                <i>
                  <Crown />
                </i>
              )}
            </div>
          )}
        </div>
      </div>
      {admin && (
        <div className="Bottom-bar">
          {tooManyBombs && (
            <p className="ErrorText">Too many bombs per tile!</p>
          )}
          <button
            onClick={onStartClick}
            disabled={playerTwo?.name === "" || tooManyBombs}
          >
            Start
          </button>
        </div>
      )}
    </div>
  );
}
