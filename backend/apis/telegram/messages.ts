import { getLobbyPlayers, Lobby } from "../../lobby";
import { espaceMessage } from "./utils";

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
export const gameStarted =
  "Aloita kuvien lähettäminen! Näihin myöhemmin valitaan osuvat tekstit.";
