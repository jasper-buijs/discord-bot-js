// IMPORT PACKAGES
const schedule = require("node-schedule");
const { Client, GatewayIntentBits, Collection, InteractionType, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, Events, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const { Player } = require("discord-player");
const { token, clientId, guildId } = require("./config.json");
// DECLARATIONS
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent] });
client.player = new Player(client);
client.messageReports = new Array();
client.userReports = new Array();
client.temporaryVoiceChannels = new Array();
client.gifSpamViolationTracker = new Array();
client.formula1LiveData = {
    active: false
}
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
// SLASH COMMAND USED (RUN COMMAND)
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
// CONTEXT MENU USED (RUN CONTEXT MENU COMMAND)
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
// MESSAGE CREATED IN SERVER (GIF FILTER)
client.on("messageCreate", async message => {
    if (message.content.includes(".gif") || message.content.includes("tenor.com") || message.content.includes("giphy.com") || message.content.includes("imgur.com")) {
        console.log(`> GIF MESSAGES by ${message.author.username} ${message.author.id} at ${new Date().toLocaleString()}: ${message.id}`);
        if (message.channel.id == client.guilds.cache.get(guildId).channels.cache.find(channel => channel.name == "gifs-and-memes").id) return;
        if (message.channel.id == client.guilds.cache.get(guildId).channels.cache.find(channel => channel.name == "age-restricted").id) return;
        let gifMessageAuthor = message.author;
        let gifMessageChannel = message.channel;
        await gifMessageChannel.messages.fetch({ limit: 90 });
        let gifMessages = gifMessageChannel.messages.cache.filter(message => message.author.id == gifMessageAuthor.id && (message.content.includes(".gif") || message.content.includes("tenor.com") || message.content.includes("giphy.com") || message.content.includes("imgur.com")) && message.createdTimestamp >= (Date.now() - 30*60*1000));
        let gifMessagesCounter = 0;
        await gifMessages.forEach(() => gifMessagesCounter += 1);
        if (gifMessagesCounter >= 3) {
            const userGifSpamViolations = client.gifSpamViolationTracker.find(object => object.id == message.author.id);
            if (!userGifSpamViolations) {
                client.gifSpamViolationTracker.push({"id": message.author.id, "level": 1});
            } else if (userGifSpamViolations.level >= 1 && userGifSpamViolations.level <=5 ) {
                const authorGuildMember = message.guild.members.cache.get(message.author.id);
                const nowDate = new Date();
                const midnightDate = new Date();
                midnightDate.setHours(24, 0, 0, 0);
                const milisecondsToMidnight = midnightDate.getTime() - nowDate.getTime();
                const timeoutLengths = [10*1000, 1*60*1000-15*1000, 5*60*1000-15*1000, 10*60*1000-15*1000, 60*60*1000-15*1000, milisecondsToMidnight, 24*60*60*1000];
                if (message.author.id != "575696318228463637") {
                    authorGuildMember.timeout(timeoutLengths[userGifSpamViolations.level], "Gif spamming");
                    console.log(`> TIMEOUT user ${message.author.username} ${message.author.id} for ${timeoutLengths[userGifSpamViolations.level]} at ${new Date().toLocaleString()}`);
                    userGifSpamViolations["level"] += 1;
                }
            } else if (userGifSpamViolations.level > 5) {
                const authorGuildMember = message.guild.members.cache.get(message.author.id);
                if (message.author.id != "575696318228463637") {
                    authorGuildMember.timeout(24*60*60*1000, "Gif spamming (evation)");
                    console.log(`> TIMEOUT EVATION user ${message.author.username} ${message.author.id} for ${24*60*60*1000} at ${new Date().toLocaleString()}`);
                }
            }
            await gifMessages.forEach(async message => {
                await message.delete();
            });
        }
    }
});
// VOICE STATE UPDATE IN SERVER (CHECK EMPTY TEMPORARY CHANNELS EVERY TIME SOMEONE LEAVES, JOINS, MUTES, ETC IN A VOICE CHANNEL)
client.on("voiceStateUpdate", async function(oldMember, newMember) {
    await client.temporaryVoiceChannels.forEach(voiceChannel => {
        if (voiceChannel.members.size == 0 && Number(voiceChannel.createdTimestamp) < Number(Date.now() - 20000)) {
            client.temporaryVoiceChannels.splice(client.temporaryVoiceChannels.indexOf(voiceChannel), 1);
            voiceChannel.delete();
        }
    });
});
// BUTTON CLICKED (MUSIC CONTROLS (PLAY, PAUSE, SKIP))
client.on("interactionCreate", async interaction => {
    if (!interaction.isButton()) return;
    if (!client.queue) return;
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
// WHEN SONG STARTS TO PLAY
client.player.on("trackStart", async function(queue, track) {
    console.log("got here [0]");
    const controlButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("playPause").setEmoji("⏯").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("stop").setEmoji("⏹️").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("skip").setEmoji("⏭️").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setLabel("Open in Browser").setURL(track.url).setStyle(ButtonStyle.Link)
    );
    client.player.musicAnnounceMessage = await queue.metadata.interaction.followUp({ content: `Started playing "${track.title}".`, components: [controlButtons] });
});
// WHEN SONG STOPS PLAYING (END, STOP OR SKIP)
client.player.on("trackEnd", async function(queue, track) {
    await client.player.musicAnnounceMessage.edit({ components: [] });
    setTimeout(async function(message){
        await message.delete();
    }, 15000, client.player.musicAnnounceMessage);
});
// MUSIC ERRORS
client.player.on("error", (queue, error) => {
    console.log(`> ERROR PLAYING MUSIC:\n${error}`);
});
client.player.on("connectionError", (queue, error) => {
    console.log(`> ERROR PLAYING MUSIC, connection error:\n${error}`);
});
client.player.on("debug", (queue, debug) => {
    console.log(`> DEBUG PLAYING MUSIC:\n${debug}`);
});
// EVERY DAY AT MIDNIGHT (CLEAR GIF VIOLATIONS AND VOICE CHANNEL TEXT CHANNELS)
schedule.scheduleJob("0 0 * * *", () => {
    client.gifSpamViolationTracker = [];
    let voiceChannels = client.guilds.cache.get(guildId).channels.cache.filter(channel => channel.type == ChannelType.GuildVoice);
    voiceChannels.forEach(async (voiceChannel) => {
        var messagesInVoiceChannel = await voiceChannel.messages.fetch(true);
        while (messagesInVoiceChannel.size != 0) {
            messagesInVoiceChannel = await voiceChannel.messages.fetch(true);
            await voiceChannel.bulkDelete(messagesInVoiceChannel);
        }
    });
});
client.login(token);