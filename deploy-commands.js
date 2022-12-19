// IMPORT PACKAGES
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");
const { token, clientId, guildId } = require("./config.json");
// DECLARATIONS
const commands = []
const contexts = []
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}
const contextFiles = fs.readdirSync("./context-menus").filter(file => file.endsWith(".js"));
for (const file of contextFiles) {
    const context = require(`./context-menus/${file}`);
    contexts.push(context.data.toJSON());
}
// REGISTERING COMMANDS
const rest = new REST({ version: 9 }).setToken(token);
(async () => {
    try {
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands.concat(contexts) });
        console.log("> SUCCESSFULLY REGISTERED COMMANDS AND CONTEXT MENUS");
    } catch (error) {console.error("creating" + error);}
})();