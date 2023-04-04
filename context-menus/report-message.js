const { ContextMenuCommandBuilder, ApplicationCommandType, ActionRowBuilder, SelectMenuBuilder, ComponentType, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
module.exports = {
    data: new ContextMenuCommandBuilder().setName("Report Message").setType(ApplicationCommandType.Message),
    async execute(client, interaction) {
        await interaction.deferReply({ ephemeral: true });
        if (client.messageReports.filter(report => report.messageId == interaction.targetId).length>0 && !interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) return await interaction.editReply({ content: "This message has already been reported.", ephemeral: true });
        await client.messageReports.push(new Object({
            messageId: interaction.targetId,
            target: interaction.targetMessage,
            userId: interaction.user.id,
            reason: "unknown",
            replyMessage: "empty",
            buttonMessageId: "empty",
            targetMessageContent: interaction.targetMessage.content,
            actionTaken: false
        }));
        const reasonSelector = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder().setCustomId("reportMessageReason").setPlaceholder("Select a rule").setMinValues(1).setMaxValues(1).addOptions(
                [
                    {
                        label: "Harassment",
                        description: "Engaging in harassment.",
                        value: "harassment"
                    },
                    {
                        label: "Sexual harassment",
                        description: "Engaging in sexual harassment.",
                        value: "sexual-harass"
                    },
                    {
                        label: "Hateful conduct",
                        description: "Engaging in other hateful conduct.",
                        value: "hate"
                    },
                    {
                        label: "Threatening to harm",
                        description: "Threatening to harm others.",
                        value: "threaten-harm"
                    },
                    {
                        label: "Violent extremism",
                        description: "Supporting violent extremism.",
                        value: "violent-extremism"
                    },
                    {
                        label: "Child sexual abuse",
                        description: "Distributing content that depicts child sexual abuse.",
                        value: "sexual-children"
                    },
                    {
                        label: "Sexual conduct with children",
                        description: "Engaging in sexual conduct with children.",
                        value: "engage-sexual-children"
                    },
                    {
                        label: "Age-restricted content",
                        description: "Making sexually explicit content available to children.",
                        value: "age-restricted"
                    },
                    {
                        label: "Sexual content without consent",
                        description: "Sharing sexually explicit content without consent.",
                        value: "sexual-consent"
                    },
                    {
                        label: "Glorifying or promoting suicide",
                        description: "Sharing content that normalizes suicide or self-harm.",
                        value: "promote-suicide"
                    },
                    {
                        label: "Gore, violence or animal harm",
                        description: "Sharing content depicting gore, violence or animal harm.",
                        value: "gore"
                    },
                    {
                        label: "Intellectual property",
                        description: "Sharing content that violates intellectual property rights.",
                        value: "intellectual-property"
                    },
                    {
                        label: "Misinformation",
                        description: "Sharing false or misleading information.",
                        value: "misinformation"
                    },
                    {
                        label: "Misreprestative identity",
                        description: "Misrepresenting your identity in a deceptive manner.",
                        value: "misrepresentative-id"
                    },
                    {
                        label: "Compromised security",
                        description: "Engaging in activities that could compromise security.",
                        value: "cyber-security"
                    },
                    {
                        label: "Financial scams",
                        description: "Do not use Discord to execute financial scams.",
                        value: "scam"
                    },
                    {
                        label: "Fraudulent profit",
                        description: "Fraudulantly generate a profit at the expense of others.",
                        value: "fraud"
                    },
                    {
                        label: "Spam",
                        description: "Sending unsolicited bulk messages (or spam).",
                        value: "spam"
                    },
                    {
                        label: "Illegal behavior",
                        description: "Organizing, promoting or engaging in illegal behavior.",
                        value: "illegal-behavior"
                    },
                    {
                        label: "Abuse of Discord",
                        description: "Abusing Discord in any way.",
                        value: "abuse-discord"
                    },
                    {
                        label: "Self-bots and user-bots",
                        description: "Usong self-bots or user-bots",
                        value: "self-bot"
                    },
                    {
                        label: "Misleading support team",
                        description: "Misleading Discord's support teams.",
                        value: "mislead-support"
                    },
                    {
                        label: "Other",
                        description: "Other offences of the TOS or CG.",
                        value: "other"
                    }
                ]
            )
        );
        const replyMessages = new Object({
            "harassment": "The  Community Guidelines (https://discord.com/guidelines) state:\n> **Do not promote, coordinate, or engage in harassment.** Discord is a platform where everyone can find a place to belong, and harassment prevents users from building healthy communities. We do not allow harassing behavior such as sustained bullying, ban or block evasion, doxxing, or coordinating server joins for the purposes of harassing server members (such as server raiding).\n> We also do not allow the coordination, participation, or encouragement of sexual harassment, such as sending unsolicited sexually suggestive content, unwanted sexualization, or attacks on sexual activity.\nEveryone on Discord must follow these guidelines, and they apply to all parts of the platform, including your messages in our Server.",
            "sexual-harass": "The Community Guidelines (https://discord.com/guidelines) state:\n> Do not promote, coordinate, or engage in harassment. Discord is a platform where everyone can find a place to belong, and harassment prevents users from building healthy communities. We do not allow harassing behavior such as sustained bullying, ban or block evasion, doxxing, or coordinating server joins for the purposes of harassing server members (such as server raiding).\n> **We also do not allow the coordination, participation, or encouragement of sexual harassment, such as sending unsolicited sexually suggestive content, unwanted sexualization, or attacks on sexual activity.**\nEveryone on Discord must follow these guidelines, and they apply to all parts of the platform, including your messages in our Server.",
            "hate": "The Community Guidelines (https://discord.com/guidelines) state:\n> **Do not use hate speech or engage in other hateful conduct.** This includes the use of hate symbols and claims that deny the history of mass human atrocities.\n> We consider __hate speech__ to be any form of expression that either attacks other people or promotes hatred or violence against them based on their protected characteristics.\n> We consider the following to be protected characteristics: age; caste; color; disability; ethnicity; family responsibilities; gender; gender identity; housing status; national origin; race; refugee or immigration status; religious affiliation; serious illness; sex; sexual orientation; socioeconomic class and status; source of income; status as a victim of domestic violence, sexual violence, or stalking; and weight and size.\nEveryone on Discord must follow these guidelines, and they apply to all parts of the platform, including your messages in our Server.",
            "threaten-harm": "The Community Guidelines (https://discord.com/guidelines) state:\n> **Do not threaten to harm another individual or group of people.** This includes direct, indirect, and suggestive threats.\nEveryone on Discord must follow these guidelines, and they apply to all parts of the platform, including your messages in our Server.",
            "violent-extremism": "The Community Guidelines (https://discord.com/guidelines) state:\n> **Do not organize, promote, or support violent extremism.** This also includes glorifying violent events or the perpetrators of violent acts, as well as promoting conspiracy theories that could encourage or incite violence against others.\nEveryone on Discord must follow these guidelines, and they apply to all parts of the platform, including your messages in our Server.",
            "sexual-children": "The Community Guidelines (https://discord.com/guidelines) state:\n> **Do not solicit, share, or make attempts to distribute content that depicts, promotes, or attempts to normalize child sexual abuse.** Also, do not post content that in any way sexualizes children. This includes real as well as manipulated media, animation (such as lolicon), and any type of digital creation.\n> We report child sexual abuse material (CSAM) and grooming to the National Center for Missing & Exploited Children (https://www.missingkids.org/).\nEveryone on Discord must follow these guidelines, and they apply to all parts of the platform, including your messages in our Server.",
            "engage-sexual-children": "The Community Guidelines (https://discord.com/guidelines) state:\n> **Do not solicit sexual content from or engage in any sexual conduct (“grooming”) with anyone under the age of 18.**\n‍> We report child sexual abuse material (CSAM) and grooming to the National Center for Missing & Exploited Children (https://www.missingkids.org/).\nEveryone on Discord must follow these guidelines, and they apply to all parts of the platform, including your messages in our Server.",
            "age-restricted": "The Community Guidelines (https://discord.com/guidelines) state:\n> **Do not make sexually explicit content available to anyone under the age of 18.** You must be age 18 or older to participate in adult content on Discord.\n> You must apply an age-restricted label to any channels that contain sexually explicit content or any other content shared solely for the purposes of sexual gratification.\n> Do not post sexually explicit content in user avatars, custom statuses or bios, server banners, server icons, invite splashes, emoji, stickers, or any other space that cannot be age-restricted.\nEveryone on Discord must follow these guidelines, and they apply to all parts of the platform, including your messages in our Server.",
            "sexual-consent": "The Community Guidelines (https://discord.com/guidelines) state:\n> **Do not share sexually explicit or sexually suggestive content of other people without the subject’s knowledge and consent**, otherwise known as “revenge porn.” This includes the non-consensual distribution of intimate media that was created either with or without an individual’s consent.\nEveryone on Discord must follow these guidelines, and they apply to all parts of the platform, including your messages in our Server.",
            "promote-suicide": "The Community Guidelines (https://discord.com/guidelines) state:\n> **Do not share content that glorifies, promotes, or normalizes suicide or other acts of physical self-harm.** This includes content that encourages others to cut, burn, or starve themselves, as well as content that normalizes eating disorders, such as anorexia and bulimia. Self-harm acts or threats used as a form of emotional manipulation or coercion are also prohibited.\nEveryone on Discord must follow these guidelines, and they apply to all parts of the platform, including your messages in our Server.",
            "gore": "The Community Guidelines (https://discord.com/guidelines) state:\n> **Do not share real media depicting gore, excessive violence, or animal harm, especially with the intention to harass or shock others.**\nEveryone on Discord must follow these guidelines, and they apply to all parts of the platform, including your messages in our Server.",
            "intelectual-property": "The Community Guidelines (https://discord.com/guidelines) state:\n> **Do not share content that violates anyone's intellectual property or other rights.** This includes sharing or selling game cheats or hacks. For more information, please view Discord’s Copyright & Intellectual Property Policy (https://support.discord.com/hc/en-us/articles/4410339349655-Discord-s-Copyright-IP-Policy).\nEveryone on Discord must follow these guidelines, and they apply to all parts of the platform, including your messages in our Server.",
            "misinformation": "The Community Guidelines (https://discord.com/guidelines) state:\n> **Do not share false or misleading information (otherwise known as misinformation).** Content that is false, misleading, and can lead to significant risk of physical or societal harm may not be shared on Discord. We may remove content if we reasonably believe its spread could result in damage to physical infrastructure, injury of others, obstruction of participation in civic processes, or the endangerment of public health.\nEveryone on Discord must follow these guidelines, and they apply to all parts of the platform, including your messages in our Server.",
            "misrepresentative-id": "The Community Guidelines (https://discord.com/guidelines) state:\n> **Do not misrepresent your identity on Discord in a deceptive or harmful way.** This includes creating fake profiles and attempts to impersonate an individual, group, or organization.\nEveryone on Discord must follow these guidelines, and they apply to all parts of the platform, including your messages in our Server.",
            "cyber-security": "The Community Guidelines (https://discord.com/guidelines) state:\n> **Do not engage in activities that could damage or compromise the security of an account, network, or system.** This includes using deceptive techniques to trick others into revealing sensitive information (phishing), using malicious software (malware), and flooding a target with traffic in order to make a resource unavailable (denial-of-service attacks).\nEveryone on Discord must follow these guidelines, and they apply to all parts of the platform, including your messages in our Server.",
            "scam": "The Community Guidelines (https://discord.com/guidelines) state:\n> **Do not use or attempt to use Discord to promote, coordinate, or execute financial scams.** A financial scam is any intentionally deceptive act taken with the intent to receive an illegal, unethical, or otherwise dishonest gain.\n> This includes but is not limited to: Ponzi schemes, pyramid schemes, advance-fee fraud, market manipulation (including “pump-and-dump” schemes), and romance and employment scams.\nEveryone on Discord must follow these guidelines, and they apply to all parts of the platform, including your messages in our Server.",
            "fraud": "The Community Guidelines (https://discord.com/guidelines) state:\n> **Do not engage in activities that fraudulently generate a profit at the expense of others.** This includes facilitating, providing instructions for, and participating in fraud. We do not allow coordinated efforts to defraud businesses, price gouging, forgery, money laundering, or tools that facilitate illegal behavior.\nEveryone on Discord must follow these guidelines, and they apply to all parts of the platform, including your messages in our Server.",
            "spam": "The Community Guidelines (https://discord.com/guidelines) state:\n> **Do not send unsolicited bulk messages (or spam) to others.** Also, do not facilitate this activity, such as by selling spambots, server “raid” tools, account-creation tools, token generators, CAPTCHA-solving services, or other spam tools.\nEveryone on Discord must follow these guidelines, and they apply to all parts of the platform, including your messages in our Server.",
            "illegal-behavior": "The Community Guidelines (https://discord.com/guidelines) state:\n> **Do not organize, promote, or engage in any illegal behavior**, such as the buying, selling, or trading of dangerous and regulated goods. Dangerous goods have reasonable potential to cause real-world, physical harm to individuals. Regulated goods have laws in place that restrict the purchase, sale, trade, or ownership of the goods.\nEveryone on Discord must follow these guidelines, and they apply to all parts of the platform, including your messages in our Server.",
            "abuse-discord": "The Community Guidelines (https://discord.com/guidelines) state:\n> **Do not abuse Discord products in any way**, such as selling or purchasing an account or server, participating in fraudulent Nitro incentives or Boosting activities, or using monetization features to commit fraud.\nEveryone on Discord must follow these guidelines, and they apply to all parts of the platform, including your messages in our Server.",
            "self-bot": "The Community Guidelines (https://discord.com/guidelines) state:\n> **Do not use self-bots or user-bots.** Each account must be associated with a human, not a bot. Self-bots put strain on Discord’s infrastructure and our ability to run our services.\nEveryone on Discord must follow these guidelines, and they apply to all parts of the platform, including your messages in our Server.",
            "mislead-support": "The Community Guidelines (https://discord.com/guidelines) state:\n> **Do not mislead Discord’s support teams.** Do not make false or malicious reports to our Trust & Safety or other customer support teams, send multiple reports about the same issue, or ask a group of users to report the same content or issue.  Repeated violations of this guideline may result in loss of access to our reporting functions.\nEveryone on Discord must follow these guidelines, and they apply to all parts of the platform, including your messages in our Server.",
            "other": "An addendum to the Community Guidelines (https://discord.com/guidelines) states:\n> These guidelines will continue to evolve over time. This means we may take action against a user, server, or content that violates the spirit of these guidelines when we encounter a new threat or harm that is not explicitly covered in the current version.\nEveryone on Discord must follow these guidelines, and they apply to all parts of the platform, including your messages in our Server."
        });
        const valueToLabel = new Object({
            "harassment": "Harassment",
            "sexual-harass": "Sexual Harassment",
            "hate": "Hateful Conduct",
            "threaten-harm": "Threatening to Harm",
            "violent-extremism": "Violent Extremism",
            "sexual-children": "Child Sexual Abuse",
            "engage-sexual-children": "Sexual Conduct with Children",
            "age-restricted": "Age-Restricted Content",
            "sexual-consent": "Sexual content without Consent",
            "promote-suicide": "Glorifying or Promoting Suicide",
            "gore": "Gore, Violence or Animal Harm",
            "intellectual-property": "Intellectual Property",
            "misinformation": "Misinformation",
            "misrepresentative-id": "Misrepresentative Identity",
            "cyber-security": "Compromised Security",
            "scam": "Financial Scams",
            "fraud": "Fraudulent Profit",
            "spam": "Spam",
            "illegal-behavior": "Illegal Behavior",
            "abuse-discord": "Abuse of Discord",
            "self-bot": "Self-Bots and User-Bots",
            "misleading-suport": "Misleading Support Team",
            "other": "Other"
        });
        const embed = new EmbedBuilder().setColor("#5865F2").addFields([
            {
                //380 - 129
                name: "Harassment",
                value: "__Do not promote, coordinate, or engage in harassment.__ We do not allow harassing behavior such as sustained bullying, ban or block evasion, doxxing, or coordinating server joins for the purposes of harassing server members (such as server raiding)."
            },
            {
                //208
                name: "Sexual harassment",
                value: "__We also do not allow the coordination, participation, or encouragement of sexual harassment, such as sending unsolicited sexually suggestive content, unwanted sexualization, or attacks on sexual activity.__"
            },
            {
                //803 - 428 (incl. commented text)
                name: "Hateful conduct",
                value: "__Do not use hate speech or engage in other hateful conduct.__ This includes the use of hate symbols and claims that deny the history of mass human atrocities."//\n\
                //We consider __hate speech__ to be any form of expression that either attacks other people or promotes hatred or violence against them based on their protected characteristics."
            },
            {
                //122
                name: "Threatening to harm",
                value: "__Do not threaten to harm another individual or group of people.__ This includes direct, indirect, and suggestive threats."
            },
            {
                //238
                name: "Violent extremism",
                value: "__Do not organize, promote, or support violent extremism.__ This also includes glorifying violent events or the perpetrators of violent acts, as well as promoting conspiracy theories that could encourage or incite violence against others."
            },
            {
                //311
                name: "Child sexual abuse",
                value: "__Do not solicit, share, or make attempts to distribute content that depicts, promotes, or attempts to normalize child sexual abuse.__ Also, do not post content that in any way sexualizes children. This includes real as well as manipulated media, animation (such as lolicon), and any type of digital creation."
            },
            {
                //118
                name: "Sexual conduct with children",
                value: "__Do not solicit sexual content from or engage in any sexual conduct (“grooming”) with anyone under the age of 18.__"
            },
            {
                //156 + 193
                name: "Age-restricted content",
                value: "__Do not make sexually explicit content available to anyone under the age of 18.__ You must be age 18 or older to participate in adult content on Discord.\n\
                Do not post sexually explicit content in user avatars, custom statuses or bios, server banners, server icons, invite splashes, emoji, stickers, or any other space that cannot be age-restricted."
            },
            {
                //291
                name: "Sexual content without consent",
                value: "__Do not share sexually explicit or sexually suggestive content of other people without the subject’s knowledge and consent__, otherwise known as “revenge porn.” This includes the non-consensual distribution of intimate media that was created either with or without an individual’s consent."
            },
            {
                //373
                name: "Glorifying or promoting suicide",
                value: "__Do not share content that glorifies, promotes, or normalizes suicide or other acts of physical self-harm.__ This includes content that encourages others to cut, burn, or starve themselves, as well as content that normalizes eating disorders, such as anorexia and bulimia. Self-harm acts or threats used as a form of emotional manipulation or coercion are also prohibited."
            },
            {
                //136
                name: "Gore, violence or animal harm",
                value: "__Do not share real media depicting gore, excessive violence, or animal harm, especially with the intention to harass or shock others.__"
            },
            {
                //320
                name: "Intellectual property",
                value: "__Do not share content that violates anyone's intellectual property or other rights.__ This includes sharing or selling game cheats or hacks. For more information, please view [Discord’s Copyright & Intellectual Property Policy](https://support.discord.com/hc/en-us/articles/4410339349655-Discord-s-Copyright-IP-Policy)."
            },
            {
                //426
                name: "Misinformation",
                value: "__Do not share false or misleading information (otherwise known as misinformation).__ Content that is false, misleading, and can lead to significant risk of physical or societal harm may not be shared on Discord. We may remove content if we reasonably believe its spread could result in damage to physical infrastructure, injury of others, obstruction of participation in civic processes, or the endangerment of public health."
            },
            {
                //183
                name: "Misrepresentative identity",
                value: "__Do not misrepresent your identity on Discord in a deceptive or harmful way.__ This includes creating fake profiles and attempts to impersonate an individual, group, or organization."
            },
            {
                //357
                name: "Compromised security",
                value: "__Do not engage in activities that could damage or compromise the security of an account, network, or system.__ This includes using deceptive techniques to trick others into revealing sensitive information (phishing), using malicious software (malware), and flooding a target with traffic in order to make a resource unavailable (denial-of-service attacks)."
            },
            {
                //231
                name: "Financial scams",
                value: "__Do not use or attempt to use Discord to promote, coordinate, or execute financial scams.__ A financial scam is any intentionally deceptive act taken with the intent to receive an illegal, unethical, or otherwise dishonest gain."
            },
            {
                //320 - 144
                name: "Fraudulent profit",
                value: "__Do not engage in activities that fraudulently generate a profit at the expense of others.__ This includes facilitating, providing instructions for, and participating in fraud."
            },
            {
                //241
                name: "Spam",
                value: "__Do not send unsolicited bulk messages (or spam) to others.__ Also, do not facilitate this activity, such as by selling spambots, server “raid” tools, account-creation tools, token generators, CAPTCHA-solving services, or other spam tools. "
            },
            {
                //335
                name: "Illegal behavior",
                value: "__Do not organize, promote, or engage in any illegal behavior, such as the buying, selling, or trading of dangerous and regulated goods.__ Dangerous goods have reasonable potential to cause real-world, physical harm to individuals. Regulated goods have laws in place that restrict the purchase, sale, trade, or ownership of the goods."
            },
            {
                //215
                name: "Abuse of Discord",
                value: "__Do not abuse Discord products in any way__, such as selling or purchasing an account or server, participating in fraudulent Nitro incentives or Boosting activities, or using monetization features to commit fraud."
            },
            {
                //183
                name: "Self-bots and user-bots",
                value: "__Do not use self-bots or user-bots.__ Each account must be associated with a human, not a bot. Self-bots put strain on Discord’s infrastructure and our ability to run our services. "
            },
            {
                //338 - 95
                name: "Misleading support team",
                value: "__Do not mislead Discord’s support teams.__ Do not make false or malicious reports to our Trust & Safety or other customer support teams, send multiple reports about the same issue, or ask a group of users to report the same content or issue."
            }
            //5955 - 144 - 129
        ]);
        const editedReplyMessage = await interaction.editReply({ content: "Please select which rule from the Community Guidelines was broken with this message. You can find a summary of the Community Guidelines below.", ephemeral: true, embeds: [embed], components: [reasonSelector] });
        const filter = i => {
            i.deferUpdate();
            return i.user.id == interaction.user.id;
        };
        const choise = await editedReplyMessage.awaitMessageComponent({ filter, componentType: ComponentType.StringSelect, time: 300000 }).catch(err => console.error(err));
        client.messageReports.filter(report => report.messageId == interaction.targetId).filter(report => report.userId == interaction.user.id)[0].reason = choise.values.join(", ");
        client.messageReports.filter(report => report.messageId == interaction.targetId).filter(report => report.userId == interaction.user.id)[0].replyMessage = replyMessages[choise.values[0]];
        const targetMessage = client.messageReports.filter(report => report.messageId == interaction.targetId)[0].target;
        const targetMember = await interaction.guild.members.fetch({ user: targetMessage.author.id, force: true });
        const reportEmbed = new EmbedBuilder()
            .setColor("cfb53b")
            .setTitle(`${targetMember.displayName}`)
            .setURL(`https://discord.com/users/${targetMember.id}`)
            .setDescription(targetMessage.content != "" ? targetMessage.content : "*empty message*")
            .addFields(
                {
                    name: "Reason",
                    value: choise.values.join(", "),
                    inline: true
                },
                {
                    name: "Message ID",
                    value: `[${interaction.targetId}](https://discord.com/channels/${interaction.guildId}/${interaction.channelId}/${interaction.targetId})`,
                    inline: true
                },
                {
                    name: "Reporting User",
                    value: interaction.member.displayName,
                    inline: true
                }
        );
        const reportButtons = new ActionRowBuilder().addComponents(
            [
                new ButtonBuilder().setCustomId("messageReportPardon").setLabel("Pardon").setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId("messageReportWarning").setLabel("Warn and Delete").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("messageReportTimeout1").setLabel("10 minutes Timeout").setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId("messagereportTimeout2").setLabel("1 hour Timeout").setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId("messageReportTimeout3").setLabel("1 day Timeout").setStyle(ButtonStyle.Danger)
            ]
        );
        const channels = await interaction.guild.channels.fetch();
        const buttonMessage = await channels.find(channel => channel.name == "blocked-messages").send({ content: `A message was reported in <#${targetMessage.channel.id}>`, embeds: [reportEmbed], components: [reportButtons] });
        client.messageReports.filter(report => report.messageId == interaction.targetId).filter(report => report.userId == interaction.user.id)[0].buttonMessageId = buttonMessage.id;
        await interaction.editReply({ content: `You have reported "${targetMessage.content}" for breaking the following rule: ${valueToLabel[choise.values[0]]}.`, embeds: [], components: [] });
        /*if (interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
            client.messageReports.filter(report => report.messageId == interaction.targetId).filter(report => report.userId == interaction.user.id)[0].reason = choise.values.join(", ");
            client.messageReports.filter(report => report.messageId == interaction.targetId).forEach(report => {
                report.actionTaken = true
            });
            const targetMessage = client.messageReports.filter(report => report.messageId == interaction.targetId).filter(report => report.userId == interaction.user.id)[0].target;
            const targetMember = await interaction.guild.members.fetch({ user: targetMessage.author.id, force: true });
            const embed = new EmbedBuilder()
                .setColor("cfb53b")
                .setTitle(`${targetMember.displayName}`)
                .setDescription(targetMessage.content != "" ? targetMessage.content : "*empty message*")
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
                    value: targetMessage.url
                });
            const channels = await interaction.guild.channels.fetch();
            await channels.find(channel => channel.name == "blocked-messages").send({ content: `<@${interaction.guild.members.me.id}> has removed a message in <#${targetMessage.channel.id}>`, embeds: [embed] });
            await targetMessage.author.send(`Your message "${targetMessage.content}" has been removed because it goes against the Discord Community Guidelines.\n${replyMessages[choise.values[0]]}\nYou can read the Community Guidelines on https://discord.com/guidelines.`);
            await targetMessage.delete();
            await interaction.editReply({ content: `You reported "${targetMessage.content}" for the following reason: "${choise.values.join(", ")}".`, ephemeral: true, components: [] });
            console.log(`> DELETED after REPORT: message ${targetMessage.id} by ${targetMember.displayName} because of ${choise.values.join(", ")}: "${targetMessage.content}".`);
        } else {
            client.messageReports.filter(report => report.messageId == interaction.targetId).filter(report => report.userId == interaction.user.id)[0].reason = choise.values.join(", ");
            const targetMessage = client.messageReports.filter(report => report.messageId == interaction.targetId).filter(report => report.userId == interaction.user.id)[0].target;
            const targetMember = await interaction.guild.members.fetch({ user: targetMessage.author.id, force: true });
            const embed = new EmbedBuilder()
                .setColor("cfb53b")
                .setTitle(`${targetMember.displayName}`)
                .setDescription(targetMessage.content != "" ? targetMessage.content : "*empty message*")
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
                    value: targetMessage.url
                });
            const channels = await interaction.guild.channels.fetch();
            await channels.find(channel => channel.name == "blocked-messages").send({ content: `<@${interaction.user.id}> has reported a message in <#${targetMessage.channel.id}>`, embeds: [embed] });
            await interaction.editReply({ content: `You reported "${targetMessage.content}" for the following reason: "${choise.values.join(", ")}". Your report will be reviewed soon.`, ephemeral: true, components: [] });
            console.log(`> REPORTED: message ${targetMessage.id} by ${targetMember.displayName} reported by ${interaction.user.username} because of ${choise.values.join(", ")}: "${targetMessage.content}".`);
        }*/
    }
}