// noinspection JSUnusedGlobalSymbols

import { type ClientProps } from "../../types";
import { Events, type Interaction, InteractionType } from "discord.js";

export const name = Events.InteractionCreate;
export const once = false;

export async function execute(client: ClientProps, ...args: any[]) {
  const interaction: Interaction = args[0];
  if (interaction.type == InteractionType.ApplicationCommand) {
    if (!client.commands) throw new Error("A slash command was used, but no commands are registered in client.commands");
    const command = client.commands.get(interaction.commandName);
    if (!command) throw new Error("A slash command was used, but it was not registered in client.commands");
    try { await command.execute(client, interaction); } catch (error) {
      console.error(error);
      try { await interaction.reply({ content: "There was an error executing this command." }) } catch (error) {
        console.error("Failed to reply with error message!");
        console.error(error);
        try { await interaction.editReply({ content: "There was an error executing this command." }) } catch (error) {
          console.error("Failed to editReply with error message!");
          console.error(error);
          try { await interaction.followUp({ content: "There was an error executing this command." }) } catch (error) {
            console.error("Failed to followUp with error message, throwing!");
            console.error(error);
            throw new Error("ApplicationCommand failed to execute. An error message could not be sent through reply, editReply or followUp.");
          }
        }
      }
    }
  }
}