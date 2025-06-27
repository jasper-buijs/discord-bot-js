// noinspection JSUnusedGlobalSymbols

import { Events, VoiceState, ChannelType, type Snowflake } from "discord.js";
import type { ClientProps } from "../../types";

export const name = Events.VoiceStateUpdate;
export const once = false;

export async function execute(client: ClientProps, oldState: VoiceState, newState: VoiceState, ..._args: any[]) {
  // Check if member is now in the abyss
  if (newState.channel?.name == "the abyss of awkwardness") {
    // Check for existing temporary channel
    const checkForExistingChannel = client.db.query(`SELECT channelId FROM temporaryChannels WHERE userId = $userId;`);
    const result: unknown = await checkForExistingChannel.get({$userId: newState.id});
    if (result) {
      // Move user to existing channel
      const channel = await client.guilds.fetch(client.guildId).then(guild => guild.channels.fetch((result as { channelId: Snowflake }).channelId));
      if (channel?.isVoiceBased()) await newState.member?.voice.setChannel(channel);
    } else {
      // Create new channel and move
      const guild = await client.guilds.fetch(client.guildId);
      await guild.channels.create({
        name: newState.member ? `${ newState.member.displayName.endsWith("s") ? newState.member.displayName + "'" : newState.member.displayName + "'s" } channel` : "temporary channel",
        type: ChannelType.GuildVoice,
        position: (newState.channel?.position || 3) + 1,
        reason: "User joined the abyss",
        // permissionOverwrites: [] // Not needed, default @everyone permissions should be correct
      }).then(channel => {
        newState.member?.voice.setChannel(channel);
        const addChannelToDB = client.db.query(`INSERT INTO temporaryChannels (channelId, userId) values ($channelId, $userId);`);
        addChannelToDB.run({ $channelId: channel.id, $userId: newState.member?.id || "unknown" });
      });
    }
  } else {
    // Check if old channel is empty + not recent, if so delete
    if (!oldState.channel?.isVoiceBased() || oldState.channel.members.size || new Date().getTime() - oldState.channel?.createdAt.getTime() < 2*60*1000) return;
    const checkChannelInDB = client.db.query(`SELECT count(*) FROM temporaryChannels WHERE channelId = $channelId;`);
    const result: unknown = await checkChannelInDB.get({$channelId: oldState.channel.id});
    if ((result as { "count(*)": number })["count(*)"] == 0) return;
    await oldState.channel?.delete();
    const deleteChannelFromDB = client.db.query(`DELETE FROM temporaryChannels WHERE channelId = $channelId;`);
    deleteChannelFromDB.run(oldState.channelId);
  }
}