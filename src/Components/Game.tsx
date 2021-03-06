/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from "react";
import useSound from "use-sound";
import gameService from "../services/gameService";
import socketService from "../services/socketService";
import gameContext, { Player, Event, Tile } from "../GameContext";
import { GameOver } from "./GameOver";
import { Disconnected } from "./Disconnected";
import { Timer } from "./Timer";
import "../Styles/Game.css";
import newTurn from "../Audio/NewTurn.mp3";
import disconnect from "../Audio/Disconnect.mp3";
import click from "../Audio/Click.mp3";

export function Game({ tileRef, tileAmount, setEvents }) {
  // GameContext states.
  const {
    isAdmin,
    setPlayerTurn,
    isPlayerTurn,
    setPlayerOne,
    playerOne,
    setPlayerTwo,
    playerTwo,
    bombsSetting,
    roundTimeSetting,
    setRoundTimeSetting,
    tileArr,
    setTileArr,
    setWinner,
    isWinner,
    disconnected,
  } = useContext(gameContext);

  // Game states.
  const [gameIsPrepped, setGamePrepped] = useState(false);
  const [flags, setFlags] = useState<Boolean[]>(defaultFlags);
  const [roundTime, setRoundTime] = useState(roundTimeSetting);
  const [bombs, setBombs] = useState(bombsSetting);
  const [stop, setStop] = useState<boolean>(false);

  // Const variables.
  const max = tileAmount - 1;
  const socket = socketService.socket;

  // Sound effects.
  const [newTurnFx] = useSound(newTurn);
  const [disconnectFx] = useSound(disconnect);
  const [clickFx] = useSound(click);

  /////////////////////////////////////////
  ///////////// EVENTHANDLERS /////////////
  /////////////////////////////////////////

  function handleGameUpdate() {
    if (socket) {
      gameService.onGameUpdate(socket, (data) => {
        const updatedPlayer: Player = { ...playerTwo, score: data.score };
        setPlayerTwo(updatedPlayer);
        setEvents((events: Event[]) => [data.event, ...events]);
        setTileArr(data.arr);
        setPlayerTurn(true);
        if (isAdmin) {
          setRoundTime(roundTimeSetting);
        }
      });
    }
  }

  function handleTimeUpdate() {
    if (socket) {
      gameService.onTimeUpdate(socket, (data) => {
        setRoundTime(data);
      });
    }
  }

  function handleTimeExpiration() {
    if (socket) {
      gameService.onOutOfTime(socket, (turn) => {
        if (turn) {
          setPlayerTurn(false);
          timeExpired(1);
        } else {
          setPlayerTurn(true);
          timeExpired(2);
        }
        setRoundTime(roundTimeSetting);
      });
    }
  }

  function handleGameOver() {
    if (socket) {
      gameService.onGameOver(socket, (message) => {
        setEvents((events: Event[]) => [message.event, ...events]);
        setTileArr(message.arr);
        console.log("P2:", message.players.playerOne);
        console.log("P1:", message.players.playerTwo);
        setPlayerTwo(message.players.playerOne);
        setPlayerOne(message.players.playerTwo);
        setTimeout(() => {
          gameOver(message.players);
        }, 1000);
      });
    }
  }

  function handleInitateGame() {
    if (socket) {
      gameService.onInitiate(socket, (message) => {
        console.log("prepped");
        setEvents((events: Event[]) => [message.event, ...events]);
        setTileArr(message.tileArr);
        const updatedPlayer: Player = { ...playerTwo, score: message.score };
        setPlayerTwo(updatedPlayer);
        setPlayerTurn(true);
        setGamePrepped(true);
        if (isAdmin) {
          setRoundTime(roundTimeSetting);
        }
      });
    }
  }

  /////////////////////////////////////////
  //////////// EVENT TRIGGERS /////////////
  /////////////////////////////////////////

  function tileClick(id: number) {
    if (!gameIsPrepped && isPlayerTurn) {
      prepGame(id);
      setPlayerTurn(false);
      setRoundTime(roundTimeSetting);
      clickFx();
      return;
    }
    if (!isPlayerTurn) return;
    if (!socket || tileArr[id].clicked) return;
    clickFx();
    let score: number = tileArr[id].mine
      ? -5
      : tileArr[id].count === 0
      ? 3
      : tileArr[id].count;
    let event: Event = {
      user: playerOne.name,
      info: {
        position: { x: tileArr[id].position.x, y: tileArr[id].position.y },
        score: score,
      },
    };
    setEvents((events: Event[]) => [event, ...events]);
    score += playerOne.score;
    let updatedPlayer: Player = playerOne;
    updatedPlayer.score = score;
    setPlayerOne(updatedPlayer);
    let arr = [...tileArr];
    arr[id].clicked = true;
    if (flags[id]) {
      let arr = [...flags];
      arr[id] = false;
      let bombsAmount = bombs;
      bombsAmount++;
      setFlags(arr);
      setBombs(bombsAmount);
    }
    const tiles: number = countTiles(arr);
    if (tiles <= 0) {
      gameService.gameOver(socket, arr, score, event, { playerOne, playerTwo });
      setTileArr(arr);
      gameOver(null);
      return;
    }
    if (tileArr[id].count === 0 && tileArr[id].mine === false) {
      arr = checkNearbyEmpty(id, arr);
    }
    setTileArr(arr);
    gameService.tileClick(socket, arr, score, event);
    setPlayerTurn(false);
    setRoundTime(roundTimeSetting);
  }

  // Puts a flag on the tile when right clicked.
  function flagTile(e: React.MouseEvent, id: number) {
    e.preventDefault();
    if (tileArr[id].clicked) return;
    let arr = [...flags];
    arr[id] = !arr[id];
    let bombsAmount = bombs;
    arr[id] ? bombsAmount-- : bombsAmount++;
    setFlags(arr);
    setBombs(bombsAmount);
  }

  /////////////////////////////////////////
  //////////////// METHODS ////////////////
  /////////////////////////////////////////

  async function prepGame(id: number) {
    if (!socket) return;
    const message = await gameService.prepareGame(
      socket,
      bombs,
      tileAmount,
      id,
      tileArr
    );
    setEvents((events: Event[]) => [message.event, ...events]);
    setTileArr(message.tileArr);
    const updatedPlayer: Player = { ...playerOne, score: message.score };
    setPlayerOne(updatedPlayer);
    setRoundTimeSetting(roundTime);
    setGamePrepped(true);
  }

  function timeExpired(player: number) {
    const event: Event = {
      user: player === 1 ? playerOne.name : playerTwo.name,
      text: "Ran out of time",
    };
    setEvents((events: Event[]) => [event, ...events]);
  }

  function gameOver(players: { playerOne: Player; playerTwo: Player } | null) {
    if (players === null) {
      setTimeout(() => {}, 700);
      if (playerOne.score > playerTwo.score) {
        setWinner(true);
      }
      setStop(true);
    } else {
      setTimeout(() => {}, 700);
      if (players.playerTwo.score > players.playerOne.score) {
        setWinner(true);
      }
      setStop(true);
    }
  }

  async function restartGame() {
    if (socket) {
      const player1 = { ...playerOne, score: 0 };
      const player2 = { ...playerTwo, score: 0 };
      setPlayerOne(player1);
      setPlayerTwo(player2);
      setBombs(bombsSetting);
      setFlags(defaultFlags);
      const arr: Tile[] = tileArr;
      for (let i = 0; i < tileArr.length; i++) {
        arr[i].clicked = false;
      }
      setTileArr(arr);
      setGamePrepped(false);
      setPlayerTurn(isWinner);
      setWinner(false);
      setEvents([]);
      setStop(false);
      setRoundTime(roundTimeSetting);
    }
  }

  function defaultFlags() {
    let arr: Boolean[] = [];
    arr.length = tileAmount * tileAmount;
    for (let i = 0; i < arr.length; i++) {
      arr[i] = false;
    }
    return arr;
  }

  function countTiles(arr: Tile[]) {
    let count = 0;
    for (let i = 0; i < arr.length; i++) {
      if (!arr[i].clicked && !arr[i].mine) {
        count++;
      }
    }
    return count;
  }

  function checkNearbyEmpty(id: number, arr: Tile[]) {
    // Checks left tile.
    if (
      arr[id - 1] &&
      arr[id].position.x !== 0 &&
      arr[id - 1].mine === false &&
      arr[id - 1].clicked === false
    ) {
      arr[id - 1].clicked = true;
      if (arr[id - 1].count === 0) checkNearbyEmpty(id - 1, arr);
    }
    // Checks right tile.
    if (
      arr[id + 1] &&
      arr[id].position.x !== max &&
      arr[id + 1].mine === false &&
      arr[id + 1].clicked === false
    ) {
      arr[id + 1].clicked = true;
      if (arr[id + 1].count === 0) checkNearbyEmpty(id + 1, arr);
    }
    // Checks tile above.
    if (
      arr[id - tileAmount] &&
      arr[id].position.y !== 0 &&
      arr[id - tileAmount].mine === false &&
      arr[id - tileAmount].clicked === false
    ) {
      arr[id - tileAmount].clicked = true;
      if (arr[id - tileAmount].count === 0)
        checkNearbyEmpty(id - tileAmount, arr);
    }
    // Checks tile below.
    if (
      arr[id + tileAmount] &&
      arr[id].position.y !== max &&
      arr[id + tileAmount].mine === false &&
      arr[id + tileAmount].clicked === false
    ) {
      arr[id + tileAmount].clicked = true;
      if (arr[id + tileAmount].count === 0)
        checkNearbyEmpty(id + tileAmount, arr);
    }
    // Checks upper left tile.
    if (
      arr[id - tileAmount - 1] &&
      arr[id].position.y !== 0 &&
      arr[id].position.x !== 0 &&
      arr[id - tileAmount - 1].mine === false &&
      arr[id - tileAmount - 1].clicked === false
    ) {
      arr[id - tileAmount - 1].clicked = true;
      if (arr[id - tileAmount - 1].count === 0)
        checkNearbyEmpty(id - tileAmount - 1, arr);
    }
    // Checks upper right tile.
    if (
      arr[id - tileAmount + 1] &&
      arr[id].position.y !== 0 &&
      arr[id].position.x !== max &&
      arr[id - tileAmount + 1].mine === false &&
      arr[id - tileAmount + 1].clicked === false
    ) {
      arr[id - tileAmount + 1].clicked = true;
      if (arr[id - tileAmount + 1].count === 0)
        checkNearbyEmpty(id - tileAmount + 1, arr);
    }
    // Checks lower left tile.
    if (
      arr[id + tileAmount - 1] &&
      arr[id].position.y !== max &&
      arr[id].position.x !== 0 &&
      arr[id + tileAmount - 1].mine === false &&
      arr[id + tileAmount - 1].clicked === false
    ) {
      arr[id + tileAmount - 1].clicked = true;
      if (arr[id + tileAmount - 1].count === 0)
        checkNearbyEmpty(id + tileAmount - 1, arr);
    }
    // Checks lower right tile.
    if (
      arr[id + tileAmount + 1] &&
      arr[id].position.y !== max &&
      arr[id].position.x !== max &&
      arr[id + tileAmount + 1].mine === false &&
      arr[id + tileAmount + 1].clicked === false
    ) {
      arr[id + tileAmount + 1].clicked = true;
      if (arr[id + tileAmount + 1].count === 0)
        checkNearbyEmpty(id + tileAmount + 1, arr);
    }

    return arr;
  }

  /////////////////////////////////////////
  ////////////// USE EFFECTS //////////////
  /////////////////////////////////////////

  useEffect(() => {
    const arr: Tile[] = [];
    let id = 0;
    for (let i = 0; i < tileAmount; i++) {
      for (let j = 0; j < tileAmount; j++) {
        const tile: Tile = {
          clicked: false,
          id: id,
          position: { x: j, y: i },
          mine: false,
          count: 0,
          highlight: false,
        };
        arr.push(tile);
        id++;
      }
    }
    setTileArr(arr);
  }, []);

  // Countdown timer.
  useEffect(() => {
    if (socket && isAdmin && !stop && gameIsPrepped) {
      const interval = setInterval(() => {
        if (roundTime > 0) {
          const time = roundTime - 1;
          setRoundTime(time);
          gameService.updateTime(socket, time);
        }
      }, 1000);
      if (roundTime === 0) {
        if (isPlayerTurn) {
          setPlayerTurn(false);
          const event: Event = {
            user: playerOne.name,
            text: "Ran out of time",
          };
          setEvents((events: Event[]) => [event, ...events]);
        } else {
          setPlayerTurn(true);
          const event: Event = {
            user: playerTwo.name,
            text: "Ran out of time",
          };
          setEvents((events: Event[]) => [event, ...events]);
        }

        setRoundTime(roundTimeSetting);
        gameService.outOfTime(socket, !isPlayerTurn);
        clearInterval(interval);
      }
      return () => clearInterval(interval);
    }
  }, [roundTime, gameIsPrepped]);

  // Runs the eventhandlers.
  useEffect(() => {
    handleGameUpdate();
    handleGameOver();
    handleInitateGame();

    if (!isAdmin) {
      handleTimeUpdate();
      handleTimeExpiration();
    }
  }, []);

  // Plays sound when isPlayerTurn becomes true.
  useEffect(() => {
    if (!isPlayerTurn) return;
    newTurnFx();
  }, [isPlayerTurn]);

  // Plays sound when opponent disconnects.
  useEffect(() => {
    if (!disconnected) return;
    disconnectFx();
    setStop(true);
  }, [disconnected]);

  return (
    <div className="Board">
      {disconnected && <Disconnected socket={socket} roomId={""} />}
      {stop && !disconnected && <GameOver restart={restartGame} />}
      <Timer
        time={roundTime}
        newTurn={isPlayerTurn}
        gameIsPrepped={gameIsPrepped}
      />
      <div className="TopPanel">
        <div className={`PlayerTurn ${!isPlayerTurn ? "Opponent" : ""}`}>
          <h1>{isPlayerTurn ? "Your " : playerTwo.name + "'s "}</h1>
          <h1>turn</h1>
        </div>
        <div className="Player-count Player-one">
          {!isPlayerTurn && <div className="Shade"></div>}
          <h2>{playerOne && playerOne.name}</h2>
          <div className="Score-count">{playerOne && playerOne.score}</div>
        </div>
        <div className="Player-count Player-two">
          {isPlayerTurn && <div className="Shade"></div>}
          <h2>{playerTwo && playerTwo.name}</h2>
          <div className="Score-count">{playerTwo && playerTwo.score}</div>
        </div>
      </div>
      <div
        ref={tileRef}
        onContextMenu={(e) => e.preventDefault()}
        className="Border"
        style={{ gridTemplateColumns: `repeat(${tileAmount}, 0fr)` }}
      >
        {tileArr &&
          tileArr.map((tile) => {
            return (
              <div
                onContextMenu={(e) => flagTile(e, tile.id)}
                onClick={() => tileClick(tile.id)}
                className={`${
                  tile.clicked && tile.mine
                    ? "Bomb-tile"
                    : tile.clicked
                    ? "Clicked-tile"
                    : "Tile"
                }${tile.highlight ? "highlight" : ""}`}
                style={{
                  backgroundImage:
                    !tile.mine && tile.clicked
                      ? `url(Number/${tile.count}.png)`
                      : tile.mine && tile.clicked
                      ? "url(Explosion.png)"
                      : flags[tile.id] && !tile.clicked
                      ? "url(Flagged.png)"
                      : "url(Tile.png)",
                }}
                key={tile.id}
              >
                {/* {tile.clicked && tile.mine ? (
                  <i>
                    <Bomb />
                  </i>
                ) : // ) : tile.clicked && !tile.mine && tile.count > 0 ? (
                //   tile.count
                flags[tile.id] ? (
                  <i>
                    <Flag />
                  </i>
                ) : (
                  ""
                )} */}
              </div>
            );
          })}
      </div>
    </div>
  );
}
