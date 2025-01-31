import { GatewayIntentBits } from "discord.js";
import fs from "node:fs";
import type { ClientProps } from "./types";
import Wumpus from "./Wumpus.ts";

const client: ClientProps = new Wumpus({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// READ COMMAND FILES
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".ts"));
for (const commandFile of commandFiles) {
  const command = require("./commands/" + commandFile);
  client.commands.set(command.structure.name, command);
}

// READ CLIENT EVENT FILES
const clientEventFiles = fs.readdirSync("./events/client").filter(file => file.endsWith(".ts"));
for (const file of clientEventFiles) {
  const event: { name: string, once: boolean, execute: (client: ClientProps, ...args: any[]) => Promise<void> } = require("./events/client/" + file);
  if (event.once) client.once(event.name, (...args) => event.execute(client, ...args)); else client.on(event.name, (...args) => event.execute(client, ...args));
}

client.login(Bun.env.TOKEN).then(_ => console.log("> Connecting to Discord and logging in..."));