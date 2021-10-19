import { Socket } from "socket.io-client";
import { Settings, Player, Event, Tile } from "../../GameContext";

class GameService {
  public async createGame(socket: Socket, roomId: string, name: string): Promise<{ boolean: boolean, player: Player }> {
    return new Promise((rs) => {
      socket.emit("create_game", { roomId, name })
      socket.on("room_created", (player: Player) => rs({ boolean: true, player: player }));
    })
  }

  public async joinGameRoom(socket: Socket, roomId: string, name: string): Promise<{ boolean: boolean, player: Player[], settings: Settings }> {
    return new Promise((rs, rj) => {
      socket.emit("join_game", { roomId, name });
      socket.on("room_joined", (player: Player[], settings: Settings) => rs({ boolean: true, player: player, settings: settings }));
      socket.on("room_join_error", ({ error }) => rj(error));
    })
  }

  public async leaveGameRoom(socket: Socket, roomId: string) {
    console.log(roomId);
    socket.emit("leave_room", roomId);
  }

  public async updateTileAmount(socket: Socket, tileAmount: number, roomId: string) {
    socket.emit("update_tile_amount", {tileAmount, roomId})
  }

  public async updateBombsSetting(socket: Socket, totalBombs: number, roomId: string) {
    socket.emit("update_bombs_setting", { totalBombs, roomId });
  }

  public async updateRoundTimeSetting(socket: Socket, roundTime: number, roomId: string) {
    socket.emit("update_round_time_setting", { roundTime, roomId });
  }

  public async startGame(socket: Socket, totalBombs: number, roundTime: number) {
    socket.emit("start_game", { totalBombs, roundTime });
  }

  public async prepareGame(socket: Socket, bombs: number, tileAmount: number, id: number, tileArr: Tile[]) {
    return new Promise<{tileArr: Tile[], score: number, event: Event}>((rs) => {
      socket.emit("prepare_game", {bombs, tileAmount, id, tileArr});
      socket.on("game_setup1", (message:{tileArr: Tile[], score: number, event: Event}) => rs(message))
    })
  }

  public async onInitiate(socket: Socket, listener: (message: {tileArr: Tile[], score: number, event: Event}) => void) {
    socket.on("game_setup2", (message: { tileArr: Tile[], score: number, event: Event}) => listener(message))
  }

  public async tileClick(socket: Socket, arr: Tile[], score: number, event: Event) {
    return new Promise<Tile>(() => {
      socket.emit("tile_click", { arr, score, event });
    })
  }

  public async gameOver(socket: Socket, arr: Tile[], score: number, event: Event, players: {playerOne: Player, playerTwo: Player}) {
    return new Promise<Tile>(() => {
      socket.emit("game_over", { arr, score, event, players });
    })
  }

  public async ready(socket: Socket){
    socket.emit("ready");
  }

  public async updateTime(socket: Socket, time: number) {
    socket.emit("update_time", time)
  }

  public async outOfTime(socket: Socket, turn: boolean) {
    socket.emit("out_of_time", turn)
  }

  public async onPlayerJoined(socket: Socket, listener: (player: Player) => void) {
    socket.on("player_two_joined", listener)
  }

  public async onTileAmountUpdate(socket: Socket, listener: (tileAmount: number) => void) {
    socket.on("tile_amount_update", listener)
  }

  public async onBombsSettingUpdate(socket: Socket, listener: (totalBombs: number) => void) {
    socket.on("bombs_setting_update", listener)
  }

  public async onRoundTimeSettingUpdate(socket: Socket, listener: (roundTime: number) => void) {
    socket.on("round_time_setting_update", listener)
  }

  public async onGameUpdate(socket: Socket, listener: (message: { arr: Tile[], score: number, event: Event }) => void) {
    socket.on("on_game_update", (message: { arr: Tile[], score: number, event: Event}) => listener(message));
  }

  public async onTimeUpdate(socket: Socket, listener: (message: number) => void) {
    socket.on("on_time_update", listener);
  }

  public async onOutOfTime(socket: Socket, listener: (message: boolean) => void) {
    socket.on("on_timeout", listener);
  }

  public async onStartGame(socket: Socket, listener: (message: { turn: string, totalBombs: number, roundTime: number }) => void) {
    socket.on("start_game", (message: { turn: string, totalBombs: number, roundTime: number }) => listener(message));
  }

  public async onGameOver(socket: Socket, listener: (message: {arr: Tile[], score: number, event: Event, players: {playerOne: Player, playerTwo: Player}}) => void) {
    socket.on("on_game_over", (message: {arr: Tile[], score: number, event: Event, players: {playerOne: Player, playerTwo: Player}}) => listener(message));
  }

  public async onReady(socket: Socket, listener: () => void) {
    socket.on("on_ready", listener)
  }

  public async onDisconnected(socket: Socket, listener: () => void) {
    socket.on("disconnected", listener)
  }
}

export default new GameService();