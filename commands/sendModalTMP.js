const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Discord = require("discord.js");
const { SlashCommandBuilder } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder().setName("sendmodal").setDescription("Send the exam planner modal.").addChannelOption(op => op.setName("channel").setDescription("channel to send message in").setRequired(true)),
	async execute(client, interaction) {
        await interaction.deferReply({ ephemeral: true });
        const channel = interaction.options.getChannel("channel");
        const buttonRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId("doModal")
                .setLabel("Enter exams")
                .setStyle(ButtonStyle.Primary),
            );
        await channel.send({ content: `**Examenrooster Januari 2023**\nHet leek ons nuttig om een idee te hebben van wie wanneer welk examen heeft, en dus zouden we daar graag een overzicht van maken. Daarvoor moeten we echter eerst weten wie wat wanneer heeft. Als @everyone zijn examens dit jaar nog zou kunnen doorgeven met de knop hieronder, maak ik begin volgende week een overzicht beschikbaar in Discord. Dankjewel alvast!`, components: [buttonRow] });
        await interaction.editReply({ content: "Done.", ephemeral: true })
    },
};