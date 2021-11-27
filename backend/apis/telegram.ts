import dotenv from "dotenv";
dotenv.config();
import TelegramBot, { User } from "node-telegram-bot-api";
import { env } from "../config";
import * as lobbies from "../lobby";
import * as messages from "./telegram-messages";

const bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN, { polling: true });

const users = new Map<
  string,
  { id: number; player: lobbies.Player; editMessageId?: number }
>([]);

const getUserFromMessage = (message: TelegramBot.Message) => {
  const user = users.get(`${message.chat.id}`);

  if (user) {
    return user;
  } else {
    return users
      .set(`${message.chat.id}`, {
        id: message.chat.id,
        player: {
          id: `${message.chat.id}`,
          name: `${message.chat.id}`,
          client: "telegram",
        },
      })
      .get(`${message.chat.id}`)!;
  }
};

const findLobbyIdFromJoinMessage = (message: TelegramBot.Message) => {
  // const [hostUser] = message.entities?.map(({ user }) => user) ?? [];
  // return hostUser ? `${hostUser?.id}` : undefined;

  return message.text?.replace("/liity ", "");
};

const generateLobbyIdFromMessage = (message: TelegramBot.Message) =>
  `${message.chat.id}`;

bot.onText(/\/start/, (msg) => {
  const user = getUserFromMessage(msg);

  if (!lobbies.getPlayerLobby(user.player)) {
    bot.sendMessage(msg.chat.id, messages.welcome);
  }
});

bot.onText(/\/uusi/i, async (msg) => {
  const user = getUserFromMessage(msg);
  const lobby = lobbies.getPlayerLobby(user.player);

  if (!lobby) {
    const lobbyId = generateLobbyIdFromMessage(msg);
    const lobby = lobbies.createLobby(lobbyId, user.player);

    await bot.sendMessage(msg.chat.id, messages.lobbyCreated(lobby));
    const editMessage = await bot.sendMessage(
      msg.chat.id,
      messages.playerList(lobby),
      { parse_mode: "MarkdownV2" }
    );
    user.editMessageId = editMessage.message_id;
  }
});

bot.onText(/^(\/liity|@)/, async (msg) => {
  const lobbyId = findLobbyIdFromJoinMessage(msg);
  if (!lobbyId) {
    bot.sendMessage(msg.chat.id, messages.helpJoin);
    return;
  }

  const triesToJoinOwnGame = generateLobbyIdFromMessage(msg) === lobbyId;
  if (triesToJoinOwnGame) {
    return;
  }

  const lobby = lobbies.getLobby(lobbyId);
  if (!lobby) {
    bot.sendMessage(msg.chat.id, messages.noGame);
    return;
  }

  if (!lobbies.isLobbyStarted(lobby)) {
    const user = getUserFromMessage(msg);
    lobbies.joinPlayer(lobby, user.player);

    const editMessage = await bot.sendMessage(
      msg.chat.id,
      messages.playerList(lobby),
      { parse_mode: "Markdown" }
    );
    user.editMessageId = editMessage.message_id;
    updateEditMessages(lobby, messages.playerList(lobby));
    return;
  }
});

function updateEditMessages(lobby: lobbies.Lobby, message: string) {
  return Promise.all(
    lobbies.getLobbyPlayers(lobby).map((player) => {
      const { editMessageId, id } = users.get(player.id)!; // The user should always be available, if not, we want to error to know the reason
      return bot.editMessageText(message, {
        message_id: editMessageId,
        chat_id: id,
        parse_mode: "MarkdownV2",
      });
    })
  );
}
