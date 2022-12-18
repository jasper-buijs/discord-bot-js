const Discord = require("discord.js");
const { ContextMenuCommandBuilder, ApplicationCommandType, ActionRowBuilder, SelectMenuBuilder, ComponentType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
module.exports = {
    data: new ContextMenuCommandBuilder().setName("Report Message").setType(ApplicationCommandType.Message),
    async execute(client, interaction) {
        await interaction.deferReply({ ephemeral: true });
        if (client.messageReports.filter(report => report.messageId == interaction.targetId).filter(report => report.userId == interaction.user.id).length>0) return await interaction.editReply({ content: "You already reported this message.", ephemeral: true });
        await client.messageReports.push(new Object({
            messageId: interaction.targetId,
            target: interaction.targetMessage,
            userId: interaction.user.id,
            reason: "unknown",
            actionTaken: false
        }));
        const reasonSelector = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder().setCustomId("reportMessageReason").setPlaceholder("Select a rule").addOptions(
                {
                    label: "Hateful conduct",
                    description: "Participating in hate speech or discrimination of any kind.",
                    value: "hate"
                },
                {
                    label: "Harassment",
                    description: "Harassing or threatening others in any way, or showing signs of violence.",
                    value: "harassment"
                },
                {
                    label: "Sexualization of children",
                    description: "Sexualizing children (under 18 years old) in any way.",
                    value: "sexual-children"
                },
                {
                    label: "Sharing age-restricted content",
                    description: "Making adult content available to anyone potentially under the age of 18.",
                    value: "age-restricted"
                },
                {
                    label: "Sharing sexual content without consent",
                    description: "Sharing sexually explicit content of other people without their consent.",
                    value: "sexual-consent"
                },
                {
                    label: "Gore / Self-harm / Animal harm",
                    description: "Sharing real media depicting or suggesting gore, violence, self-harm, suicide or animal harm.",
                    value: "gore"
                },
                {
                    label: "Misinformation",
                    description: "Sharing false or misleading information or impersonating other people or users.",
                    value: "misinformation"
                },
                {
                    label: "Hacking / Breaking into account",
                    description: "Distributing content involving hacking, or gaining unauthorised access to accounts or goods.",
                    value: "hacking"
                },
                {
                    label: "Spam",
                    description: "Using Discord to spam, manipulate engagement, or disrupt other people's experience.",
                    value: "spam"
                },
                {
                    label: "Abusing Discord",
                    description: "Abusing Discord in any way, especially for illegal purposes, or \"self-botting\".",
                    value: "abuse-discord"
                },
                {
                    label: "Other",
                    description: "Doing, saying, showing or implying anything else against the terms.",
                    value: "other"
                }
            )
        );
        const keys = new Object({
            "hate": "You may not participate in **hate speech** or discrimination of any kind. It’s unacceptable to attack a person or a community based on attributes such as their race, ethnicity, caste, national origin, sex, gender identity, gender presentation, sexual orientation, religious affiliation, age, serious illness, disabilities, or other protected classifications. These kinds of infringements may be punished in our server and may be reported to Discord.",
            "harassment": "You may not **harass** or threaten anyone, nor may you show acts of violance on Discord or in this server. This includes indirect or suggestive threats, as well as sharing or threatening to share someone’s personally identifiable information. This also includes glorifying violent events, the perpetrators of violent acts, or similar behaviors. These kinds of infringements may be punished in our server and may be reported to Discord.",
            "sexual-children": "**Sexualising children** or potential children is against the terms of Discord, and against the law. You cannot share contents or links which depict children in a pornographic, sexually suggestive, or violent manner, including illustrated or digitally altered pornography that depicts children and conduct grooming behaviors. Punishments against these kinds of infringements will be harsh; and you will be reported to Discord.",
            "age-restricted": "You may only **share age-restricted content** (adult content) in channels that are marked as \"age-restricted\". Sharing adult content in places accesible to anyone under the age of 18 is prohibited. These kinds of infringements may be punished in our server and may be reported to Discord.",
            "sexual-consent": "You may not share any content of a sexual nature without the permission of the people depicted. Such content that has been altered or photoshopped is also prohibited. These kinds of infringements may be punished in our server and may be reported to Discord.",
            "gore": "You may not share any content **depicting gore**, violence, (the intention to) self-harm or animal harm; especially with the intention to harass or shock others. These kinds of infringements may be punished in our server and may be reported to Discord.",
            "misinformation": "You may not **share false or misleading information** of any kind on Discord; and may not impersonate any other user or person. Especially content that could damage the physical infrastructure, injure others, obstruct participation in civic processes, or endanger public health is not allowed on Dirscord. These kinds of infringements may be punished in our server and may be reported to Discord.",
            "hacking": "You may not share any content **depicting or tutoring hacking** or cracking of any kind, or how to get unauthorized access to accounts, data or goods of others. This includes sharing or selling game cheats or hacks. These kinds of infringements may be punished in our server and may be reported to Discord.",
            "spam": "You may not use Discord to **spam**, manipulate engagement or disrupt the experience of others on Discord. You may not try to circumvent the gif-filter of the Wumpus bot. Spamming can be allowed in a limited fashion in the channels under the \"SPAM\" category. These kinds of infringements may be punished in our server and may be reported to Discord.",
            "abuse-discord": "You may not **abuse Discord** or the services it provides, nor may you use Discord to promote or organize illegal activities of any kind. You may not use self-bots or user-bots (a bot, but behind a normal user account) anywhere on Discord. These kinds of infringements may be punished in our server and may be reported to Discord.",
            "other": "These kinds of infringements may be punished in our server and may be reported to Discord."
        });
        const message = await interaction.editReply({ content: "Please select which rule from the Community Guidelines was broken with this message.", ephemeral: true, components: [reasonSelector] });
        const filter = i => {
            i.deferUpdate();
            return i.user.id == interaction.user.id;
        };
        const choise = await message.awaitMessageComponent({ filter, componentType: ComponentType.StringSelect, time: 60000 }).catch(err => console.error(err));//.catch(interaction.editReply({ content: "You failed to select a reason in time.", ephemeral: true, components: [] }));
        if (interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
            client.messageReports.filter(report => report.messageId == interaction.targetId).filter(report => report.userId == interaction.user.id)[0].reason = choise.values.join(", ");
            client.messageReports.filter(report => report.messageId == interaction.targetId).forEach(report => {
                report.actionTaken = true
            });
            const target = client.messageReports.filter(report => report.messageId == interaction.targetId).filter(report => report.userId == interaction.user.id)[0].target;
            //console.log(client.messageReports);
            const member = await interaction.guild.members.fetch({ user: target.author.id, force: true });
            //console.log("message: " + target.author.id, member.displayName);
            const embed = new EmbedBuilder()
                .setColor("cfb53b")
                .setTitle(`${member.displayName}`)
                .setDescription(target.content != "" ? target.content : "*empty message*")
                .addFields({
                    name: "Reason",
                    value: choise.values.join(", "),
                    inline: true
                },
                {
                    name: "Message ID",
                    value: interaction.targetId,
                    inline: true
                },
                {
                    name: "Message URL",
                    value: target.url
                });
            const channels = await interaction.guild.channels.fetch();
            await channels.find(channel => channel.name == "blocked-messages").send({ content: `<@${interaction.guild.members.me.id}> has blocked a message in <#${target.channel.id}>`, embeds: [embed] });
            await target.author.send(`Your message "${target.content}" has been removed because it goes against the Discord Community Guidelines.\n${keys[choise.values[0]]}\nYou can read the Community Guidelines on https://discord.com/guidelines.`);
            await target.delete();
            await interaction.editReply({ content: `You reported "${target.content}" for the following reason: "${choise.values.join(", ")}".`, ephemeral: true, components: [] });
            console.log(`> DELETED after REPORT: message ${target.id} by ${member.displayName} because of ${choise.values.join(", ")}: "${target.content}".`);
        } else {
            client.messageReports.filter(report => report.messageId == interaction.targetId).filter(report => report.userId == interaction.user.id)[0].reason = choise.values.join(", ");
            const target = client.messageReports.filter(report => report.messageId == interaction.targetId).filter(report => report.userId == interaction.user.id)[0].target;
            const member = await interaction.guild.members.fetch({ user: target.author.id, force: true });
            const embed = new EmbedBuilder()
                .setColor("cfb53b")
                .setTitle(`${member.displayName}`)
                .setDescription(target.content != "" ? target.content : "*empty message*")
                .addFields({
                    name: "Reason",
                    value: choise.values.join(", "),
                    inline: true
                },
                {
                    name: "Message ID",
                    value: interaction.targetId,
                    inline: true
                },
                {
                    name: "Message URL",
                    value: target.url
                });
            const channels = await interaction.guild.channels.fetch();
            await channels.find(channel => channel.name == "blocked-messages").send({ content: `<@${interaction.user.id}> has reported a message in <#${target.channel.id}>`, embeds: [embed] });
            await interaction.editReply({ content: `You reported "${target.content}" for the following reason: "${choise.values.join(", ")}". Your report will be reviewed soon.`, ephemeral: true, components: [] });
            console.log(`> REPORTED: message ${target.id} by ${member.displayName} reported by ${interaction.user.username} because of ${choise.values.join(", ")}: "${target.content}".`);
        }
    }
}