// IMPORT PACKAGES
const schedule = require("node-schedule");
const { Client, GatewayIntentBits, Collection, InteractionType, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, Events, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const { Player } = require("discord-player");
const { token, clientId, guildId } = require("./config.json");
// DECLARATIONS
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent] });
client.player = new Player(client);
client.messageReports = new Array();
client.userReports = new Array();
client.temporaryVoiceChannels = new Array();
client.gifSpamViolationTracker = new Array();
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
// EXAMEN PLANNER 2 **TMP** [m h d m dom]
// jan 4
schedule.scheduleJob("0 11 4 1 *", () => {
    const messageText = "**BLOK JANUARI 2023**\n\
Zoals beloofd, vind je hier het overzicht van iedereens examens. Je vindt in dit bericht alle examens op de eerstvolgende dag waarop examens vallen. Dit bericht zal dan ook geüpdatet worden, telkens om 19u. In de kalender in bijlage vind je ook een overzicht van alle examens. Dit bericht kun je steeds terugvinden bij \"Pinned Messages\" in de rechterbovenhoek.\n\n\
*Examens op donderdag, 5 januari 2023:*\n\
- Ruben: Wiskunde\n\n\
PS Omwille van de blok verjaren Thor en Ruben dit jaar op 23 en 25 februari. Iedereen die hun in januari een gelukkige verjaardag wenst zal uitgelachen worden.\n";
    client.guilds.cache.get(guildId).channels.cache.find(channel => channel.name == "general").send(messageText).then(message => {
        message.pin()
        client.examMessageId = message.id;
    });
    client.guilds.cache.get(guildId).channels.cache.find(channel => channel.name == "general").send("https://media.discordapp.net/attachments/810479802741817358/1059807241605226506/blok_overzicht.png")
});
// jan 5
schedule.scheduleJob("0 19 5 1 *", () => {
    const messageText = "**BLOK JANUARI 2023**\n\
Zoals beloofd, vind je hier het overzicht van iedereens examens. Je vindt in dit bericht alle examens op de eerstvolgende dag waarop examens vallen. Dit bericht zal dan ook geüpdatet worden, telkens om 19u. In de kalender in bijlage vind je ook een overzicht van alle examens. Dit bericht kun je steeds terugvinden bij \"Pinned Messages\" in de rechterbovenhoek.\n\n\
*Examens op donderdag, 12 januari 2023:*\n\
- Jasper: Wijsbegeerte\n\n\
PS Omwille van de blok verjaren Thor en Ruben dit jaar op 23 en 25 februari respectievelijk. Iedereen die hun in januari een gelukkige verjaardag wenst zal uitgelachen worden.\n";
    console.log(client.examMessageId);
    client.guilds.cache.get(guildId).channels.cache.find(channel => channel.name == "general").messages.fetch(client.examMessageId).then(message => message.edit(messageText));
});
// jan 12
schedule.scheduleJob("0 19 12 1 *", () => {
    const messageText = "**BLOK JANUARI 2023**\n\
Zoals beloofd, vind je hier het overzicht van iedereens examens. Je vindt in dit bericht alle examens op de eerstvolgende dag waarop examens vallen. Dit bericht zal dan ook geüpdatet worden, telkens om 19u. In de kalender in bijlage vind je ook een overzicht van alle examens. Dit bericht kun je steeds terugvinden bij \"Pinned Messages\" in de rechterbovenhoek.\n\n\
*Examens op vrijdag, 13 januari 2023:*\n\
- Brammert, Luca en Thor: Accountancy\n\
- Alp: Algebra\n\n\
PS Omwille van de blok verjaren Thor en Ruben dit jaar op 23 en 25 februari respectievelijk. Iedereen die hun in januari een gelukkige verjaardag wenst zal uitgelachen worden.\n";
    client.guilds.cache.get(guildId).channels.cache.find(channel => channel.name == "general").messages.fetch(client.examMessageId).then(message => message.edit(messageText));
});
// jan 13
schedule.scheduleJob("0 19 13 1 *", () => {
    const messageText = "**BLOK JANUARI 2023**\n\
Zoals beloofd, vind je hier het overzicht van iedereens examens. Je vindt in dit bericht alle examens op de eerstvolgende dag waarop examens vallen. Dit bericht zal dan ook geüpdatet worden, telkens om 19u. In de kalender in bijlage vind je ook een overzicht van alle examens. Dit bericht kun je steeds terugvinden bij \"Pinned Messages\" in de rechterbovenhoek.\n\n\
*Examens op maandag, 16 januari 2023:*\n\
- Alp: Algebra\n\n\
PS Omwille van de blok verjaren Thor en Ruben dit jaar op 23 en 25 februari respectievelijk. Iedereen die hun in januari een gelukkige verjaardag wenst zal uitgelachen worden.\n";
    client.guilds.cache.get(guildId).channels.cache.find(channel => channel.name == "general").messages.fetch(client.examMessageId).then(message => message.edit(messageText));
});
// jan 16
schedule.scheduleJob("0 19 14 1 *", () => {
    const messageText = "**BLOK JANUARI 2023**\n\
Zoals beloofd, vind je hier het overzicht van iedereens examens. Je vindt in dit bericht alle examens op de eerstvolgende dag waarop examens vallen. Dit bericht zal dan ook geüpdatet worden, telkens om 19u. In de kalender in bijlage vind je ook een overzicht van alle examens. Dit bericht kun je steeds terugvinden bij \"Pinned Messages\" in de rechterbovenhoek.\n\n\
*Examens op dinsdag, 17 januari 2023:*\n\
- Maarten: Maths and Physics\n\
- Thomas: Chemie\n\n\
PS Omwille van de blok verjaren Thor en Ruben dit jaar op 23 en 25 februari respectievelijk. Iedereen die hun in januari een gelukkige verjaardag wenst zal uitgelachen worden.\n";
    client.guilds.cache.get(guildId).channels.cache.find(channel => channel.name == "general").messages.fetch(client.examMessageId).then(message => message.edit(messageText));
});
// jan 17
schedule.scheduleJob("0 19 17 1 *", () => {
    const messageText = "**BLOK JANUARI 2023**\n\
Zoals beloofd, vind je hier het overzicht van iedereens examens. Je vindt in dit bericht alle examens op de eerstvolgende dag waarop examens vallen. Dit bericht zal dan ook geüpdatet worden, telkens om 19u. In de kalender in bijlage vind je ook een overzicht van alle examens. Dit bericht kun je steeds terugvinden bij \"Pinned Messages\" in de rechterbovenhoek.\n\n\
*Examens op woensdag, 18 januari 2023:*\n\
- Wout: Programmeren\n\
- Brammert: Wiskunde\n\n\
PS Omwille van de blok verjaren Thor en Ruben dit jaar op 23 en 25 februari respectievelijk. Iedereen die hun in januari een gelukkige verjaardag wenst zal uitgelachen worden.\n";
    client.guilds.cache.get(guildId).channels.cache.find(channel => channel.name == "general").messages.fetch(client.examMessageId).then(message => message.edit(messageText));
});
// jan 18
schedule.scheduleJob("0 19 18 1 *", () => {
    const messageText = "**BLOK JANUARI 2023**\n\
Zoals beloofd, vind je hier het overzicht van iedereens examens. Je vindt in dit bericht alle examens op de eerstvolgende dag waarop examens vallen. Dit bericht zal dan ook geüpdatet worden, telkens om 19u. In de kalender in bijlage vind je ook een overzicht van alle examens. Dit bericht kun je steeds terugvinden bij \"Pinned Messages\" in de rechterbovenhoek.\n\n\
*Examens op donderdag, 19 januari 2023:*\n\
- Jasper: Celbiologie II\n\n\
PS Omwille van de blok verjaren Thor en Ruben dit jaar op 23 en 25 februari respectievelijk. Iedereen die hun in januari een gelukkige verjaardag wenst zal uitgelachen worden.\n";
    client.guilds.cache.get(guildId).channels.cache.find(channel => channel.name == "general").messages.fetch(client.examMessageId).then(message => message.edit(messageText));
});
// jan 19
schedule.scheduleJob("0 19 19 1 *", () => {
    const messageText = "**BLOK JANUARI 2023**\n\
Zoals beloofd, vind je hier het overzicht van iedereens examens. Je vindt in dit bericht alle examens op de eerstvolgende dag waarop examens vallen. Dit bericht zal dan ook geüpdatet worden, telkens om 19u. In de kalender in bijlage vind je ook een overzicht van alle examens. Dit bericht kun je steeds terugvinden bij \"Pinned Messages\" in de rechterbovenhoek.\n\n\
*Examens op vrijdag, 20 januari 2023:*\n\
- Luca en Thor: Hogere Wiskunde I\n\
- Alp: Analyse\n\
- Maarten: Visual Languages\n\n\
PS Omwille van de blok verjaren Thor en Ruben dit jaar op 23 en 25 februari respectievelijk. Iedereen die hun in januari een gelukkige verjaardag wenst zal uitgelachen worden.\n";
    client.guilds.cache.get(guildId).channels.cache.find(channel => channel.name == "general").messages.fetch(client.examMessageId).then(message => message.edit(messageText));
});
// jan 20
schedule.scheduleJob("0 19 20 1 *", () => {
    const messageText = "**BLOK JANUARI 2023**\n\
Zoals beloofd, vind je hier het overzicht van iedereens examens. Je vindt in dit bericht alle examens op de eerstvolgende dag waarop examens vallen. Dit bericht zal dan ook geüpdatet worden, telkens om 19u. In de kalender in bijlage vind je ook een overzicht van alle examens. Dit bericht kun je steeds terugvinden bij \"Pinned Messages\" in de rechterbovenhoek.\n\n\
*Examens op maandag, 23 januari 2023:*\n\
- Wout: Wiskunde I\n\
- Brammert: Sociologie\n\
- Thomas: Biofysica\n\n\
PS Omwille van de blok verjaren Thor en Ruben dit jaar op 23 en 25 februari respectievelijk. Iedereen die hun in januari een gelukkige verjaardag wenst zal uitgelachen worden.\n";
    client.guilds.cache.get(guildId).channels.cache.find(channel => channel.name == "general").messages.fetch(client.examMessageId).then(message => message.edit(messageText));
});
// jan 23
schedule.scheduleJob("0 19 23 1 *", () => {
    const messageText = "**BLOK JANUARI 2023**\n\
Zoals beloofd, vind je hier het overzicht van iedereens examens. Je vindt in dit bericht alle examens op de eerstvolgende dag waarop examens vallen. Dit bericht zal dan ook geüpdatet worden, telkens om 19u. In de kalender in bijlage vind je ook een overzicht van alle examens. Dit bericht kun je steeds terugvinden bij \"Pinned Messages\" in de rechterbovenhoek.\n\n\
*Examens op woensdag, 25 januari 2023:*\n\
- Alp: Mechanica\n\n\
PS Omwille van de blok verjaren Thor en Ruben dit jaar op 23 en 25 februari respectievelijk. Iedereen die hun in januari een gelukkige verjaardag wenst zal uitgelachen worden.\n";
    client.guilds.cache.get(guildId).channels.cache.find(channel => channel.name == "general").messages.fetch(client.examMessageId).then(message => message.edit(messageText));
});
// jan 25
schedule.scheduleJob("0 19 25 1 *", () => {
    const messageText = "**BLOK JANUARI 2023**\n\
Zoals beloofd, vind je hier het overzicht van iedereens examens. Je vindt in dit bericht alle examens op de eerstvolgende dag waarop examens vallen. Dit bericht zal dan ook geüpdatet worden, telkens om 19u. In de kalender in bijlage vind je ook een overzicht van alle examens. Dit bericht kun je steeds terugvinden bij \"Pinned Messages\" in de rechterbovenhoek.\n\n\
*Examens op donderdag, 26 januari 2023:*\n\
- Jasper: Celbiologie I\n\
- Thomas: Ecologie en Evolutie\n\
- Emily: Leraar in Dialoog\n\n\
PS Omwille van de blok verjaren Thor en Ruben dit jaar op 23 en 25 februari respectievelijk. Iedereen die hun in januari een gelukkige verjaardag wenst zal uitgelachen worden.\n";
    client.guilds.cache.get(guildId).channels.cache.find(channel => channel.name == "general").messages.fetch(client.examMessageId).then(message => message.edit(messageText));
});
// jan 26
schedule.scheduleJob("0 19 26 1 *", () => {
    const messageText = "**BLOK JANUARI 2023**\n\
Zoals beloofd, vind je hier het overzicht van iedereens examens. Je vindt in dit bericht alle examens op de eerstvolgende dag waarop examens vallen. Dit bericht zal dan ook geüpdatet worden, telkens om 19u. In de kalender in bijlage vind je ook een overzicht van alle examens. Dit bericht kun je steeds terugvinden bij \"Pinned Messages\" in de rechterbovenhoek.\n\n\
*Examens op vrijdag, 27 januari 2023:*\n\
- Wout: Computersystemen\n\
- Luca en Thor: Beleidsinformatica\n\
- Brammert: Programmeren\n\
- Maarten: Platform Development\n\n\
PS Omwille van de blok verjaren Thor en Ruben dit jaar op 23 en 25 februari respectievelijk. Iedereen die hun in januari een gelukkige verjaardag wenst zal uitgelachen worden.\n";
    client.guilds.cache.get(guildId).channels.cache.find(channel => channel.name == "general").messages.fetch(client.examMessageId).then(message => message.edit(messageText));
});
// jan 27
schedule.scheduleJob("0 19 27 1 *", () => {
    const messageText = "**BLOK JANUARI 2023**\n\
Zoals beloofd, vind je hier het overzicht van iedereens examens. Je vindt in dit bericht alle examens op de eerstvolgende dag waarop examens vallen. Dit bericht zal dan ook geüpdatet worden, telkens om 19u. In de kalender in bijlage vind je ook een overzicht van alle examens. Dit bericht kun je steeds terugvinden bij \"Pinned Messages\" in de rechterbovenhoek.\n\n\
*Examens op maandag, 30 januari 2023:*\n\
- Brammert: Psychologie\n\
- Alp: Scheikunde\n\n\
PS Omwille van de blok verjaren Thor en Ruben dit jaar op 23 en 25 februari respectievelijk. Iedereen die hun in januari een gelukkige verjaardag wenst zal uitgelachen worden.\n";
    client.guilds.cache.get(guildId).channels.cache.find(channel => channel.name == "general").messages.fetch(client.examMessageId).then(message => message.edit(messageText));
});
// jan 30
schedule.scheduleJob("0 19 30 1 *", () => {
    const messageText = "**BLOK JANUARI 2023**\n\
Zoals beloofd, vind je hier het overzicht van iedereens examens. Je vindt in dit bericht alle examens op de eerstvolgende dag waarop examens vallen. Dit bericht zal dan ook geüpdatet worden, telkens om 19u. In de kalender in bijlage vind je ook een overzicht van alle examens. Dit bericht kun je steeds terugvinden bij \"Pinned Messages\" in de rechterbovenhoek.\n\n\
*Examens op dinsdag, 31 januari 2023:*\n\
- Wout: Logica\n\
- Thomas: Wiskunde I\n\n\
PS Omwille van de blok verjaren Thor en Ruben dit jaar op 23 en 25 februari respectievelijk. Iedereen die hun in januari een gelukkige verjaardag wenst zal uitgelachen worden.\n";
    client.guilds.cache.get(guildId).channels.cache.find(channel => channel.name == "general").messages.fetch(client.examMessageId).then(message => message.edit(messageText));
});
// jan 31
schedule.scheduleJob("0 19 31 1 *", () => {
    const messageText = "**BLOK JANUARI 2023**\n\
Zoals beloofd, vind je hier het overzicht van iedereens examens. Je vindt in dit bericht alle examens op de eerstvolgende dag waarop examens vallen. Dit bericht zal dan ook geüpdatet worden, telkens om 19u. In de kalender in bijlage vind je ook een overzicht van alle examens. Dit bericht kun je steeds terugvinden bij \"Pinned Messages\" in de rechterbovenhoek.\n\n\
*Examens op vrijdag, 3 februari 2023:*\n\
- Jasper: Biostatistiek\n\
- Brammert, Luca en Thor: Markten en Prijzen\n\n\
PS Omwille van de blok verjaren Thor en Ruben dit jaar op 23 en 25 februari respectievelijk. Iedereen die hun in januari een gelukkige verjaardag wenst zal uitgelachen worden.\n";
    client.guilds.cache.get(guildId).channels.cache.find(channel => channel.name == "general").messages.fetch(client.examMessageId).then(message => message.edit(messageText));
});
// feb 3
schedule.scheduleJob("0 19 3 2 *", () => {
    const messageText = "**BLOK JANUARI 2023**\n\
Zoals beloofd, vind je hier het overzicht van iedereens examens. In de kalender in bijlage vind je een overzicht van alle examens. Dit bericht kun je steeds terugvinden bij \"Pinned Messages\" in de rechterbovenhoek.\n\n\
PS Omwille van de blok verjaren Thor en Ruben dit jaar op 23 en 25 februari respectievelijk. Iedereen die hun in januari een gelukkige verjaardag wenst zal uitgelachen worden.\n";
    client.guilds.cache.get(guildId).channels.cache.find(channel => channel.name == "general").messages.fetch(client.examMessageId).then(message => message.edit(messageText));
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