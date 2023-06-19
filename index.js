// IMPORT PACKAGES
const schedule = require("node-schedule");
const { Client, GatewayIntentBits, Collection, InteractionType, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, Events, EmbedBuilder, ActivityType, MessageFlags } = require("discord.js");
const fs = require("fs");
const { Player } = require("discord-player");
const { token, clientId, guildId, riotAPIToken } = require("./config.json");
const { monitorEventLoopDelay } = require("perf_hooks");
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
    await client.player.musicControlsMessage.edit({ components: [] });
    setTimeout(async function(message){
        await message.delete();
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
// EVERY 15 MINUTES (RIOT API)
schedule.scheduleJob(Date.now()+500, async () => {
    const requestOptions = new Object({
        method: "GET",
        headers: {
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Riot-Token": riotAPIToken
        }
    });
    // LOL EUW (euw1.api.riotgames.com/lol/status/v4)
    const euwRespons = await fetch("https://euw1.api.riotgames.com/lol/status/v4/platform-data", requestOptions);
    console.log("> LOL EUW", euwRespons.status, euwRespons.statusText);
    if (euwRespons.status != 200) return console.error(`> LOL EUW request failed with code ${euwRespons.status, euwRespons.statusText} and these headers:\n${euwRespons.headers}`);
    const euwData = await euwRespons.json();
    // LOL PBE (pbe1.api.riotgames.com/lol/status/v4)
    const pbeRespons = await fetch("https://pbe1.api.riotgames.com/lol/status/v4/platform-data", requestOptions);
    console.log("> LOL PBE", pbeRespons.status, pbeRespons.statusText);
    if (pbeRespons.status != 200) return console.error(`> LOL PBE request failed with code ${pbeRespons.status, pbeRespons.statusText} and these headers:\n${pbeRespons.headers}`);
    const pbeData = await pbeRespons.json();
    // TFT EUW (euw1.api.riotgames.com/tft/status/v1)
    /*const tft_euwRespons = await fetch("https://euw1.api.riotgames.com/tft/status/v1/platform-data", requestOptions);
    console.log("> TFT EUW", tft_euwRespons.status, tft_euwRespons.statusText);
    if (tft_euwRespons.status != 200) return console.error(`> TFT EUW request failed with code ${tft_euwRespons.status, tft_euwRespons.statusText} and these headers:\n${tft_euwRespons.headers}`);
    const tft_euwData = await tft_euwRespons.json();
    // TFT PBE (pbe1.api.riotgames.com/tft/status/v1)
    const tft_pbeRespons = await fetch("https://pbe1.api.riotgames.com/tft/status/v1/platform-data", requestOptions);
    console.log("> TFT PBE", tft_pbeRespons.status, tft_pbeRespons.statusText);
    if (tft_pbeRespons.status != 200) return console.error(`> TFT PBE request failed with code ${tft_pbeRespons.status, tft_pbeRespons.statusText} and these headers:\n${tft_pbeRespons.headers}`);
    const tft_pbeData = await tft_pbeRespons.json();*/

    // PARSE LOL EUW INCIDENTS
    var euwMaintenances = new Array();
    var euwIncidents = new Array();

    // gather messages
    await client.guilds.cache.get(guildId).channels.fetch();
    var statusChannel = client.guilds.cache.get(guildId).channels.cache.find(c => c.name == "service-status");
    let sendMessages = await statusChannel.messages.fetch();
    sendMessages.forEach(async message => {
        if (message.author.id == client.user.id) {
            let id = await message.embeds[0].footer.text.substring(3, 8);
            let color = await message.embeds[0].hexColor;
            await euwData.maintenances.forEach(async m => {
                console.log(m.id, id);
                console.log(color, "#800080");
                if (m.id == id && color == "#800080") {
                    euwMaintenances.push(m);
                    // edit discord message
                }
            });
            await euwData.incidents.forEach(async i => {
                console.log(i.id == id);
                console.log(["#e60000", "#ffa500"].includes(color));
                if (i.id == id && ["#e60000", "#ffa500"].includes(color)) {
                    euwIncidents.push(i);
                    console.log("PUSHED", i, euwIncidents);
                    // edit discord message
                }
            });
        }
    });
    console.log(euwIncidents, euwMaintenances);

    // send new messages
    console.log(euwData.incidents[0]);
    euwData.maintenances.forEach(async maintenance => {
        if (!euwMaintenances.find(m => m.id == maintenance.id)) {
            //if (maintenance.maintenance_status == "scheduled" && Number(new Date(maintenance.archive_at) - new Date()) < 0) {
            if (maintenance.maintenance_status == "scheduled" && maintenance.archive_at == null) {
                let embed = new EmbedBuilder()
                    .setAuthor({ name: `Riot Games Service Status`, url: "https://status.riotgames.com/lol?region=euw1&locale=en_US"})
                    .setColor("#800080")
                    .setFooter({ text: `ID: ${maintenance.id} • Platforms affected: ${maintenance.platforms.join(", ")}` })
                    .setTimestamp(Date.parse(maintenance.created_at))
                    .setTitle(`:tools: ${maintenance.titles[0].content}`)
                maintenance.updates.forEach(update => {
                    //embed.addFields({ name: `Update ${new Date(update.created_at).toLocaleString("en-GB", { timeZone: "Europe/Brussels" }) }`, value: update.translations[0].content });
                    if (Date.parse(update.created_at) - Date.parse(maintenance.created_at) < 5000 && Date.parse(update.created_at) - Date.parse(maintenance.created_at) > -5000) embed.setDescription(update.translations[0].content);
                    else embed.addFields({ name: `Update ${new Date(update.created_at).toLocaleString("en-GB", { timeZone: "Europe/Brussels" }) }`, value: update.translations[0].content });
                });
                await statusChannel.send({ content: "", embeds: [embed] });
            }
        }
    });
    euwData.incidents.forEach(async incident => {
        if (!euwIncidents.find(i => i.id == incident.id)) {
            //if (Number(new Date(incident.archive_at) - new Date()) < 0) {
            if (incident.archive_at == null) {
                let embed = new EmbedBuilder()
                    .setAuthor({ name: `Riot Games Service Status`, url: "https://status.riotgames.com/lol?region=euw1&locale=en_US"})
                    .setColor(incident.incident_severity == "warning" ? "#ffa500" : "#e60000")
                    .setFooter({ text: `ID: ${incident.id} • Platforms affected: ${incident.platforms.join(", ")}`})
                    .setTimestamp(Date.parse(incident.created_at))
                    .setTitle(`${incident.incident_severity == "warning" ? ":warning:" : ":no_entry_sign:"} ${incident.titles[0].content}`)
                incident.updates.forEach(update => {
                    //embed.addFields({ name: `Update ${new Date(update.created_at).toLocaleString("en-GB", { timeZone: "Europe/Brussels" }) }`, value: update.translations[0].content });
                    if (Date.parse(update.created_at) - Date.parse(incident.created_at) < 5000 && Date.parse(update.created_at) - Date.parse(incident.created_at) > -5000) embed.setDescription(update.translations[0].content);
                    else embed.addFields({ name: `Update ${new Date(update.created_at).toLocaleString("en-GB", { timeZone: "Europe/Brussels" }) }`, value: update.translations[0].content });
                });
                await statusChannel.send({ content: "", embeds: [embed] });
            }
        }
    });
});
client.login(token);