import TelegramBot from "node-telegram-bot-api";
import { Player } from "../../lobby";

/**
 * Removes any conflicting Markdown characters from message
 */
export const espaceMessage = (message: string) =>
  message
    .replace(/_/gi, "\\_")
    .replace(/-/gi, "\\-")
    .replace("~", "\\~")
    .replace(/`/gi, "\\`")
    .replace(/\./g, "\\.")
    .replace(/\</g, "\\<")
    .replace(/\>/g, "\\>");

export const sendMessageToAllPlayers = (
  bot: TelegramBot,
  players: Player[],
  message: string
) =>
  Promise.all(
    players.map((player) =>
      bot.editMessageText(message, {
        message_id: player.metadata.editMessageId,
        chat_id: player.id,
        parse_mode: "MarkdownV2",
      })
    )
  );
