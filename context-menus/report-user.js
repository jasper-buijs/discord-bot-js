//jasper: removed const Discord = require("discord.js");
const { ContextMenuCommandBuilder, ApplicationCommandType, ActionRowBuilder, SelectMenuBuilder, ComponentType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
module.exports = {
    data: new ContextMenuCommandBuilder().setName("Report User").setType(ApplicationCommandType.User),
    async execute(client, interaction) {
        await interaction.deferReply({ ephemeral: true });
        await client.userReports.push(new Object({
            reportedUserId: interaction.targetId,
            targetUser: interaction.targetUser,
            targetMember: interaction.targetMember,
            userId: interaction.user.id,
            reason: "unknown",
            actionTaken: false
        }));
        const reasonSelector = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder().setCustomId("reportUserReason").setPlaceholder("Select a reason").addOptions(
                {
                    label: "Offensive profile picture",
                    description: "Using a profile picture that may be seen as offensive or gory.",
                    value: "offensive-profile-picture"
                },
                {
                    label: "Offensive status, about-me or name",
                    description: "Using a (custom or RPC) status, about-me or username that may be seen as offensive.",
                    value: "offensive-profile-text"
                },
                {
                    label: "Self-botting",
                    description: "Using self-bots or user-bots as per Discord's Community Guidelines.",
                    value: "self-botting"
                },
                {
                    label: "Spamming in voice",
                    description: "Spamming voice channels in any way, or using unnatural sounding voice-changers.",
                    value: "spamming-voice"
                },
                {
                    label: "Harassment in voice",
                    description: "Harassing, insulting, discriminating or otherwise hurting someone in a voice channel.",
                    value: "harassing-voice"
                },
                {
                    label: "Streaming inappropriate content",
                    description: "Live-streaming gore, acts of violence, age restricted content, or otherwise inappropriate content.",
                    value: "streaming-gore"
                }
            )
        );
        const replyMessages = new Object({ //jasper: renamed from keys
            "offensive-profile-picture": "You may not use an offensive, gory, or otherwise **disrespectful profile picture** in our server. This infringement may be punished, and you may be kicked or banned from this server if you don't change your profile picture.",
            "offensive-profile-text": "You may not use offensive, discriminatory or otherwise **offensive text in your profile** (status, about-me, username, ...). This infringement may be punished, and you may be kicked or banned from this server if you don't change your profile information.",
            "self-botting": "**Self-botting**, user-botting, or otherwise using code or automation to (partially) control a Discord account that is not marked as a bot account is not allowed on Discord as per Discord's Terms Of Service and Community Guidelines. These kinds of infringements may be punished in our server and may be reported to Discord.",
            "spamming-voice": "You may not **spam a voice channel** in any way. __If you join a voice channel, it may only be with the purpose to actively engage in conversation.__ These kinds of infringements may be punished in our server and may be reported to Discord.",
            "harassing-voice": "You may not harass, discriminate, insult, or otherwise **offend someone in a voice channel**. You may not engage in racism, hate speech, threats of violence or violent extremism. You may not share age-restricted content in a voice channel. These kinds of infringements may be punished in our server and may be reported to Discord.",
            "streaming-gore": "You may not live stream any content that may be seen as gore, acts or threats of violence, age restricted content or porn, or any otherwise **inappropriate content**. You are the sole person responsible for the content you live stream on Discord and in our server. These kinds of infringements may be punished in our server and may be reported to Discord."
        });
        const editedReplyMessage = await interaction.editReply({ content: "Please select which rule was broken by this user.", ephemeral: true, components: [reasonSelector] }); //jasper: renamed from message
        const filter = i => {
            i.deferUpdate();
            return i.user.id == interaction.user.id;
        }
        const choise = await editedReplyMessage.awaitMessageComponent({ filter, componentType: ComponentType.StringSelect, time: 60000}).catch(err => console.error(err));
        if (interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
            client.userReports.filter(report => report.reportedUserId == interaction.targetId).filter(report => report.userId == interaction.user.id).filter(report => report.reason == "unknown")[0].reason = choise.values.join(", ");
            client.userReports.filter(report => report.reportedUserId == interaction.targetId).filter(report => report.reason == choise.values.join(", ")).forEach(report => {
                report.actionTaken = true;
            });
            const targetUser = client.userReports.filter(report => report.reportedUserId == interaction.targetId).filter(report => report.userId == interaction.user.id)[0].targetUser; //jasper: renamed from target
            const targetMember = await interaction.guild.members.fetch({ user: targetUser.id, force: true }); //jasper: renamed from member
            const embed = new EmbedBuilder()
                .setColor("cfb53b")
                .setTitle(`${targetMember.displayName}`)
                .setDescription("*user report*")
                .setFields({
                    name: "Reason",
                    value: choise.values.join(", "),
                    inline: true
                },
                {
                    name: "User ID",
                    value: interaction.targetId,
                    inline: true
                });
            const channels = await interaction.guild.channels.fetch();
            await channels.find(channel => channel.name == "blocked-messages").send({ content: `<@${interaction.guild.members.me.id}> has warned <@${targetUser.id}>`, embeds: [embed] });
            await targetUser.send(`You have been reported in our server for breaching the server rules or the Discord Community Guidelines.\n${replyMessages[choise.values[0]]}\nYou can read the Community Guidelines on https://discord.com/guidelines.`);
            await interaction.editReply({ content: `You reported "${targetMember.displayName}" for the following reason: "${choise.values.join(", ")}".`, ephemeral: true, components: [] });
            console.log(`> WARNED after REPORT: user ${targetMember.displayName} ${targetUser.id} because of ${choise.values.join(", ")}.`);
        } else {
            client.userReports.filter(report => report.reportedUserId == interaction.targetId).filter(report => report.userId == interaction.user.id).filter(report => report.reason == "unknown")[0].reason = choise.values.join(", "); //jasper: renamed from target
            const targetUser = client.userReports.filter(report => report.reportedUserId == interaction.targetId).filter(report => report.userId == interaction.user.id)[0].targetUser; //jasper: renamed from member
            const targetMember = await interaction.guild.members.fetch({ user: targetUser.id, force: true });
            const embed = new EmbedBuilder()
                .setColor("cfb53b")
                .setTitle(`${targetMember.displayName}`)
                .setDescription("*user report*")
                .setFields({
                    name: "Reason",
                    value: choise.values.join(", "),
                    inline: true
                },
                {
                    name: "User ID",
                    value: interaction.targetId,
                    inline: true
                });
                const channels = await interaction.guild.channels.fetch();
                await channels.find(channel => channel.name == "blocked-messages").send({ content: `<@${interaction.user.id}> has reported <@${targetUser.id}>`, embeds: [embed] });
                await interaction.editReply({ content: `You reported "${targetMember.displayName}" for the following reason: "${choise.values.join(", ")}". Your report will be reviewed soon.`, ephemeral: true, components: [] });
                console.log(`> REPORTED: user ${targetMember.displayName} ${targetUser.id} reported by ${interaction.user.username} because of ${choise.values.join(", ")}.`);
        }
    }
}