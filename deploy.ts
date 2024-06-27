import { REST, Routes } from "discord.js";
import fs from "node:fs";
import { Database } from "bun:sqlite";
import type { dbFormatProps } from "./types";


const dbFormat: dbFormatProps = require("./dbformat.json");
const db = new Database("db.sqlite", { create: true });

// CREATE TABLES
for (let table in dbFormat) {
  let columns: string[] = [];
  Object.keys(dbFormat[table]).forEach(formatColumnName => {
    if (formatColumnName != "clear") {
      columns.push([formatColumnName, dbFormat[table][formatColumnName]].join(" "));
    }
  });
  console.log(`> CREATING TABLE ${ table }`);
  let createTables = db.query(`CREATE TABLE IF NOT EXISTS ${ table } (${ columns.join(", ") });`);
  createTables.run();
}

// DELETE TABLE
let getTables = db.query(`SELECT name FROM sqlite_master WHERE type = 'table';`);
let tableNames: any = getTables.all();
tableNames.forEach((tableNameObject: { [keyName: string]: string }) => {
  let tableName = tableNameObject["name"];
  if (!Object.keys(dbFormat).includes(tableName)) {
    console.log(`> DELETING TABLE ${ tableName }`);
    let deleteTable = db.query(`DROP TABLE ${ tableName };`);
    deleteTable.run();
  }
});

// CREATE COLUMNS
tableNames = getTables.all();
tableNames.forEach((tableNameObject: { [keyName: string]: string }) => {
  let tableName = tableNameObject["name"];
  let getColumns = db.query(`PRAGMA table_info(${ tableName });`);
  let columns = getColumns.all();
  Object.keys(dbFormat[tableName]).forEach(formatColumnName => {
    if (formatColumnName != "clear") {
      if (!columns.filter((column: any) => column.name == formatColumnName).length) {
        console.log(`> CREATING COLUMN ${ formatColumnName } IN ${ tableName }`);
        let createColumn = db.query(`ALTER TABLE ${ tableName } ADD COLUMN ${ formatColumnName } ${ dbFormat[tableName][formatColumnName] };`);
        createColumn.run();
      }
    }
  });
});

// DELETE COLUMNS
tableNames.forEach((tableNameObject: { [keyName: string]: string }) => {
  let tableName = tableNameObject["name"];
  let getColumns = db.query(`PRAGMA table_info(${ tableName });`);
  let columns = getColumns.all();
  columns.forEach((column: any) => {
    let columnName = column["name"];
    if (!Object.keys(dbFormat[tableName]).includes(columnName)) {
      console.log(`> DELETING COLUMN ${ columnName } FROM ${ tableName }`);
      let deleteColumn = db.query(`ALTER TABLE ${ tableName } DROP COLUMN ${ columnName };`);
      deleteColumn.run();
    }
  });
});

// CLEAR TABLES
/**
 * Clears all data from all db tables.
 */
const clearTables = () => {
  for (let table in dbFormat) {
    if (dbFormat[table]["clear"]) {
      console.log(`> CLEARING ALL DATA FROM ${ table }`);
      let clearTable = db.query(`DELETE FROM ${ table };`);
      clearTable.run();
    }
  }
}
clearTables();


// REGISTERING COMMANDS
const commands = [];
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

export { clearTables };
