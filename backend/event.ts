import EventEmitter from "events";
import { Lobby } from "./lobby";

// Declare is here only to get type safety on emitter.on(event)
declare interface LobbyEmitter {
  on(
    event: "player-joined",
    listener: ({ lobby }: { lobby: Lobby }) => void
  ): this;
  on(event: string, listener: Function): this;
}

class LobbyEmitter extends EventEmitter {
  emitPlayerChanged(lobby: Lobby) {
    return this.emit("player-joined", { lobby });
  }
}
export const lobbyEmitter = new LobbyEmitter();
