const { SlashCommandBuilder } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder().setName("play").setDescription("Play a song in a voice channel.").addStringOption(op => 
        op.setName("song").setDescription("The name or url of the song you want to play.").setRequired(true)),
    async execute(client, interaction) {
        await interaction.deferReply({ ephemeral: true });
        const memberChannel = interaction.member.voice.channel;
        if (!memberChannel) return await interaction.editReply({ content: "You must be in a voice channel if you want to play music.", ephemeral: true });
        if (interaction.guild.members.me.voice.channelId && interaction.guild.members.me.voice.channelId != memberChannel.id) return await interaction.editReply({ content: "I'm already playing music in a diffrent voice channel. Please try again later.", ephemeral: true });
        const query = interaction.options.getString("song");
        const { track } = await client.player.play(interaction.member.voice.channel, query, {
            nodeOptions: {
                leaveOnEmpty: true,
                leaveOnEmptyCooldown: 0,
                leaveOnEnd: true,
                leaveOnEndCooldown: 300000,
                leaveOnStop: true,
                leaveOnStopCooldown: 300000,
                metadata: {
                    interaction: interaction,
                    requestMember: interaction.member,
                    textChannel: interaction.channel
                },
                selfDeaf: true,
                volume: 45
            }
        });
        await interaction.editReply({ content: `I'm loading and queuing your song "${track.title}".`, ephemeral: true });
    }
}