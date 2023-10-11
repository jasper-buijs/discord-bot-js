import { Client, Collection, GatewayIntentBits, InteractionType } from "discord.js";
import fs from "node:fs";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const commandFile of commandFiles) {
    const command = require("./commands/" + commandFile);
    client.commands.set(command.structure.name, command);
}

client.on("interactionCreate", async interaction => {
    if (interaction.type == InteractionType.ApplicationCommand) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(client, interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "There was an error :(" }).catch();
            await interaction.editReply({ content: "There was an error :(" }).catch();
            await interaction.followUp({ content: "There was an error :(" }).catch();
        }
    }
});

client.login(Bun.env.TOKEN);