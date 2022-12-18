const Discord = require("discord.js");
const { SlashCommandBuilder } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder().setName("ping").setDescription("Get your and wumpus' ping."),
	async execute(client, interaction) {
        let receiveTime = Date.now();
		await interaction.deferReply({ ephemeral: true });
        let sendTime = Discord.SnowflakeUtil.deconstruct(interaction.id).timestamp;
        let ping = Number(receiveTime - (Number(sendTime) + client.ws.ping));
        if (interaction) await interaction.editReply({ content: String(`Pong!\nYour current ping to discord is about ${ping}ms.\nThe ping between me and the Discord API is about ${client.ws.ping}ms.`), ephemeral: true });
	},
};