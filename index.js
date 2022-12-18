const schedule = require("node-schedule");
const { Client, GatewayIntentBits, Partials, Collection, MessageActionRow, MessageButton, InteractionType, ChannelType, ActivityType, ActivityFlags, ActivityPlatform, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require("fs");
const { Player } = require("discord-player");
const { token } = require("./config.json");
const { clientId, guildId } = require("./config.json");
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent], partials: [Partials.Message, Partials.Channel, Partials.Reaction] })
client.player = new Player(client);
client.messageReports = new Array();
client.userReports = new Array();
client.temporaryVoiceChannels = new Array();
client.gifTracker = new Array();
client.commands = new Collection();
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}
client.contexts = new Collection();
const contextFiles = fs.readdirSync("./context-menus").filter(file => file.endsWith(".js"));
for (const file of contextFiles) {
    const context = require(`./context-menus/${file}`);
    client.contexts.set(context.data.name, context);
}
// SLASH COMMAND
client.on("interactionCreate", async interaction => {
    if (!interaction.type == InteractionType.ApplicationCommand) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try { await command.execute(client, interaction); } 
    catch (error) {
        console.error(error);
        try { await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true }); }
        catch {
            try {
                await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
            } catch {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    }
});
// CONTEXT MENUS
client.on("interactionCreate", async interaction => {
    if (!interaction.isContextMenuCommand) return;
    const context = client.contexts.get(interaction.commandName);
    if (!context) return;
    try { await context.execute(client, interaction); }
    catch (error) {
        console.error(error);
        try { await interaction.reply({ content: "There was an error while executing this context-menu!", ephemeral: true }); }
        catch {
            try {
                await interaction.editReply({ content: 'There was an error while executing this context-menu!', ephemeral: true });
            } catch {
                await interaction.followUp({ content: 'There was an error while executing this context-menu!', ephemeral: true });
            }
        }
    }
});
// MESSAGE CREATE (GIF FILTER)
client.on("messageCreate", async message => {
    if (message.content.includes(".gif") || message.content.includes("tenor.com") || message.content.includes("giphy.com") || message.content.includes("imgur.com")) {
        console.log(`> GIF MESSAGES by ${message.author.username} ${message.author.id} at ${new Date().toLocaleString()}: ${message.id}`);
        if (message.channel.id == client.guilds.cache.get(guildId).channels.cache.find(channel => channel.name == "gifs-and-memes").id) return;
        if (message.channel.id == client.guilds.cache.get(guildId).channels.cache.find(channel => channel.name == "age-restricted").id) return;
        let gifAuthor = message.author;
        let gifChannel = message.channel;
        await gifChannel.messages.fetch({ limit: 90 });
        gifMessages = gifChannel.messages.cache.filter(message => message.author.id == gifAuthor.id && (message.content.includes(".gif") || message.content.includes("tenor.com") || message.content.includes("giphy.com") || message.content.includes("imgur.com")) && message.createdTimestamp >= (Date.now() - 30*60*1000));
        let amountOfMessages = 0;
        await gifMessages.forEach(() => amountOfMessages += 1);
        if (amountOfMessages >= 3) {
            const gifTrackerObject = client.gifTracker.find(object => object.id == message.author.id);
            if (!gifTrackerObject) {
                client.gifTracker.push({"id": message.author.id, "level": 1});
            } else if (gifTrackerObject.level >= 1 && gifTrackerObject.level <=5 ) {
                const member = message.guild.members.cache.get(message.author.id);
                let now = new Date();
                const night = new Date();
                night.setHours(24, 0, 0, 0);
                const milisecondsToMidnight = night.getTime() - now.getTime();
                const times = [10*1000, 1*60*1000-15*1000, 5*60*1000-15*1000, 10*60*1000-15*1000, 60*60*1000-15*1000, milisecondsToMidnight, 24*60*60*1000];
                if (message.author.id != "575696318228463637") {
                    member.timeout(times[gifTrackerObject.level], "Gif spamming");
                    console.log(`> TIMEOUT user ${message.author.username} ${message.author.id} for ${times[gifTrackerObject.level]} at ${new Date().toLocaleString()}`);
                    gifTrackerObject["level"] += 1;
                }
            } else if (gifTrackerObject.level > 5) {
                const member = message.guild.members.cache.get(message.author.id);
                if (message.author.id != "575696318228463637") {
                    member.timeout(24*60*60*1000, "Gif spamming (evation)");
                    console.log(`> TIMEOUT EVATION user ${message.author.username} ${message.author.id} for ${times[gifTrackerObject.level]} at ${new Date().toLocaleString()}`);
                }
            }
            await gifMessages.forEach(async message => {
                await message.delete();
            });
        }
    }
});
// VOICE STATE UPDATE (CHECK EMPTY TEMPORARY CHANNELS)
client.on("voiceStateUpdate", async function(oldMember, newMember) {
    await client.temporaryVoiceChannels.forEach(channel => {
        if (channel.members.size == 0 && Number(channel.createdTimestamp) < Number(Date.now() - 20000)) {
            client.temporaryVoiceChannels.splice(client.temporaryVoiceChannels.indexOf(channel), 1);
            channel.delete();
        }
    });
});
// BUTTONS (MUSIC CONTROLS)
client.on("interactionCreate", async interaction => {
    if (!interaction.isButton()) return;
    if (interaction.customId == "playPause") {
        if (!client.queue.connection.paused) {
            await interaction.update({ content: `Paused "${client.queue.nowPlaying().title}".` });
            return await client.queue.setPaused(true);
        } else {
            await interaction.update({ content: `Started playing "${client.queue.nowPlaying().title}".` });
            return await client.queue.setPaused(false);
        }
    } else if (interaction.customId == "stop") {
        await interaction.update({ content: `Stopped playing "${client.queue.nowPlaying().title}".` });
        return await client.queue.stop();
    } else if (interaction.customId == "skip") {
        await interaction.update({ content: `Skipped "${client.queue.nowPlaying().title}".` });
        return await client.queue.skip();
    }
});
// MUSIC: TRACK START
client.player.on("trackStart", async function(queue, track) {
    const controls = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("playPause").setEmoji("⏯").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("stop").setEmoji("⏹️").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("skip").setEmoji("⏭️").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setLabel("Open in Browser").setURL(track.url).setStyle(ButtonStyle.Link)
    );
    client.followUpInteraction = await queue.metadata.interaction.followUp({ content: `Started playing "${track.title}".`, components: [controls] });
});
// MUSIC: TRACK END
client.player.on("trackEnd", async function(queue, track) {
    await client.followUpInteraction.edit({ components: [] });
    setTimeout(async function(message){
        await message.delete();
    }, 15000, client.followUpInteraction);
});
// MIDNIGHT (CLEAR GIF STATS AND VOICE CHANNEL TEXT)
schedule.scheduleJob("0 0 * * *", () => {
    client.gifTracker = [];
    let filteredChannels = client.guilds.cache.get(guildId).channels.cache.filter(channel => channel.type == ChannelType.GuildVoice);
    filteredChannels.forEach(async (channel) => {
        var fetchedMessages = await channel.messages.fetch(true);
        while (fetchedMessages.size != 0) {
            fetchedMessages = await channel.messages.fetch(true);
            await channel.bulkDelete(fetchedMessages);
        }
    });
});
client.login(token);