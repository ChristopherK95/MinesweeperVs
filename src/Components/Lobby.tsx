import React, { useContext, useState } from "react";
import GameContext from "../GameContext";
import socketService from "../services/socketService";
import gameService from "../services/gameService";
import { ReactComponent as Host } from "../SVG/Host.svg";
import { ReactComponent as Door } from "../SVG/Door.svg";
import "../Styles/Lobby.css";

interface LobbyProps {}

export function Lobby(props: LobbyProps) {
  const [isJoining, setJoining] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [nameErr, setNameErr] = useState(false);
  const {
    setCreatingRoom,
    setAdmin,
    setPlayerOne,
    setPlayerTwo,
    setGameCode,
    setTileAmount,
    setBombsSetting,
    setRoundTimeSetting,
  } = useContext(GameContext);

  function changeName(text: string) {
    setName(text);
  }

  function changeCode(text: string) {
    setCode(text);
  }

  async function joinRoom(e: React.FormEvent) {
    e.preventDefault();
    if (name === "") {
      nameEmptyErr();
      return;
    }
    const socket = socketService.socket;
    if (!code || code.trim() === "" || !socket) return;

    setJoining(true);
    const joined = await gameService
      .joinGameRoom(socket, code, name)
      .catch((err) => {
        alert(err);
      });

    if (joined) {
      setJoining(false);
      setPlayerOne(joined.player[1]);
      setPlayerTwo(joined.player[0]);
      setTileAmount(joined.settings.tileAmount);
      setBombsSetting(joined.settings.totalBombs);
      setRoundTimeSetting(joined.settings.roundTimeSetting);
      setGameCode(code);
      setCreatingRoom(true);
    } else {
      setJoining(false);
    }
  }

  async function createRoom() {
    if (name === "") {
      nameEmptyErr();
      return;
    }
    setCode("");
    const socket = socketService.socket;
    if (!socket) return;
    const gameCode = createCode();
    const created = await gameService
      .createGame(socket, gameCode, name)
      .catch((err) => {
        alert(err);
      });

    if (created!.boolean) {
      setGameCode(gameCode);
      setPlayerOne(created!.player);
      setAdmin(true);
      setCreatingRoom(true);
    }
  }

  function nameEmptyErr() {
    setNameErr(true);
    setTimeout(() => {
      setNameErr(false);
    }, 2000);
  }

  function createCode() {
    var code = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < 5; i++) {
      let randomChar = characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
      code += randomChar;
    }
    return code;
  }

  return (
    <form onSubmit={joinRoom}>
      <div className="Lobby">
        <div className="Top">
          <div className="Name-div">
            <label htmlFor="name">Name</label>
            <input
              onChange={(e) => changeName(e.target.value)}
              name="name"
              type="text"
              value={name}
              placeholder="Enter your name"
            />
            {nameErr && <p>Name can't be empty!</p>}
          </div>
        </div>
        <div className="Body">
          <div className="Join-div">
            <h2>Join game</h2>
            <div className="Code-div">
              <input
                onChange={(e) => changeCode(e.target.value)}
                name="room"
                type="text"
                value={code}
                placeholder="Enter room code"
              />
              <button
                onClick={joinRoom}
                type="submit"
                disabled={isJoining}
                className="CreateButton"
              >
                <Door className="Icon" />
              </button>
            </div>
          </div>
          <div className="Create-div">
            <h2>Create game</h2>
            <button onClick={createRoom} className="CreateButton">
              Create
              <Host className="Icon" />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
