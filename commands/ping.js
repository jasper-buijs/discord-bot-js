const Discord = require("discord.js");
const { SlashCommandBuilder } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder().setName("ping").setDescription("Get your and wumpus' ping."),
	async execute(client, interaction) {
        let timestampWhenReceived = Date.now(); //jasper: renamed from receiveTime
		await interaction.deferReply({ ephemeral: true });
        let timestampWhenSend = Discord.SnowflakeUtil.deconstruct(interaction.id).timestamp; //japser: renamed from sendTime
        let ping = Number(timestampWhenReceived - (Number(timestampWhenSend)));
        if (interaction) await interaction.editReply({ content: String(`Pong!\nYour current ping to discord is about ${ping}ms.\nThe ping between me and the Discord API is about ${client.ws.ping}ms.`), ephemeral: true });
	},
};