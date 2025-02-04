// noinspection JSUnusedGlobalSymbols

import { Events, Message } from "discord.js";
import type { ClientProps } from "../../types";
import { updateGifPenalties } from "../../scripts/gif-penalties.ts";

export const name = Events.MessageCreate;
export const once = false;

export async function execute(client: ClientProps, message: Message, ..._args: any[]): Promise<void> {
  // Check for correct guild
  if (message.guildId != client.guildId) return;

  /* GIF FILTER */
  // Check for allowed channel
  const allowedChannels = ["gifs-and-memes", "age-restricted"];
  if (await client.guilds.fetch(client.guildId).then(guild => guild.channels.fetch(message.channelId).then(channel => allowedChannels.includes(channel?.name || "") ))) return;

  // Check for GIF
  const filteredWords = [".gif", "tenor.com", "giphy.com", "imgur.com"];
  if (!filteredWords.some(word => message.content.includes(word))) return;

  // Add to DB
  const insertInDB = client.db.query(`INSERT INTO gifs (messageId, content, channel, author, time, deleted) VALUES ($messageId, $content, $channel, $author, $time, false);`);
  insertInDB.run({$messageId: message.id, $content: message.content, $channel: message.channelId, $author: message.author.id, $time: message.createdAt.getTime()});

  // Run GIF Penalty script
  await updateGifPenalties(client, message.author.id)
}