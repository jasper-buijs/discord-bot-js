const { clientId, guildId } = require("../config.json");
const { SlashCommandBuilder, ChannelType } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder().setName("invite").setDescription("Temporarily invite someone to the server.").addChannelOption(op => op.setName("channel").setDescription("The Voice Channel to invite to.").setRequired(true).addChannelTypes(ChannelType.GuildVoice)),
    async execute(client, interaction) {
        await interaction.deferReply({ ephemeral: true });
        const channel = interaction.options.getChannel("channel");
        await channel.fetch();
        const invite = await channel.createInvite({ temporary: true, maxAge: 7200, maxUses: 3, unique: true, reason: `slash command by ${interaction.member.displayName}` });
        await interaction.editReply({ content: `An invite has been created!\n${invite.url}` });
    }
}