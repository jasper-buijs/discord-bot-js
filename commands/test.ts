import { Client, SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

export const structure = new SlashCommandBuilder()
  .setName("test")
  .setDescription("Dit is een test :D")
  .addStringOption(option => option.setName("message")
  .setDescription("Jow geef ons een string!")
  );

export async function execute(_client: Client, interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });
  await interaction.editReply({ content: interaction.options.getString("message") });
}