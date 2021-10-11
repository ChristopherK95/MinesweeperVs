import React from "react";

export type Settings = {
  tileAmount: number;
  totalBombs: number;
  roundTimeSetting: number;
}

export type Player = {
  name: string;
  score: number;
  id: string;
}

export type Event = {
  user: string;
  info?: { position: {x: number, y: number }; score: number;};
  text?: string;
}

export type Tile = {
  clicked: boolean;
  id: number;
  position: { x: number; y: number };
  mine: boolean;
  count: number;
  highlight: boolean;
};

export interface IGameContextProps {
  gameCode: string;
  playerOne: Player;
  playerTwo: Player;
  tileArr: Tile[];
  tileAmount: number;
  bombsSetting: number
  roundTimeSetting: number;
  roundTime: number;
  isAdmin: boolean;
  isCreatingRoom: boolean;
  isInRoom: boolean;
  isPlayerTurn: boolean;
  isGameStarted: boolean;
  isWinner: boolean;
  disconnected: boolean;
  noHost: boolean;
  setGameCode: (setGameCode: string) => void;
  setPlayerOne: (setPlayerOne: Player) => void;
  setPlayerTwo: (setPlayerTwo: Player) => void;
  setTileArr: (setTileArr: Tile[]) => void;
  setTileAmount: (setTileAmount: number) => void;
  setBombsSetting: (setBombsSetting: number) => void;
  setRoundTimeSetting: (setRoundTimeSetting: number) => void;
  setRoundTime: (setRoundTime: number) => void;
  setAdmin: (setAdmin: boolean) => void;
  setCreatingRoom: (creatingRoom: boolean) => void;
  setInRoom: (inRoom: boolean) => void;
  setPlayerTurn: (turn: boolean) => void;
  setGameStarted: (started: boolean) => void;
  setWinner: (setWinner: boolean) => void;
  setDisconnected: (setDisconnected: boolean) => void;
  setNoHost: (setNoHost: boolean) => void;
};

const defaultState: IGameContextProps = {
  gameCode: "",
  playerOne: { name: "", score: 0, id: "" },
  playerTwo: { name: "", score: 0, id: "" },
  tileArr: [],
  tileAmount: 12,
  bombsSetting: 50,
  roundTimeSetting: 30,
  roundTime: 30,
  isAdmin: false,
  isCreatingRoom: false,
  isInRoom: false,
  isPlayerTurn: false,
  isGameStarted: false,
  isWinner: false,
  disconnected: false,
  noHost: false,
  setGameCode: () => { },
  setPlayerOne: () => { },
  setPlayerTwo: () => { },
  setTileArr: () => { },
  setTileAmount: () => { },
  setBombsSetting: () => { },
  setRoundTimeSetting: () => { },
  setRoundTime: () => { },
  setAdmin: () => { },
  setCreatingRoom: () => { },
  setInRoom: () => { },
  setPlayerTurn: () => { },
  setGameStarted: () => { },
  setWinner: () => { },
  setDisconnected: () => { },
  setNoHost: () => { },
};

export default React.createContext(defaultState);