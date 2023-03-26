const Discord = require("discord.js");
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder().setName("move").setDescription("Move everyone from your voice channel to another.").setDefaultMemberPermissions(PermissionFlagsBits.Administrator).addChannelOption(op => op.setName("channel").setDescription("Channel to move to.").setRequired(true).addChannelTypes(ChannelType.GuildVoice)),
    async execute(client, interaction) {
        await interaction.deferReply({ ephemeral: true });
        if (!interaction.member.voice.channelId) {
            console.log("> ERROR with MOVE: user not in voice channel");
            return await interaction.editReply({ content: "You are not in a voice channel.", ephemeral: true });
        }
        const voiceChannelFrom = interaction.member.voice.channel;
        const voiceChannelTo = interaction.options.getChannel("channel");
        await voiceChannelFrom.fetch();
        await voiceChannelFrom.members.forEach(member => {
            member.voice.setChannel(voiceChannelTo);
        });
        await interaction.editReply({ content: "Users successfully moved", ephemeral: true });
    }
}