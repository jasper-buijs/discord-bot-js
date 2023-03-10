const { clientId, guildId } = require("../config.json");
const { SlashCommandBuilder } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder().setName("access").setDescription("Enable or disable Discord channels.")
    .addSubcommand(sc => sc.setName("enable").setDescription("Enable Discord channels").addStringOption(op => op.setName("channels").setDescription("Category of the channels.").setRequired(true).addChoices({name:"Formula 1",value:"f1"}, /*{name:"F1® Game", value:"f1g"}, {name:"Grand Theft Auto V", value:"gta"}, */{name:"League Of Legends", value:"lol"}, {name:"Minecraft", value:"mc"}, /*{name:"Rainbow 6 Siege", value:"r6s"}*/)))
    .addSubcommand(sc => sc.setName("disable").setDescription("Disable Discord channels").addStringOption(op => op.setName("channels").setDescription("Category of the channels.").setRequired(true).addChoices({name:"Formula 1",value:"f1"}, /*{name:"F1® Game", value:"f1g"}, {name:"Grand Theft Auto V", value:"gta"}, */{name:"League Of Legends", value:"lol"}, {name:"Minecraft", value:"mc"}, /*{name:"Rainbow 6 Siege", value:"r6s"}*/))),
    async execute(client, interaction) {
        await interaction.deferReply({ ephemeral: true });
        const roleIDs = {"842889568922632232": {"f1": "843070594547449876", /*"f1g": "859742660331307028", "gta": "843069156206837771", */"lol": "843065264764747827", "mc": "843069864842362913", /*"r6s": "843067824846143508"*/},
            "585896430380777503": {"f1": "926213448986144799", /*"f1g": "926214181118681118", "gta": "926215000652120094", */"lol": "926214729473601626", "mc": "926214517619327006", /*"r6s": "926215246266384404"*/}};
        if (interaction.options.data[0].name == "enable") {
            interaction.member.roles.add(roleIDs[guildId][interaction.options.data[0].options[0].value], reason="by user request");
            await interaction.editReply({ content: String(`Acces has been granted successfully.`), ephemeral: true });
        } else if (interaction.options.data[0].name == "disable") {
            interaction.member.roles.remove(roleIDs[guildId][interaction.options.data[0].options[0].value], reason="by user request");
            await interaction.editReply({ content: String(`Acces has been revoked successfully.`), ephemeral: true });
        }
    }
}