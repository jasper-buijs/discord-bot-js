import type { ClientProps } from "../types";
import { type TextBasedChannel } from "discord.js";

interface DBDataRow {
  id: number;
  messageId: string;
  time: number;
  content: string;
  author: string;
  channel: string;
  deleted: number; // NUMBER AS BOOLEAN
}

/**
 * Delete recent gif messages from a user
 *
 * @param {ClientProps} client - The client instance
 * @param {import("bun:sqlite").Database} client.db - The local SQLite database
 * @param {DBDataRow[]} data - Array of messages from which to delete
 * @param {number} time - Timeframe before the present from which to delete, in milliseconds
 *
 * @example deleteMessages(client, messageArray, 1_800_000);
 */
async function deleteMessages(client: ClientProps, data: DBDataRow[], time: number) {
  data.forEach(message => {
    if (!Boolean(message.deleted) && message.time > new Date(Date.now() - time).getTime()) {
      client.guilds.fetch(client.guildId).then(guild => guild.channels.fetch(message.channel).then(channel => {
        const setDeleted = client.db.query(`UPDATE gifs SET deleted = 1 WHERE id = $id`);
        setDeleted.run({ $id: message.id });
        if (channel?.isTextBased) (channel as TextBasedChannel).messages.fetch(message.messageId).then(message => message.delete().catch(() => console.log("> FAILED to delete gif message, skipping.")));
      }));
    }
  });
}

/**
 * Update current gif penalty and delete messages from a specific sender
 *
 * @param {ClientProps} client - The client instance
 * @param {import("bun:sqlite").Database} client.db - The local SQLite database
 * @param {string} author - Discord ID of the sender
 *
 * @example updateGifPenalties(client, "000000000000000000");
 */
export async function updateGifPenalties(client: ClientProps, author: string) {
  // Get data from DB
  const getData = client.db.query(`SELECT * FROM gifs WHERE author = $author`);
  const data = getData.all({ $author: author }) as DBDataRow[];

  // Test messages from DB
  const gifsInLastHalfHour = data.filter(message => message.time > new Date(Date.now() - 30*60*1000).getTime()).length;
  const gifsInLastHour = data.filter(message => message.time > new Date(Date.now() - 60*60*1000).getTime()).length;
  if (gifsInLastHalfHour >= 3) {
    await deleteMessages(client, data, 30*60*1000);
  }

  // Remove messages and apply penalties
  if (gifsInLastHour >= 8 && gifsInLastHalfHour >= 3) {
    const now = new Date();
    const next3AM = new Date(new Date().setHours(3, 0, 0, 0));
    if (now.getHours() >= 3) next3AM.setDate(next3AM.getDate() + 1);
    client.guilds.fetch(client.guildId).then(guild => guild.members.fetch(author).then(member => { member.moderatable && member.timeout(next3AM.getTime() - now.getTime(), "8 gifs (auto)"); }));
  } else if (gifsInLastHour == 7 && gifsInLastHalfHour >= 3) {
    client.guilds.fetch(client.guildId).then(guild => guild.members.fetch(author).then(member => { member.moderatable && member.timeout(60*60*1000, "7 gifs (auto)"); }));
  } else if (gifsInLastHour == 6 && gifsInLastHalfHour >= 3) {
    client.guilds.fetch(client.guildId).then(guild => guild.members.fetch(author).then(member => { member.moderatable && member.timeout(5*60*1000, "6 gifs (auto)"); }));
  } else if (gifsInLastHour == 5 && gifsInLastHalfHour >= 3) {
    client.guilds.fetch(client.guildId).then(guild => guild.members.fetch(author).then(member => { member.moderatable && member.timeout(10*1000, "5 gifs (auto)"); }));
  }

  // Remove gifs older than one month
  const getOldData = client.db.query(`DELETE FROM gifs WHERE time < $limit`);
  const limitTime = new Date();
  limitTime.setMonth(limitTime.getMonth() -1);
  getOldData.run({ $limit: limitTime.getTime() });
}