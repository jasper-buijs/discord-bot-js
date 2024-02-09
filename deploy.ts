import { REST, Routes } from "discord.js";
import fs from "node:fs";
import { Database } from "bun:sqlite";
import type { dbFormatProps } from "./types";


const dbFormat: dbFormatProps = require("./dbformat.json");
const db = new Database("db.sqlite", { create: true });


for (var table in dbFormat) {
  let columns: Array<string> = new Array();
  Object.keys(dbFormat[table]).forEach(formatColumnName => {
    if (formatColumnName != "clear") {
      columns.push([formatColumnName, dbFormat[table][formatColumnName]].join(" "));
    }
  });
  let createTables = db.query(`CREATE TABLE IF NOT EXISTS ${table} ( ${columns.join(", ")} );`);
  createTables.run();
}

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
