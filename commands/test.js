import { SlashCommandBuilder } from "discord.js";

export const structure = new SlashCommandBuilder()
    .setName("test")
    .setDescription("Dit is een test :D")
    .addStringOption(option => option.setName("message")
        .setDescription("Jow geef ons een string!")
    );

export async function execute(client, interaction) {
    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply({ content: interaction.options.getString("message"), ephemeral: true });
}