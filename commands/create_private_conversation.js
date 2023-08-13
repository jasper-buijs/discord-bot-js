const { clientId, guildId } = require("../config.json");
const { SlashCommandBuilder, PermissionsBitField, ChannelType } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder().setName("create-voice-channel").setDescription("Create an extra voice channel in the server.").addIntegerOption(op => op.setName("users").setDescription("Specify a maximum number of users that can join this voice channel.")),
    async createChannel(client, member, maxUsers) {
        const temporaryVoiceChannelAllowedPermissions = [ PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.UseExternalEmojis, PermissionsBitField.Flags.UseExternalStickers, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Stream, PermissionsBitField.Flags.UseEmbeddedActivities, PermissionsBitField.Flags.UseVAD ];
        const temporaryVoiceChannelDeniedPermissions = [ PermissionsBitField.Flags.MentionEveryone, PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.SendTTSMessages, PermissionsBitField.Flags.UseApplicationCommands, PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ManageRoles, PermissionsBitField.Flags.CreateInstantInvite, PermissionsBitField.Flags.PrioritySpeaker, PermissionsBitField.Flags.MuteMembers, PermissionsBitField.Flags.DeafenMembers, PermissionsBitField.Flags.MoveMembers, PermissionsBitField.Flags.ManageEvents ];
        if (maxUsers) {
            let newTemporaryChannel = await client.guilds.cache.get(guildId).channels.create({
                name: "private channel",
                reason: "by user request",
                type: ChannelType.GuildVoice,
                userLimit: maxUsers,
                position: 4,
                permissionOverwrites: [{
                    id: client.guilds.cache.get(guildId).roles.everyone.id,
                    allow: temporaryVoiceChannelAllowedPermissions,
                    deny: temporaryVoiceChannelDeniedPermissions
                }]
            });
            await member.voice.setChannel(newTemporaryChannel);
            await client.temporaryVoiceChannels.push(newTemporaryChannel);
            return newTemporaryChannel.id;
        } else {
            let newTemporaryChannel = await client.guilds.cache.get(guildId).channels.create({
                name: "temporary channel",
                reason: "by user request",
                type: ChannelType.GuildVoice,
                position: 4,
                permissionOverwrites: [{
                    id: client.guilds.cache.get(guildId).roles.everyone.id,
                    allow: temporaryVoiceChannelAllowedPermissions,
                    deny: temporaryVoiceChannelDeniedPermissions
                }]
            });
            await member.voice.setChannel(newTemporaryChannel);
            await client.temporaryVoiceChannels.push(newTemporaryChannel);
            return newTemporaryChannel.id;
        }
    },
    async execute(client, interaction) {
        await interaction.deferReply({ ephemeral: true });
        if (interaction.member.voice.channel) {
            if (interaction.options.getInteger("users")) {
                voiceChannelId = await this.createChannel(client, interaction.member, interaction.options.getInteger("users"));
            } else {
                voiceChannelId = await this.createChannel(client, interaction.member, null);
            }
            await interaction.editReply({ content: String(`A voice channel has been created.\nHold tight, you are now being moved.`), ephemeral: true });
        } else {
            if (interaction.options.getInteger("users")) {
                voiceChannelId = await this.createChannel(client, interaction.member, interaction.options.getInteger("users"));
            } else {
                voiceChannelId = await this.createChannel(client, interaction.member, null);
            }
            await interaction.editReply({ content: String(`A voice channel has been created.\nHold tight, you are now being moved.`), ephemeral: true });
        }
        /*await interaction.deferReply({ ephemeral: true });
        if (interaction.member.voice.channel) {
            if (interaction.options.getInteger("users")) {
                let newTemporaryChannel = await interaction.guild.channels.create({
                    name: "private channel",
                    reason: "by user request", 
                    type: ChannelType.GuildVoice, 
                    userLimit: interaction.options.getInteger("users"), 
                    position: 4, 
                    permissionOverwrites: [{
                        id: client.guilds.cache.get(guildId).roles.everyone.id,
                        allow: temporaryVoiceChannelAllowedPermissions,
                        deny: temporaryVoiceChannelDeniedPermissions
                    }] 
                });
                await interaction.member.voice.setChannel(newTemporaryChannel);
                await interaction.editReply({ content: String(`A voice channel has been created.\nHold tight, you are now being moved.`), ephemeral: true });
                await client.temporaryVoiceChannels.push(newTemporaryChannel);
            } else {
                let newTemporaryChannel = await interaction.guild.channels.create({
                    name: "temporary channel",
                    reason: "by user request", 
                    type: ChannelType.GuildVoice, 
                    position: 4, 
                    permissionOverwrites: [{
                        id: client.guilds.cache.get(guildId).roles.everyone.id,
                        allow: temporaryVoiceChannelAllowedPermissions,
                        deny: temporaryVoiceChannelDeniedPermissions
                    }]
                });
                await interaction.member.voice.setChannel(newTemporaryChannel);
                await interaction.editReply({ content: String(`A voice channel has been created.\nHold tight, you are now being moved.`), ephemeral: true });
                await client.temporaryVoiceChannels.push(newTemporaryChannel);
            }
        } else {
            if (interaction.options.getInteger("users")) {
                let newTemporaryChannel = await interaction.guild.channels.create({
                    name: "private channel",
                    reason: "by user request", 
                    type: ChannelType.GuildVoice, 
                    userLimit: interaction.options.getInteger("users"), 
                    position: 4, 
                    permissionOverwrites: [{
                        id: client.guilds.cache.get(guildId).roles.everyone.id,
                        allow: temporaryVoiceChannelAllowedPermissions,
                        deny: temporaryVoiceChannelDeniedPermissions
                    }]
                });
                await interaction.editReply({ content: String(`A voice channel has been created.\nYou can find it here: <#${newTemporaryChannel.id}>`), ephemeral: true });
                await client.temporaryVoiceChannels.push(newTemporaryChannel);
            } else {
                let newTemporaryChannel = await interaction.guild.channels.create({
                    name: "temporary channel",
                    reason: "by user request", 
                    type: ChannelType.GuildVoice, 
                    position: 4, 
                    permissionOverwrites: [{
                        type: "role",
                        id: client.guilds.cache.get(guildId).roles.everyone.id,
                        allow: temporaryVoiceChannelAllowedPermissions,
                        deny: temporaryVoiceChannelDeniedPermissions
                    }]
                });
                await interaction.editReply({ content: String(`A voice channel has been created.\nYou can find it here: <#${newTemporaryChannel.id}>`), ephemeral: true });
                await client.temporaryVoiceChannels.push(newTemporaryChannel);
            }
        }*/
    }
}