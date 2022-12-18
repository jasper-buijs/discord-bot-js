const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");
const { token, clientId, guildId } = require("./config.json");
const commands = []
const contexts = []
const promises = []
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
const rest = new REST({ version: 9 }).setToken(token);
(async () => {
    try {
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands.concat(contexts) });
        console.log("> SUCCESSFULLY REGISTERED COMMANDS AND CONTEXT MENUS");
        /*await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands }, );
        console.log("> SUCCESSFULLY REGISTERED COMMANDS");
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: contexts }, );
        console.log("> SUCCESSFULLY REGISTERED CONTEXT MENU ITEMS");*/
    } catch (error) {console.error("creating" + error);}
})();