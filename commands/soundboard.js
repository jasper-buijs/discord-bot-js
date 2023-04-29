const { clientId, guildId } = require("../config.json");
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder().setName("soundboard").setDescription("Toggle soundboard functionality.").setDefaultMemberPermissions(PermissionFlagsBits.Administrator).addSubcommand(command =>
        command.setName("enable").setDescription("Enable soundboard.").addChannelOption(op =>
            op.setName("channel").setDescription("The channel in which to enable soundboard.").setRequired(true).addChannelTypes(ChannelType.GuildVoice))).addSubcommand(command =>
        command.setName("disable").setDescription("Disable soundboard.").addChannelOption(op =>
            op.setName("channel").setDescription("The channel in which to disable soundboard.").setRequired(true).addChannelTypes(ChannelType.GuildVoice))),
    async execute(client, interaction) {
        await interaction.deferReply({ ephemeral: true });
        if (interaction.options.getSubcommand() == "enable") {
            const channel = interaction.options.getChannel("channel");
            await channel.fetch();
            await channel.permissionOverwrites.edit(client.guilds.cache.get(guildId).roles.everyone, {UseSoundboard: true});
            await interaction.editReply({ content: "Soudnboard enabled.", ephemeral: true });
        } else {
            const channel = interaction.options.getChannel("channel");
            await channel.fetch();
            await channel.permissionOverwrites.edit(client.guilds.cache.get(guildId).roles.everyone, {UseSoundboard: false});
            await interaction.editReply({ content: "Soudnboard disabled.", ephemeral: true });
        }
    }
}