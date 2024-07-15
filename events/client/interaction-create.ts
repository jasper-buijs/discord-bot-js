// noinspection JSUnusedGlobalSymbols

import { type ClientProps } from "../../types";
import { Events, type Interaction, InteractionType } from "discord.js";

export const name = Events.InteractionCreate;
export const once = false;

export async function execute(client: ClientProps, ...args: any[]) {
  const interaction: Interaction = args[0];
  if (interaction.type == InteractionType.ApplicationCommand) {
    if (!client.commands) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try { await command.execute(client, interaction); } catch (error) {
      console.error(error);
      await interaction.reply({ content: "There was an error :(" }).catch();
      await interaction.editReply({ content: "There was an error :(" }).catch();
      await interaction.followUp({ content: "There was an error :(" }).catch()
    }
  }
}