// IMPORT PACKAGES
const schedule = require("node-schedule");
const { Client, GatewayIntentBits, Collection, InteractionType, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, Events, EmbedBuilder, ActivityType, MessageFlags } = require("discord.js");
const fs = require("fs");
const parse = require("csv-parse");
const { Player } = require("discord-player");
const { token, clientId, guildId } = require("./config.json");
// FORCE PLAY-DL DUE TO BUG WITH YTDL-CORE
process.env.DP_FORCE_YTDL_MOD="play-dl";
// DECLARATIONS
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent] });
client.player = new Player(client);
client.player.extractors.loadDefault();
client.messageReports = new Array();
client.userReports = new Array();
client.temporaryVoiceChannels = new Array();
client.gifSpamViolationTracker = new Array();
const { createChannel } = require("./commands/create_private_conversation");
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
    if (newMember.channel) {
        if (newMember.channel.name == "the abyss of awkwardness") {
            let voiceChannelId = await createChannel(client, newMember.member, null);
            newMember.member.voice.setChannel(voiceChannelId);
        }
    }
});
// BUTTON CLICKED (MUSIC CONTROLS (PLAY, PAUSE, SKIP))
client.on("interactionCreate", async interaction => {
    if (!interaction.isButton()) return;
    if (!client.queue) return;
    if (interaction.customId == "playPause") {
        if (!(await client.queue.node.isPaused())) {
            await interaction.update({ content: `Paused "${client.queue.currentTrack.title}".` });
            return await client.queue.node.pause();
        } else {
            await interaction.update({ content: `Started playing "${client.queue.currentTrack.title}".` });
            return await client.queue.node.resume();
        }
    } else if (interaction.customId == "stop") {
        await interaction.update({ content: `Stopped playing "${client.queue.currentTrack.title}".` });
        //return await client.queue.delete();
        //await client.queue.clear();
        //return await client.queue.node.skip();
        return await client.queue.node.stop();
    } else if (interaction.customId == "skip") {
        await interaction.update({ content: `Skipped "${client.queue.currentTrack.title}".` });
        return await client.queue.node.skip();
    }
});
// WHEN SONG STARTS TO PLAY
client.player.events.on("playerStart", async function(queue, track) {
    client.queue = queue;
    const controlButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("playPause").setEmoji("⏯").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("stop").setEmoji("⏹️").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("skip").setEmoji("⏭️").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setLabel("Open in Browser").setURL(track.url).setStyle(ButtonStyle.Link)
    );
    console.log(`> MUSIC playing "${track.title}" (${track.url}) by ${queue.metadata.requestMember.displayName}`);
    client.user.setPresence({ activities: [{ name: track.title, type: ActivityType.Playing }], status: "online" });
    client.player.musicControlsMessage = await queue.metadata.textChannel.send({ content: `Started playing "${track.title}", as requested by <@${track.requestedBy.id}>.`, components: [controlButtons], flags: [MessageFlags.SuppressNotifications] });
});
// WHEN SONG STOPS PLAYING (END, STOP OR SKIP)
client.player.events.on("playerFinish", async function(queue, track) {
    // if (!client.player.musicControlsMessage.fetch()) return console.log("> DEBUG - MUSIC crash caught on index.js:156");
    await client.player.musicControlsMessage.edit({ components: [] }).catch(err => {
        return console.log("> UNKNOWN ERROR with MUSIC: " + err);
    });
    setTimeout(async function(message){
        await message.delete().catch();
    }, 15000, client.player.musicControlsMessage);
    client.user.setPresence({ activities: [], status: "online" });
});
// MUSIC ERRORS
client.player.events.on("error", (queue, error) => {
    console.log(`> ERROR PLAYING MUSIC:\n${error}`);
});
client.player.events.on("playerError", (queue, error) => {
    console.log(`> ERROR PLAYING MUSIC, connection error:\n${error}`);
});
// EVERY DAY AT MIDNIGHT (CLEAR GIF VIOLATIONS, COMMAND LINE AND VOICE CHANNEL TEXT CHANNELS)
schedule.scheduleJob("0 0 * * *", async () => {
    client.gifSpamViolationTracker = [];
    await client.guilds.cache.get(guildId).channels.fetch();
    let voiceChannels = client.guilds.cache.get(guildId).channels.cache.filter(channel => channel.type == ChannelType.GuildVoice);
    voiceChannels.forEach(async (voiceChannel) => {
        var messagesInVoiceChannel = await voiceChannel.messages.fetch(true);
        while (messagesInVoiceChannel.size != 0) {
            messagesInVoiceChannel = await voiceChannel.messages.fetch(true);
            await voiceChannel.bulkDelete(messagesInVoiceChannel);
        }
    });
    let commandLineChannels = client.guilds.cache.get(guildId).channels.cache.filter(channel => channel.name == "command-line");
    //let commandLineChannel = client.guilds.cache.get(guildId).channels.fetch().filter(channel => channel.name == "command-line");
    //await commandLineChannels[0].fetch(true);
    commandLineChannels.forEach(async (commandLineChannel) => {
        var messagesInCommandLineChannel = await commandLineChannel.messages.fetch(true);
        while (messagesInCommandLineChannel.size != 0) {
            messagesInCommandLineChannel = await commandLineChannel.messages.fetch(true);
            await commandLineChannel.bulkDelete(messagesInCommandLineChannel);
        }
    });
});
// EVERY DAY AT THREE AM (CHECK RALLLY UPDATES)
client.on("ready", async () => {
    await client.guilds.cache.get(guildId).roles.fetch();
    const userIDs = new Object({
        "Alp": "490480466466570240",
        "Emily": "333598839959453706",
        "Ferre": "467773625852887060",
        "Maarten": "283642353158193152",
        "Jasper": "575696318228463637",
        "Wout": "363375727669673984",
        "Aaron": "520573632515276804",
        "Thor": "533319049476833310",
        "Thomas": "268083266949611520",
        "Lucas": "585886134467559427",
        "Luca": "224207870441291776",
        "Mane": "254307858148098048",
        "Dario": "902212154441211934",
        "Brammert": "338577600253394945",
        "Ruben": "423566704703176724",
        "Yoran": "288359564351635457"
    });
    const roles = new Object({
        "Yes": client.guilds.cache.get(guildId).roles.cache.find(r => r.name == "Rallly - Available"),
        "If need be": client.guilds.cache.get(guildId).roles.cache.find(r => r.name == "Rallly - If need be"),
        "No": client.guilds.cache.get(guildId).roles.cache.find(r => r.name == "Rallly - Unavailable")
    });
    fs.readFile(`./rallly-data/${String(guildId)}.csv`, async function (err, csvData) {
        // const whenRalllyJobTime = `0,${String(Number(new Date().toString().split(" ")[4].split(":")[1]) + 1)} 3,${String(new Date().toString().split(" ")[4].split(":")[0])} * * *`;
        const whenRalllyJobTime = [`10 0 * * *`, new Date(Date.now() + 30000)];
        whenRalllyJobTime.forEach(time => {
            schedule.scheduleJob(time, async () => {
                console.log("> ", new Date().toTimeString());
                parse.parse(csvData, {delimiter: ","}, async function (err, array) {
                    for (i = 1; i < array[0].length; i++) {
                        var day = array[0][i].split(" ")[1];
                        var month = array[0][i].split(" ")[2];
                        var today = new Date().toDateString().split(" ")[2].startsWith("0") ? new Date().toDateString().split(" ")[2].replace("0", "") : new Date().toDateString().split(" ")[2];
                        var thisMonth = new Date().toDateString().split(" ")[1];
                        if (day == today && month == thisMonth) {
                            for (j = 1; j < array.length; j++) {
                                const member = await client.guilds.cache.get(guildId).members.fetch(userIDs[array[j][0]]);
                                await member.roles.remove([roles["Yes"], roles["If need be"], roles["No"]]);
                                await member.roles.add(roles[array[j][i]]);
                                console.log(`> Assigned ${array[j][0]} role ${array[j][i]} on ${new Date().toDateString()}`);
                            }
                        }
                    }
                });
            });
        });
    });
});
client.login(token);