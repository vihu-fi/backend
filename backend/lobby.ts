export interface Player {
  id: PlayerId;
  name: string;
  client: "telegram";
}

export enum GameState {
  LOBBY,
}

export type LobbyId = string;
export type PlayerId = string;

enum LobbyProgress {
  BEFORE_START,
  STARTED,
}

export type Lobby = {
  id: string;
  progress: LobbyProgress;
  players: Map<PlayerId, Player>;
};

export const lobbies = new Map<LobbyId, Lobby>();

export const getLobby = (lobbyId: LobbyId) => lobbies.get(lobbyId);

export const getPlayerLobby = (player: Player) =>
  [...lobbies.values()].find((lobby) =>
    getLobbyPlayers(lobby).some(
      (playingPlayer) => playingPlayer.id === player.id
    )
  );

export const createLobby = (lobbyId: string, player: Player) =>
  lobbies
    .set(lobbyId, {
      id: lobbyId,
      progress: LobbyProgress.BEFORE_START,
      players: new Map([[player.id, player]]),
    })
    .get(lobbyId)!;

export const deleteLobby = (lobbyId: string) => lobbies.delete(lobbyId);

export const isLobbyStarted = (lobby: Lobby) =>
  lobby.progress !== LobbyProgress.BEFORE_START;

export const joinPlayer = (lobby: Lobby, player: Player) => {
  const existingLobbyForPlayer = getPlayerLobby(player);
  if (existingLobbyForPlayer) {
    deleteLobby(existingLobbyForPlayer.id);
  }

  return lobby.players.set(player.id, player);
};

export const getLobbyPlayers = (lobby: Lobby) => [...lobby.players.values()];

export const kickPlayer = (lobby: Lobby, player: Player) => {
  return lobby.players.delete(player.id);
};
