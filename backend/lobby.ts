export interface Player {
  id: PlayerId;
  name: string;
  metadata: any;
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
  creator: Player;
};

export const lobbies = new Map<LobbyId, Lobby>();

export const getLobby = (lobbyId: LobbyId) => lobbies.get(lobbyId);

export const getPlayerLobby = (id: PlayerId) =>
  [...lobbies.values()].find((lobby) =>
    getLobbyPlayers(lobby).some((playingPlayer) => playingPlayer.id === id)
  );

export const createLobby = (lobbyId: string, creator: Player) => ({
  lobby: lobbies
    .set(lobbyId, {
      id: lobbyId,
      progress: LobbyProgress.BEFORE_START,
      creator,
      players: new Map([[creator.id, creator]]),
    })
    .get(lobbyId)!,
  creator,
});

export const deleteLobby = (lobbyId: string) => lobbies.delete(lobbyId);

export const joinPlayer = (lobby: Lobby, player: Player) => {
  const existingLobbyForPlayer = getPlayerLobby(player.id);
  if (existingLobbyForPlayer && existingLobbyForPlayer.id !== lobby.id) {
    deleteLobby(existingLobbyForPlayer.id);
  }

  return lobby.players.set(player.id, player);
};

export const getLobbyPlayers = (lobby: Lobby) => [...lobby.players.values()];

export const kickPlayer = (lobby: Lobby, player: Player) =>
  lobby.players.delete(player.id);

export const isLobbyStarted = (lobby: Lobby) =>
  lobby.progress !== LobbyProgress.BEFORE_START;

export const playerBeginGame = (playerId: PlayerId) => {
  const lobby = getPlayerLobby(playerId);
  if (!lobby) {
    throw new Error(`No lobby for player ${playerId}`);
  }

  const isCreator = lobby.creator.id === playerId;
  const isNotStarted = isLobbyStarted(lobby);

  if (!isCreator) {
    throw new Error(`Player not creator of the lobby`);
  }

  if (!isNotStarted) {
    throw new Error(`Game not started`);
  }

  lobby.progress = LobbyProgress.STARTED;
  return lobby;
};
