const { ContextMenuCommandBuilder, ApplicationCommandType, ActionRowBuilder, SelectMenuBuilder, ComponentType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
module.exports = {
    data: new ContextMenuCommandBuilder().setName("Report User in Voice Channel").setType(ApplicationCommandType.User),
    async execute(client, interaction) {
        await interaction.deferReply({ ephemeral: true });
        await client.userVoiceReports.push(new Object({
            reportedUserId: interaction.targetId,
            targetUser: interaction.targetUser,
            targetMember: interaction.targetMember,
            userId: interaction.user.id,
            reason: "unknown",
            replyMessage: "empty",
            buttonMessageId: "empty",
            actionTaken: false
        }));
        const reasonSelector = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder().setCustomId("reportUserReason").setPlaceholder("Select a reason").setMinValues(1).setMaxValues(1).addOptions(
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
                        label: "Child sexual abuse (stream)",
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
                        label: "Sexual content without consent (stream)",
                        description: "Sharing sexually explicit content without consent.",
                        value: "sexual-consent"
                    },
                    {
                        label: "Glorifying or promoting suicide",
                        description: "Sharing content that normalizes suicide or self-harm.",
                        value: "promote-suicide"
                    },
                    {
                        label: "Gore, violence or animal harm (stream)",
                        description: "Sharing content depicting gore, violence or animal harm.",
                        value: "gore"
                    },
                    {
                        label: "Misinformation",
                        description: "Sharing false or misleading information.",
                        value: "misinformation"
                    },
                    {
                        label: "Financial scams",
                        description: "Do not use Discord to execute financial scams.",
                        value: "scam"
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
                        label: "Other",
                        description: "Other offences of the TOS or CG.",
                        value: "other"
                    }
                ]
            )
        );
    }
}