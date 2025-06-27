// noinspection JSUnusedGlobalSymbols

import type { ClientProps } from "../../types";
import { ChannelType, type Collection, Events, type NonThreadGuildBasedChannel } from "discord.js";
import { Database } from "bun:sqlite";
import { register } from "../../scripts/schedule.ts";

export const name = Events.ClientReady;
export const once = true;

export async function execute(client: ClientProps, ..._args: any[]): Promise<void> {
  console.log("> Logged in and ready!");
  client.user?.setStatus("online");

  const guild = await client.guilds.fetch(client.guildId);
  const channels = await guild.channels.fetch();

  /* CLEAR DATABASE > SCHEDULE */
  const db = new Database(import.meta.dir + "/../../db.sqlite");
  db.query(`DELETE FROM schedule;`).run();
  db.close(false);

  /* DELETE 'THE HUB' MESSAGES */
  const deleteMessagesFromTheHub = async (channels: Collection<string, NonThreadGuildBasedChannel | null>) => {
    const channel =  channels.find((channel) => channel?.name == "the hub");
    if (channel?.type == ChannelType.GuildVoice) {
      const messages = await channel.messages.fetch();
      await channel.bulkDelete( messages.size, true );
    }
  }
  await register("deleteMessagesFromTheHub", ["0 3 * * *"], deleteMessagesFromTheHub, channels);

  /* DELETE LEFTOVER TEMPORARY CHANNELS */
  const deleteLeftoverTemporaryChannels = async (channels: Collection<string, NonThreadGuildBasedChannel | null>) => {
    const temporaryChannels = channels.filter(channel => channel?.name.endsWith("channel") && channel.isVoiceBased());
    temporaryChannels.forEach((channel) => {
      if (!channel?.isVoiceBased() || channel?.members?.size || new Date().getTime() - channel?.createdAt.getTime() < 2*60*1000) return;
      const checkChannelInDB = client.db.query(`SELECT count(*) FROM temporaryChannels WHERE channelId = $channelId;`);
      const result: unknown = checkChannelInDB.get({$channelId: channel.id});
      if ((result as { "count(*)": number })["count(*)"] == 0) return;
      const channelId = channel.id;
      channel.delete();
      const deleteChannelFromDB = client.db.query(`DELETE FROM temporaryChannels WHERE channelId = $channelId;`);
      deleteChannelFromDB.run(channelId);
    });
  }
  await register("deleteLeftoverTemporaryChannels", ["0 3 * * *"], deleteLeftoverTemporaryChannels, channels);
}