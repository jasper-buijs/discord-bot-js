import { Client, SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from "discord.js";

export const structure = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Simple ping-pong command.");

export async function execute(_client: Client, interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  await interaction.editReply({ content: "Pong!" });
}