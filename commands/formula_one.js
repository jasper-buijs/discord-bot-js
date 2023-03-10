const Discord = require("discord.js");
const { SlashCommandBuilder, PermissionFlagsBits, ThreadAutoArchiveDuration, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, GuildScheduledEventStatus } = require('discord.js');
const { request, GraphQLClient, gql } = require("graphql-request");
const { clientId, guildId } = require("../config.json");
const schedule = require("node-schedule");
module.exports = {
    data: new SlashCommandBuilder().setName("formula1").setDescription("Behind the scenes commands for F1 2023.").setDefaultMemberPermissions(PermissionFlagsBits.Administrator).addSubcommandGroup(group =>
        group.setName("live-session").setDescription("Link to Multiviewer for F1 for live broadcast.").addSubcommand(command =>
            command.setName("start").setDescription("Link Multiviewer for F1 for a live session.").addStringOption(option =>
                option.setName("event-id").setDescription("ID of the Discord Event for the session.").setRequired(true)).addStringOption(option =>
                option.setName("ip").setDescription("IP adress where F1MV is running.").setRequired(false))).addSubcommand(command =>
            command.setName("stop").setDescription("Stop the link with F1MV."))).addSubcommandGroup(group =>
        group.setName("message").setDescription("Send an F1 graphic in this channel with buttons.").addSubcommand(command =>
            command.setName("circuit").setDescription("Send the Circuit graphic in this channel.").addAttachmentOption(option =>
                option.setName("graphic").setDescription("The graphic to send in this channel.").setRequired(true)).addStringOption(option =>
                option.setName("url").setDescription("The url to the circuit information.").setRequired(true))).addSubcommand(command =>
            command.setName("grid").setDescription("Send the Starting Grid graphic in this channel.").addAttachmentOption(option =>
                option.setName("graphic").setDescription("The graphic to send in this channel.").setRequired(true)).addStringOption(option =>
                option.setName("qualy-url").setDescription("The url to the qualifying results.").setRequired(true)).addStringOption(option =>
                option.setName("grid-url").setDescription("The url to the starting grid.").setRequired(true))).addSubcommand(command =>
            command.setName("result").setDescription("Send the Race Result graphic in this channel.").addAttachmentOption(option =>
                option.setName("graphic").setDescription("The graphic to send in this channel.").setRequired(true)).addStringOption(option =>
                option.setName("result-url").setDescription("The url to the race results.").setRequired(true)).addStringOption(option =>
                option.setName("report-url").setDescription("The url to the race report.").setRequired(true)).addStringOption(option =>
                option.setName("highlights-url").setDescription("The url to the highlights.").setRequired(false))).addSubcommand(command =>
            command.setName("penalty").setDescription("Send the Penalty graphic in this channel.").addAttachmentOption(option =>
                option.setName("graphic").setDescription("The graphic to send in this channel.").setRequired(true)).addStringOption(option =>
                option.setName("url").setDescription("The url to the penalty report.").setRequired(true))).addSubcommand(command =>
            command.setName("other").setDescription("Send the Race Result graphic in this channel.").addAttachmentOption(option =>
                option.setName("graphic").setDescription("The graphic to send in this channel.").setRequired(true)).addStringOption(option =>
                option.setName("button1-label").setDescription("The label for the first button.").setRequired(false)).addStringOption(option =>
                option.setName("button1-url").setDescription("The url for the first button.").setRequired(false)).addStringOption(option =>
                option.setName("button2-label").setDescription("The label for the second button.").setRequired(false)).addStringOption(option =>
                option.setName("button2-url").setDescription("The url for the second button.").setRequired(false)).addStringOption(option =>
                option.setName("button3-label").setDescription("The label for the third button.").setRequired(false)).addStringOption(option =>
                option.setName("button3-url").setDescription("The url for the third button.").setRequired(false))).addSubcommand(command =>
            command.setName("news").setDescription("Send the Race Result graphic in this channel.").addAttachmentOption(option =>
                option.setName("graphic").setDescription("The graphic to send in this channel.").setRequired(true)).addStringOption(option =>
                option.setName("button1-label").setDescription("The label for the first button.").setRequired(false)).addStringOption(option =>
                option.setName("button1-url").setDescription("The url for the first button.").setRequired(false)).addStringOption(option =>
                option.setName("button2-label").setDescription("The label for the second button.").setRequired(false)).addStringOption(option =>
                option.setName("button2-url").setDescription("The url for the second button.").setRequired(false)).addStringOption(option =>
                option.setName("button3-label").setDescription("The label for the third button.").setRequired(false)).addStringOption(option =>
                option.setName("button3-url").setDescription("The url for the third button.").setRequired(false)))),
    async execute(client, interaction) {
        await interaction.deferReply({ephemeral: true});
        if (interaction.options.getSubcommandGroup() == "live-session") {
            if (interaction.options.getSubcommand() == "start") {
                const ip = interaction.options.getString("ip") ?? "192.168.0.156";
                const port = "10101";
                const source = String("http://" + ip + ":" + port + "/api/graphql");
                const apiClient = new GraphQLClient(source, { headers: {} });
                const query = gql`query InitialQuery {
                    version
                    systemInfo {
                        platform
                        arch
                    }
                    liveTimingClock {
                        trackTime
                    }
                    liveTimingState {
                        ExtrapolatedClock
                        LapCount
                        RaceControlMessages
                        SessionData
                        SessionInfo
                        TrackStatus
                        WeatherData
                    }
                }`;
                let data = new Object();
                try {
                    data = await apiClient.request(query);
                } catch {
                    console.log("> ERROR could not find graphql api");
                    return interaction.editReply({ content: "Could not find graphql api.", ephemeral: true });
                }
                while (!data.liveTimingClock && !data.liveTimingState.ExtrapolatedClock && !data.liveTimingState.RaceControlMessages && !data.liveTimingState.SessionData && !data.liveTimingState.SessionInfo && !data.liveTimingState.TrackStatus && !data.liveTimingState.WeatherData) {
                    data = await apiClient.request(query);
                }
                client.formula1LiveData.lastRCMessageIndex = -1;
                client.formula1LiveData.active = true
                const thread = await client.guilds.cache.get(guildId).channels.cache.find(channel => channel.name == "general").threads.create({
                    name: data.liveTimingState.SessionInfo.Name,
                    autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
                    reason: "live f1 session",
                    type: ChannelType.PrivateThread
                });
                await interaction.editReply({ content: `A thread has been created for race control messages: <#${thread.id}>.`, ephemeral: true });
                await client.guilds.cache.get(guildId).members.fetch();
                await client.guilds.cache.get(guildId).roles.fetch();
                /*await client.guilds.cache.get(guildId).members.cache.filter(member => member.roles.cache.find(role => role.name == "Formula 1")).forEach(member => {
                    thread.members.add(member.id);
                });*/
                await Promise.all(client.guilds.cache.get(guildId).members.cache.filter(member => member.roles.cache.find(role => role.name == "Formula 1")).map(async (member) => {
                    await thread.members.add(member.id);
                }))
                await client.guilds.cache.get(guildId).scheduledEvents.fetch(true);
                client.formula1LiveData.event = await client.guilds.cache.get(guildId).scheduledEvents.cache.get(interaction.options.getString("event-id"));
                const eventStartTime = await client.formula1LiveData.event.scheduledStartAt;
                schedule.scheduleJob(eventStartTime, async function() {
                    await client.formula1LiveData.event.setStatus(GuildScheduledEventStatus.Active);
                });
                await thread.send({ content: await client.formula1LiveData.event.url ?? "did not find event url" });
                const windDirections = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
                const windDirection = windDirections[(Math.round(Number(data.liveTimingState.WeatherData.WindDirection * 8 / 360), 0) + 8)%8];
                await thread.send({ content: `**CURRENT CONDITIONS:**\nAir Temperature: ${data.liveTimingState.WeatherData.AirTemp}°C\nTrack Temperature: ${data.liveTimingState.WeatherData.TrackTemp}°C\nHumidity: ${data.liveTimingState.WeatherData.Humidity}%\nPressure: ${data.liveTimingState.WeatherData.Pressure}hPa\nRain: ${String(Boolean(Number(data.liveTimingState.WeatherData.Rainfall)))}\nWind Direction: ${windDirection}\nWind Speed: ${data.liveTimingState.WeatherData.WindSpeed}kph\n**TTS INFORMATION**\nThe race control messages also support Text To Speech.\nTo enable it, make sure tts is enabled in \`User Settings\`>\`Accessibility\`>\`Text-To-Speech\`.\nThen, pop out the live stream to a diffrent window and make sure this channel is focused in Discord.` });
                client.formula1LiveData.apiJob = schedule.scheduleJob("*/3 * * * * *", async function() {
                    data = await apiClient.request(query);
                    if (data.liveTimingState.RaceControlMessages.Messages[client.formula1LiveData.lastRCMessageIndex + 1]) {
                        if (client.formula1LiveData.lastRCMessageIndex == -1) await thread.send({ content: "**RACE CONTROL MESSAGES:**" });
                        client.formula1LiveData.lastRCMessageIndex += 1;
                        var message = data.liveTimingState.RaceControlMessages.Messages[client.formula1LiveData.lastRCMessageIndex].Message;
                        var ttsMessage = data.liveTimingState.RaceControlMessages.Messages[client.formula1LiveData.lastRCMessageIndex].Message;
                        ttsMessage = await ttsMessage.toLowerCase();
                        ttsMessage = await ttsMessage.replace(/(car)?(s)?\s[0-9]{1,2}\s\((ver)\)/g, "Verstappen");
                        ttsMessage = await ttsMessage.replace(/(car)?(s)?\s[0-9]{1,2}\s\((per)\)/g, "Perez");
                        ttsMessage = await ttsMessage.replace(/(car)?(s)?\s[0-9]{1,2}\s\((lec)\)/g, "Leclerc");
                        ttsMessage = await ttsMessage.replace(/(car)?(s)?\s[0-9]{1,2}\s\((sai)\)/g, "Sainz");
                        ttsMessage = await ttsMessage.replace(/(car)?(s)?\s[0-9]{1,2}\s\((rus)\)/g, "Russell");
                        ttsMessage = await ttsMessage.replace(/(car)?(s)?\s[0-9]{1,2}\s\((ham)\)/g, "Hamilton");
                        ttsMessage = await ttsMessage.replace(/(car)?(s)?\s[0-9]{1,2}\s\((oco)\)/g, "Ocon");
                        ttsMessage = await ttsMessage.replace(/(car)?(s)?\s[0-9]{1,2}\s\((gas)\)/g, "Gasly");
                        ttsMessage = await ttsMessage.replace(/(car)?(s)?\s[0-9]{1,2}\s\((pia)\)/g, "Piastri");
                        ttsMessage = await ttsMessage.replace(/(car)?(s)?\s[0-9]{1,2}\s\((nor)\)/g, "Norris");
                        ttsMessage = await ttsMessage.replace(/(car)?(s)?\s[0-9]{1,2}\s\((bot)\)/g, "Bottas");
                        ttsMessage = await ttsMessage.replace(/(car)?(s)?\s[0-9]{1,2}\s\((zho)\)/g, "Zhou");
                        ttsMessage = await ttsMessage.replace(/(car)?(s)?\s[0-9]{1,2}\s\((str)\)/g, "Stroll");
                        ttsMessage = await ttsMessage.replace(/(car)?(s)?\s[0-9]{1,2}\s\((alo)\)/g, "Alonso");
                        ttsMessage = await ttsMessage.replace(/(car)?(s)?\s[0-9]{1,2}\s\((mag)\)/g, "Magnussen");
                        ttsMessage = await ttsMessage.replace(/(car)?(s)?\s[0-9]{1,2}\s\((hul)\)/g, "Hulkenberg");
                        ttsMessage = await ttsMessage.replace(/(car)?(s)?\s[0-9]{1,2}\s\((dev)\)/g, "De Vries");
                        ttsMessage = await ttsMessage.replace(/(car)?(s)?\s[0-9]{1,2}\s\((tsu)\)/g, "Tsunoda");
                        ttsMessage = await ttsMessage.replace(/(car)?(s)?\s[0-9]{1,2}\s\((alb)\)/g, "Albon");
                        ttsMessage = await ttsMessage.replace(/(car)?(s)?\s[0-9]{1,2}\s\((sar)\)/g, "Sargeant");
                        ttsMessage = await ttsMessage.replace(/(car)?(s)?\s[0-9]{1,2}\s\((msc)\)/g, "Schumacher");
                        ttsMessage = await ttsMessage.replace(/(car)?(s)?\s[0-9]{1,2}\s\((gio)\)/g, "Giovinazzi");
                        ttsMessage = await ttsMessage.replace(/(car)?(s)?\s[0-9]{1,2}\s\((shw)\)/g, "Shwartzman");
                        ttsMessage = await ttsMessage.replace(/(car)?(s)?\s[0-9]{1,2}\s\((ric)\)/g, "Ricciardo");
                        ttsMessage = await ttsMessage.replace(/(car)?(s)?\s[0-9]{1,2}\s\((law)\)/g, "Lawson");
                        ttsMessage = await ttsMessage.replace(/(car)?(s)?\s[0-9]{1,2}\s\((pal)\)/g, "Palou");
                        ttsMessage = await ttsMessage.replace(/(car)?(s)?\s[0-9]{1,2}\s\((van)\)/g, "Vandoorne");
                        ttsMessage = await ttsMessage.replace(/(car)?(s)?\s[0-9]{1,2}\s\((dru)\)/g, "Drugovich");
                        ttsMessage = await ttsMessage.replace(/(car)?(s)?\s[0-9]{1,2}\s\((pou)\)/g, "Pourchaire");
                        ttsMessage = await ttsMessage.replace(/(car)?(s)?\s[0-9]{1,2}\s\((fit)\)/g, "Fittipaldi");
                        ttsMessage = await ttsMessage.replace(/(car)?(s)?\s[0-9]{1,2}\s\((doo)\)/g, "Doohan");
                        ttsMessage = await ttsMessage.replace(" drs ", " DRS ");
                        let discordMessage;
                        if (!message.includes("BLUE FLAG")) discordMessage = await thread.send({ content: ttsMessage, tts: true }); // HIDE BLUE FLAGS
                        if (data.liveTimingState.RaceControlMessages.Messages[client.formula1LiveData.lastRCMessageIndex].Lap) message = String(message + " `Lap " + data.liveTimingState.RaceControlMessages.Messages[client.formula1LiveData.lastRCMessageIndex].Lap + "`"); // BROKEN BEFORE
                        if (message.includes("CORRECTION")) message = String(":adhesive_bandage: " + message);
                        else if (message.includes("CLEAR")) message = String("<:green:994885574685097994> " + message);
                        else if (message.includes("CHEQUERED")) message = String(":checkered_flag: " + message);
                        else if (message.includes("DOUBLE YELLOW")) message = String("<:doubleyellow:994885572285960202> " + message);
                        else if (message.includes("YELLOW")) message = String("<:yellow:994885583694467112> " + message);
                        else if (message.includes("RED")) message = String("<:red:994885578317373461> " + message);
                        // else if (message.includes("BLUE FLAG")) message = String("<:blue:749223932015542292> " + message); // BLUE FLAG
                        else if (message.includes("NOTED")) message = String(":pen_ballpoint: " + message);
                        else if (message.includes("UNDER INVESTIGATION")) message = String(":mag_right: " + message);
                        else if (message.includes("NO FURTHER")) message = String(":white_check_mark: " + message);
                        else if (message.includes("AFTER THE SESSION") || message.includes("AFTER THE RACE")) message = String(":warning: " + message);
                        else if (message.includes("PENALTY")) message = String(":no_entry_sign: " + message);
                        else if (message.includes("DELETED")) message = String(":wastebasket: " + message);
                        else if (message.includes("BLACK FLAG")) message = String(":flag_black: " + message);
                        else if (message.includes("BLACK AND WHITE FLAG")) message = String("<:black_white:994888778177065010> " + message);
                        else if (message.includes("BLACK AND ORANGE FLAG")) message = String("<:black_orange:749223932015542272> " + message);
                        else if (message.includes("VIRTUAL SAFETY CAR DEPLOYED")  || message.includes("VIRTUAL SAFETY CAR ENDING")) message = String("<:vscar:994885581840584715> " + message);
                        else if (message.includes("SAFETY CAR DEPLOYED") || message.includes("SAFETY CAR IN THIS LAP")) message = String("<:scar:994885579563089960> " + message);
                        else if (message.includes("ROLLING START")) message = String("<:rstart:994892063264997446> " + message);
                        else if (message.includes("STANDING START")) message = String("<:sstart:994892066884685854> " + message);
                        else if (message.includes("SAFETY CAR THROUGH THE PIT LANE")) message = String("<:scthroughpit:994896277349339226> " + message);
                        else if (message.includes("PIT LANE ENTRY CLOSED")) message = String("<:pitentryclosed:994896274195234917> " + message);
                        else if (message.includes("PIT LANE ENTRY OPEN")) message = String("<:pitentryopen:994896276103626782> " + message);
                        else if (message.includes("DRS ENABLED")) message = String("<:drsenabled:994948528755462144> " + message);
                        else if (message.includes("DRS DISABLED")) message = String("<:drsdisabled:994948527182585968> " + message);
                        else if (message.includes("PIT EXIT OPEN")) message = String("<:pitexitopen:994885576832593993> " + message);
                        else if (message.includes("PIT EXIT CLOSED")) message = String("<:pitexitclosed:994885575855308851> " + message);
                        else if (message.includes("EXTRA FORMATION LAP")) message = String("<:addformationlap:994885571019296798> " + message);
                        else if (message.includes("START ABORTED") || message.includes("START PROCEDURE SUSPENDED") || message.includes("START SUSPENDED")) message = String("<:startaborted:994885580863316049> " + message);
                        else if (message.includes("STOPPED")) message = String("<:stopped:995023796102774895> " + message);
                        else if (message.includes("SPUN")) message = String("<:spun:995023793703616593> " + message);
                        else if (message.includes("OFF TRACK")) message = String("<:offtrack:995023791853949080> " + message);
                        else if (message.includes("RISK OF RAIN") || message.includes("CHANGE IN CLIMATIC CONDITIONS")) message = String(":cloud_rain: " + message);
                        else if (message.includes("SLIPPERY") || message.includes("LOW GRIP CONDITIONS")) message = String(":oil: " + message);
                        else if (message.includes("WILL RESUME")) message = String(":stopwatch: " + message);
                        else if (message.includes("WILL NOT RESUME")) message = String(":no_entry: " + message);
                        else if (message.includes("RECOVERY VEHICLE")) message = String(":tractor: " + message);
                        else message = String(":white_small_square: " + message);
                        if (!message.includes("BLUE FLAG")) await discordMessage.edit({ content: message }); // HIDE BLUE FLAGS
                    }
                });
            } else if (interaction.options.getSubcommand() == "stop") {
                client.formula1LiveData.active = false;
                await client.formula1LiveData.apiJob.cancel();
                await interaction.editReply({ content: "Live conection stopped.", ephemeral: true });
            }
        } else if (interaction.options.getSubcommandGroup() == "message") {
            if (interaction.options.getSubcommand() == "circuit") {
                if (interaction.channel.isThread()) {
                    await client.guilds.cache.get(guildId).channels.fetch(interaction.channel.parentId);
                    const parentChannel = client.guilds.cache.get(guildId).channels.cache.get(interaction.channel.parentId);
                    const webhook = await parentChannel.createWebhook({ name: "Formula 1 #results", avatar: "https://media.discordapp.net/attachments/842889568922632237/1080468629495238737/f1logo_webhook.png" });
                    const buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Circuit Statistics").setURL(interaction.options.getString("url")));
                    await webhook.send({ components: [buttons], files: [{ attachment: interaction.options.getAttachment("graphic").url, name: "circuit.png" }], threadId: interaction.channelId });
                    await webhook.delete();
                    await interaction.editReply({ content: "Your're message has been send.", ephemeral: true });
                } else {
                    await client.guilds.cache.get(guildId).channels.fetch(interaction.channelId);
                    const channel = client.guilds.cache.get(guildId).channels.cache.get(interaction.channelId);
                    const webhook = await channel.createWebhook({ name: "Formula 1 #results", avatar: "https://media.discordapp.net/attachments/842889568922632237/1080468629495238737/f1logo_webhook.png" });
                    const buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Circuit Statistics").setURL(interaction.options.getString("url")));
                    await webhook.send({ components: [buttons], files: [{ attachment: interaction.options.getAttachment("graphic").url, name: "circuit.png" }] });
                    await webhook.delete();
                    await interaction.editReply({ content: "Your're message has been send.", ephemeral: true });
                }
            } else if (interaction.options.getSubcommand() == "grid") {
                if (interaction.channel.isThread()) {
                    await client.guilds.cache.get(guildId).channels.fetch(interaction.channel.parentId);
                    const parentChannel = client.guilds.cache.get(guildId).channels.cache.get(interaction.channel.parentId);
                    const webhook = await parentChannel.createWebhook({ name: "Formula 1 #results", avatar: "https://media.discordapp.net/attachments/842889568922632237/1080468629495238737/f1logo_webhook.png" });
                    const buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Qualifying Results").setURL(interaction.options.getString("qualy-url")), new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Starting Grid").setURL(interaction.options.getString("grid-url")));
                    await webhook.send({ components: [buttons], files: [{ attachment: interaction.options.getAttachment("graphic").url, name: "starting-grid.png" }], threadId: interaction.channelId });
                    await webhook.delete();
                    await interaction.editReply({ content: "Your're message has been send.", ephemeral: true });
                } else {
                    await client.guilds.cache.get(guildId).channels.fetch(interaction.channelId);
                    const channel = client.guilds.cache.get(guildId).channels.cache.get(interaction.channelId);
                    const webhook = await channel.createWebhook({ name: "Formula 1 #results", avatar: "https://media.discordapp.net/attachments/842889568922632237/1080468629495238737/f1logo_webhook.png" });
                    const buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Qualifying Results").setURL(interaction.options.getString("qualy-url")), new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Starting Grid").setURL(interaction.options.getString("grid-url")));
                    await webhook.send({ components: [buttons], files: [{ attachment: interaction.options.getAttachment("graphic").url, name: "starting-grid.png" }] });
                    await webhook.delete();
                    await interaction.editReply({ content: "Your're message has been send.", ephemeral: true });
                }
            } else if (interaction.options.getSubcommand() == "result") {
                if (interaction.channel.isThread()) {
                    await client.guilds.cache.get(guildId).channels.fetch(interaction.channel.parentId);
                    const parentChannel = client.guilds.cache.get(guildId).channels.cache.get(interaction.channel.parentId);
                    const webhook = await parentChannel.createWebhook({ name: "Formula 1 #results", avatar: "https://media.discordapp.net/attachments/842889568922632237/1080468629495238737/f1logo_webhook.png" });
                    //const buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Qualifying Results").setURL(interaction.options.getString("qualy-url")), new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Starting Grid").setURL(interaction.options.getString("grid-url")));
                    var buttons = new String();
                    if (interaction.options.getString("highlights-url")) { buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Race Results").setURL(interaction.options.getString("result-url")), new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Race Report").setURL(interaction.options.getString("report-url")), new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Highlights").setURL(interaction.options.getString("highlights-url"))); }
                    else { buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Race Results").setURL(interaction.options.getString("result-url")), new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Race Report").setURL(interaction.options.getString("report-url"))); }
                    await webhook.send({ components: [buttons], files: [{ attachment: interaction.options.getAttachment("graphic").url, name: "race-results.png" }], threadId: interaction.channelId });
                    await webhook.delete();
                    await interaction.editReply({ content: "Your're message has been send.", ephemeral: true });
                } else {
                    await client.guilds.cache.get(guildId).channels.fetch(interaction.channelId);
                    const channel = client.guilds.cache.get(guildId).channels.cache.get(interaction.channelId);
                    const webhook = await channel.createWebhook({ name: "Formula 1 #results", avatar: "https://media.discordapp.net/attachments/842889568922632237/1080468629495238737/f1logo_webhook.png" });
                    //const buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Qualifying Results").setURL(interaction.options.getString("qualy-url")), new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Starting Grid").setURL(interaction.options.getString("grid-url")));
                    var buttons = new String();
                    if (interaction.options.getString("highlights-url")) { buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Race Results").setURL(interaction.options.getString("result-url")), new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Race Report").setURL(interaction.options.getString("report-url")), new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Highlights").setURL(interaction.options.getString("highlights-url"))); }
                    else { buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Race Results").setURL(interaction.options.getString("result-url")), new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Race Report").setURL(interaction.options.getString("report-url"))); }
                    await webhook.send({ components: [buttons], files: [{ attachment: interaction.options.getAttachment("graphic").url, name: "race-results.png" }] });
                    await webhook.delete();
                    await interaction.editReply({ content: "Your're message has been send.", ephemeral: true });
                }
            } else if (interaction.options.getSubcommand() == "penalty") {
                if (interaction.channel.isThread()) {
                    await client.guilds.cache.get(guildId).channels.fetch(interaction.channel.parentId);
                    const parentChannel = client.guilds.cache.get(guildId).channels.cache.get(interaction.channel.parentId);
                    const webhook = await parentChannel.createWebhook({ name: "Formula 1 #results", avatar: "https://media.discordapp.net/attachments/842889568922632237/1080468629495238737/f1logo_webhook.png" });
                    const buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Penalty Report").setURL(interaction.options.getString("url")));
                    await webhook.send({ components: [buttons], files: [{ attachment: interaction.options.getAttachment("graphic").url, name: "penalty.png" }], threadId: interaction.channelId });
                    await webhook.delete();
                    await interaction.editReply({ content: "Your're message has been send.", ephemeral: true });
                } else {
                    await client.guilds.cache.get(guildId).channels.fetch(interaction.channelId);
                    const channel = client.guilds.cache.get(guildId).channels.cache.get(interaction.channelId);
                    const webhook = await channel.createWebhook({ name: "Formula 1 #results", avatar: "https://media.discordapp.net/attachments/842889568922632237/1080468629495238737/f1logo_webhook.png" });
                    const buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Penalty Report").setURL(interaction.options.getString("url")));
                    await webhook.send({ components: [buttons], files: [{ attachment: interaction.options.getAttachment("graphic").url, name: "penalty.png" }] });
                    await webhook.delete();
                    await interaction.editReply({ content: "Your're message has been send.", ephemeral: true });
                }
            } else if (interaction.options.getSubcommand() == "other") {
                if (interaction.channel.isThread()) {
                    await client.guilds.cache.get(guildId).channels.fetch(interaction.channel.parentId);
                    const parentChannel = client.guilds.cache.get(guildId).channels.cache.get(interaction.channel.parentId);
                    const webhook = await parentChannel.createWebhook({ name: "Formula 1 #results", avatar: "https://media.discordapp.net/attachments/842889568922632237/1080468629495238737/f1logo_webhook.png" });
                    //const buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Circuit Stats").setURL(interaction.options.getString("url")));
                    //await webhook.send({ components: [buttons], files: [{ attachment: interaction.options.getAttachment("graphic").url, name: "graphic.png" }], threadId: interaction.channelId });
                    if (!(interaction.options.getString("button1-label") && interaction.options.getString("button1-url"))) {
                        await webhook.send({ files: [{ attachment: interaction.options.getAttachment("graphic").url, name: "graphic.png" }], threadId: interaction.channelId });
                    } else if (!(interaction.options.getString("button2-label") && interaction.options.getString("button2-url"))) {
                        const buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(interaction.options.getString("button1-label")).setURL(interaction.options.getString("button1-url")));
                        await webhook.send({ components: [buttons], files: [{ attachment: interaction.options.getAttachment("graphic").url, name: "graphic.png" }], threadId: interaction.channelId });
                    } else if (!(interaction.options.getString("button3-label") && interaction.options.getString("button3-url"))) {
                        const buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(interaction.options.getString("button1-label")).setURL(interaction.options.getString("button1-url")), new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(interaction.options.getString("button2-label")).setURL(interaction.options.getString("button2-url")));
                        await webhook.send({ components: [buttons], files: [{ attachment: interaction.options.getAttachment("graphic").url, name: "graphic.png" }], threadId: interaction.channelId });
                    } else {
                        const buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(interaction.options.getString("button1-label")).setURL(interaction.options.getString("button1-url")), new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(interaction.options.getString("button2-label")).setURL(interaction.options.getString("button2-url")), new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(interaction.options.getString("button3-label")).setURL(interaction.options.getString("button3-url")));
                        await webhook.send({ components: [buttons], files: [{ attachment: interaction.options.getAttachment("graphic").url, name: "graphic.png" }], threadId: interaction.channelId });
                    } 
                    await webhook.delete();
                    await interaction.editReply({ content: "Your're message has been send.", ephemeral: true });
                } else {
                    await client.guilds.cache.get(guildId).channels.fetch(interaction.channelId);
                    const channel = client.guilds.cache.get(guildId).channels.cache.get(interaction.channelId);
                    const webhook = await channel.createWebhook({ name: "Formula 1 #results", avatar: "https://media.discordapp.net/attachments/842889568922632237/1080468629495238737/f1logo_webhook.png" });
                    //const buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Circuit Stats").setURL(interaction.options.getString("url")));
                    //await webhook.send({ components: [buttons], files: [{ attachment: interaction.options.getAttachment("graphic").url, name: "graphic.png" }] });
                    if (!(interaction.options.getString("button1-label") && interaction.options.getString("button1-url"))) {
                        await webhook.send({ files: [{ attachment: interaction.options.getAttachment("graphic").url, name: "graphic.png" }] });
                    } else if (!(interaction.options.getString("button2-label") && interaction.options.getString("button2-url"))) {
                        const buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(interaction.options.getString("button1-label")).setURL(interaction.options.getString("button1-url")));
                        await webhook.send({ components: [buttons], files: [{ attachment: interaction.options.getAttachment("graphic").url, name: "graphic.png" }] });
                    } else if (!(interaction.options.getString("button3-label") && interaction.options.getString("button3-url"))) {
                        const buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(interaction.options.getString("button1-label")).setURL(interaction.options.getString("button1-url")), new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(interaction.options.getString("button2-label")).setURL(interaction.options.getString("button2-url")));
                        await webhook.send({ components: [buttons], files: [{ attachment: interaction.options.getAttachment("graphic").url, name: "graphic.png" }] });
                    } else {
                        const buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(interaction.options.getString("button1-label")).setURL(interaction.options.getString("button1-url")), new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(interaction.options.getString("button2-label")).setURL(interaction.options.getString("button2-url")), new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(interaction.options.getString("button3-label")).setURL(interaction.options.getString("button3-url")));
                        await webhook.send({ components: [buttons], files: [{ attachment: interaction.options.getAttachment("graphic").url, name: "graphic.png" }] });
                    }
                    await webhook.delete();
                    await interaction.editReply({ content: "Your're message has been send.", ephemeral: true });
                }
            } else if (interaction.options.getSubcommand() == "news") {
                if (interaction.channel.isThread()) {
                    await client.guilds.cache.get(guildId).channels.fetch(interaction.channel.parentId);
                    const parentChannel = client.guilds.cache.get(guildId).channels.cache.get(interaction.channel.parentId);
                    const webhook = await parentChannel.createWebhook({ name: "Formula 1 #news", avatar: "https://media.discordapp.net/attachments/842889568922632237/1080468629495238737/f1logo_webhook.png" });
                    //const buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Circuit Stats").setURL(interaction.options.getString("url")));
                    //await webhook.send({ components: [buttons], files: [{ attachment: interaction.options.getAttachment("graphic").url, name: "graphic.png" }], threadId: interaction.channelId });
                    if (!(interaction.options.getString("button1-label") && interaction.options.getString("button1-url"))) {
                        await webhook.send({ files: [{ attachment: interaction.options.getAttachment("graphic").url, name: "graphic.png" }], threadId: interaction.channelId });
                    } else if (!(interaction.options.getString("button2-label") && interaction.options.getString("button2-url"))) {
                        const buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(interaction.options.getString("button1-label")).setURL(interaction.options.getString("button1-url")));
                        await webhook.send({ components: [buttons], files: [{ attachment: interaction.options.getAttachment("graphic").url, name: "graphic.png" }], threadId: interaction.channelId });
                    } else if (!(interaction.options.getString("button3-label") && interaction.options.getString("button3-url"))) {
                        const buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(interaction.options.getString("button1-label")).setURL(interaction.options.getString("button1-url")), new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(interaction.options.getString("button2-label")).setURL(interaction.options.getString("button2-url")));
                        await webhook.send({ components: [buttons], files: [{ attachment: interaction.options.getAttachment("graphic").url, name: "graphic.png" }], threadId: interaction.channelId });
                    } else {
                        const buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(interaction.options.getString("button1-label")).setURL(interaction.options.getString("button1-url")), new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(interaction.options.getString("button2-label")).setURL(interaction.options.getString("button2-url")), new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(interaction.options.getString("button3-label")).setURL(interaction.options.getString("button3-url")));
                        await webhook.send({ components: [buttons], files: [{ attachment: interaction.options.getAttachment("graphic").url, name: "graphic.png" }], threadId: interaction.channelId });
                    } 
                    await webhook.delete();
                    await interaction.editReply({ content: "Your're message has been send.", ephemeral: true });
                } else {
                    await client.guilds.cache.get(guildId).channels.fetch(interaction.channelId);
                    const channel = client.guilds.cache.get(guildId).channels.cache.get(interaction.channelId);
                    const webhook = await channel.createWebhook({ name: "Formula 1 #news", avatar: "https://media.discordapp.net/attachments/842889568922632237/1080468629495238737/f1logo_webhook.png" });
                    //const buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Circuit Stats").setURL(interaction.options.getString("url")));
                    //await webhook.send({ components: [buttons], files: [{ attachment: interaction.options.getAttachment("graphic").url, name: "graphic.png" }] });
                    if (!(interaction.options.getString("button1-label") && interaction.options.getString("button1-url"))) {
                        await webhook.send({ files: [{ attachment: interaction.options.getAttachment("graphic").url, name: "graphic.png" }], threadId: interaction.channelId });
                    } else if (!(interaction.options.getString("button2-label") && interaction.options.getString("button2-url"))) {
                        const buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(interaction.options.getString("button1-label")).setURL(interaction.options.getString("button1-url")));
                        await webhook.send({ components: [buttons], files: [{ attachment: interaction.options.getAttachment("graphic").url, name: "graphic.png" }] });
                    } else if (!(interaction.options.getString("button3-label") && interaction.options.getString("button3-url"))) {
                        const buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(interaction.options.getString("button1-label")).setURL(interaction.options.getString("button1-url")), new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(interaction.options.getString("button2-label")).setURL(interaction.options.getString("button2-url")));
                        await webhook.send({ components: [buttons], files: [{ attachment: interaction.options.getAttachment("graphic").url, name: "graphic.png" }] });
                    } else {
                        const buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(interaction.options.getString("button1-label")).setURL(interaction.options.getString("button1-url")), new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(interaction.options.getString("button2-label")).setURL(interaction.options.getString("button2-url")), new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(interaction.options.getString("button3-label")).setURL(interaction.options.getString("button3-url")));
                        await webhook.send({ components: [buttons], files: [{ attachment: interaction.options.getAttachment("graphic").url, name: "graphic.png" }] });
                    }
                    await webhook.delete();
                    await interaction.editReply({ content: "Your're message has been send.", ephemeral: true });
                }
            }
        }
    }
}