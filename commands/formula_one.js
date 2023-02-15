const Discord = require("discord.js");
const { SlashCommandBuilder, PermissionFlagsBits, ThreadAutoArchiveDuration, ChannelType, EmbedBuilder } = require('discord.js');
const { request, GraphQLClient, gql } = require("graphql-request");
const { clientId, guildId } = require("../config.json");
const schedule = require("node-schedule");
/*import {
    discoverF1MVInstances,
    getAPIVersion,
    getF1MVVersion,
    LiveTimingAPIGraphQL,
} from "npm_f1mv_api";*/
//import Discord from "discord.js";
/*import {
    SlashCommandBuilder,
    PermissionFlagsBits
} from "discors.js";*/
//const {discoverF1MVInstances, getAPIVersion, getF1MVVersion, LiveTimingAPIGraphQL} = require("npm_f1mv_api");
module.exports = {
    data: new SlashCommandBuilder().setName("formula1").setDescription("Behind the scenes commands for F1 2023.").setDefaultMemberPermissions(PermissionFlagsBits.Administrator).addSubcommandGroup(group =>
        group.setName("live-session").setDescription("Link to Multiviewer for F1 for live broadcast.").addSubcommand(command =>
            command.setName("start").setDescription("Link Multiviewer for F1 for a live session").addStringOption(option =>
                option.setName("flag-message-id").setDescription("ID of the message where flags should be displayed.").setRequired(true)).addStringOption(option =>
                option.setName("event-id").setDescription("ID of the Discord Event for the session.").setRequired(true)).addStringOption(option =>
                option.setName("ip").setDescription("IP adress where F1MV is running.").setRequired(false))).addSubcommand(command =>
            command.setName("stop").setDescription("Stop the link with F1MV.").addStringOption(option =>
                option.setName("image-url").setDescription("URL of image to be reinstated.").setRequired(true)).addStringOption(option =>
                option.setName("flag-message-id").setDescription("ID of the message to be reinstated.").setRequired(false)))),
    async execute(client, interaction) {
        await interaction.deferReply({ephemeral: true});
        if (interaction.options.getSubcommandGroup() == "live-session") {
            if (interaction.options.getSubcommand() == "start") {
                /*console.log("got here [0]");
                import("npm_f1mv_api").then(async (npm_f1_mv) => {
                    console.log("got here [1]");
                    let port;

                    try {
                        port = (await npm_f1_mv.discoverF1MVInstances("127.0.0.1")).port;
                        console.log("got here [3]");
                    } catch (error) {
                        console.error(
                            "No MultiViewer instances founded on the requested host. Check if MultiViewer is running or if MultiViewer is allowed in your FireWall rules."
                        );
                        return;
                    }

                    const config = {
                        host: "127.0.0.1",
                        port: port,
                    };

                    console.log(await npm_f1_mv.discoverF1MVInstances(config.host));
                    console.log(await npm_f1_mv.getF1MVVersion(config));
                    console.log(await npm_f1_mv.getAPIVersion(config));
                    //console.log(await LiveTimingAPIV1(config, "TrackStatus"));
                    //console.log(await LiveTimingAPIV2(config, ["TrackStatus", "WeatherData"]));
                    console.log(
                        await npm_f1_mv.LiveTimingAPIGraphQL(config, ["TrackStatus", "WeatherData"])
                    );
                });*/
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
                //client.request(query).then((data) => console.log(data));
                let data = new Object();
                try {
                    data = await apiClient.request(query);
                    console.log(data);
                } catch {
                    console.log("> ERROR could not find graphql api");
                    return interaction.editReply({ content: "Could not find graphql api.", ephemeral: true });
                }
                while (!data.liveTimingClock && !data.liveTimingState.ExtrapolatedClock && !data.liveTimingState.RaceControlMessages && !data.liveTimingState.SessionData && !data.liveTimingState.SessionInfo && !data.liveTimingState.TrackStatus && !data.liveTimingState.WeatherData) {
                    console.log("not everything, retrying");
                    data = await apiClient.request(query);
                }
                console.log("got everything, launching");
                /*client.formula1LiveData = {
                    lastRCMessageIndex: -1,
                    active: true
                }*/
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
                await client.guilds.cache.get(guildId).members.cache.filter(member => member.roles.cache.find(role => role.name == "Formula 1")).forEach(member => {
                    thread.members.add(member.id);
                });
                await client.guilds.cache.get(guildId).scheduledEvents.fetch(true);
                await thread.send({ content: await client.guilds.cache.get(guildId).scheduledEvents.cache.get(interaction.options.getString("event-id")).url ?? "did not find event url" });
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
                    /*if (!client.formula1LiveData.active) {
                        client.formula1LiveData.apiJob.gracefulShutdown(); // can't destroy fromp inside
                    }*/
                });
            } else if (interaction.options.getSubcommand() == "stop") {
                client.formula1LiveData.active = false;
                await client.formula1LiveData.apiJob.cancel();
                await interaction.editReply({ content: "Live conection stopped.", ephemeral: true });
            }
        }
    }
}