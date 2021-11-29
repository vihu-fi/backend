import dotenv from "dotenv";
dotenv.config();
import TelegramBot, { Message } from "node-telegram-bot-api";
import { env } from "../../config";
import * as lobbies from "../../lobby";
import { sendMessageToAllPlayers } from "./utils";
import * as messages from "./messages";

const bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN, { polling: true });

const getPlayerIdFromMessage = (msg: TelegramBot.Message) => `${msg.chat.id}`;

const findLobbyIdFromJoinMessage = (msg: TelegramBot.Message) => {
  // const [hostUser] = msg.entities?.map(({ user }) => user) ?? [];
  // return hostUser ? `${hostUser?.id}` : undefined;

  return msg.text?.replace("/liity ", "");
};

const generateLobbyIdFromMessage = (msg: TelegramBot.Message) =>
  `${msg.chat.id}`;

const createPlayerFromMessage = (msg: Message): lobbies.Player => ({
  id: getPlayerIdFromMessage(msg),
  name: `${msg.from?.username ?? msg.from?.first_name}`,
  metadata: {},
});

bot.onText(/\/start/, (msg) => {
  const userId = getPlayerIdFromMessage(msg);

  if (!lobbies.getPlayerLobby(userId)) {
    bot.sendMessage(msg.chat.id, messages.welcome);
  }
});

bot.onText(/\/uusi/i, async (msg) => {
  const userId = getPlayerIdFromMessage(msg);

  if (!lobbies.getPlayerLobby(userId)) {
    const lobbyId = generateLobbyIdFromMessage(msg);
    const { lobby, creator } = lobbies.createLobby(
      lobbyId,
      createPlayerFromMessage(msg)
    );

    await bot.sendMessage(msg.chat.id, messages.lobbyCreated(lobby));
    const editMessage = await bot.sendMessage(
      msg.chat.id,
      messages.playerList(lobby),
      { parse_mode: "MarkdownV2" }
    );
    creator.metadata.editMessageId = editMessage.message_id;
  }
});

bot.onText(/^(\/liity|@)/, async (msg) => {
  const lobbyId = findLobbyIdFromJoinMessage(msg);
  if (!lobbyId) {
    bot.sendMessage(msg.chat.id, messages.helpJoin);
    return;
  }

  const lobby = lobbies.getLobby(lobbyId);
  if (!lobby) {
    bot.sendMessage(msg.chat.id, messages.noGame);
    return;
  }

  if (!lobbies.isLobbyStarted(lobby)) {
    const player = createPlayerFromMessage(msg);
    lobbies.joinPlayer(lobby, player);

    const editMessage = await bot.sendMessage(
      msg.chat.id,
      messages.playerList(lobby),
      { parse_mode: "Markdown" }
    );
    player.metadata.editMessageId = editMessage.message_id;
    sendMessageToAllPlayers(
      bot,
      lobbies.getLobbyPlayers(lobby),
      messages.playerList(lobby)
    );
    return;
  }
});

bot.onText(/^\/aloita/, async (msg) => {
  const userId = getPlayerIdFromMessage(msg);

  try {
    const lobby = lobbies.playerBeginGame(userId);
    await sendMessageToAllPlayers(
      bot,
      lobbies.getLobbyPlayers(lobby),
      messages.gameStarted
    );
  } catch (e) {
    console.error(e);
  }
});

bot.on("photo", (msg) => {
  const userId = getPlayerIdFromMessage(msg);
  const lobby = lobbies.getPlayerLobby(userId);
  if (!lobby) {
    return;
  }
});
