import { REST, Routes } from "discord.js";
import fs from "node:fs";

const commands = new Array();
const commandsFolder = fs.readdirSync("./commands");

for (const commandFile of commandsFolder) {
  const command = require("./commands/" + commandFile);
  if ("structure" in command && "execute" in command) {
    commands.push(command.structure.toJSON());
  }
}

const rest = new REST().setToken(Bun.env.TOKEN);

(async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(Bun.env.CLIENTID, Bun.env.GUILDID), { body: commands });
    console.log("commands successfully registered")
  } catch (error) {
    console.error(error);
  }
})(); 