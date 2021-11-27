import dotenv from "dotenv";
dotenv.config();
import { cleanEnv, str } from "envalid";

export const env = cleanEnv(process.env, {
  TELEGRAM_BOT_TOKEN: str({
    desc: "Token for Telegram for sending messages with a bot (Get a token: https://t.me/botfather)",
  }),
});
