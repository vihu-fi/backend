import { getLobbyPlayers, Lobby } from "../lobby";

export const playerList = (lobby: Lobby) =>
  espaceMessage(`*Pelaajat*
${getLobbyPlayers(lobby)
  .map((user) => user.name)
  .join("\n")}`);

export const welcome = `Tervetuloa Profeetan luo.
    
/uusi - Aloittaa uuden pelin
/liity - Liity peliin`;

export const noGame =
  "Kyseisellä käyttäjällä ei ole peli käynnissä. Sano /uusi aloittaaksesi itse pelin.";

export const lobbyCreated = (
  lobby: Lobby
) => `Aula luotu! Peliisi pääsee komennolla /liity ${lobby.id}

  /aloita - Aloittaa pelin`;

export const helpJoin = "Anna huoneen tunnus /liity tunnus";

const espaceMessage = (message: string) =>
  message
    .replace(/_/gi, "\\_")
    .replace(/-/gi, "\\-")
    .replace("~", "\\~")
    .replace(/`/gi, "\\`")
    .replace(/\./g, "\\.")
    .replace(/\</g, "\\<")
    .replace(/\>/g, "\\>");
