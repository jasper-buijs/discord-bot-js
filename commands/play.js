const { QueryType } = require("discord-player");
const { SlashCommandBuilder } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder().setName("play").setDescription("Play a song in a voice channel.").addStringOption(op => 
        op.setName("song").setDescription("The name or url of the song you want to play.").setRequired(true)).addStringOption(op =>
        op.setName("platform").setDescription("The platform or website to play the music from, defaulting to youtube.").setRequired(false).setChoices(
            { name: "Youtube", value: QueryType.YOUTUBE },
            { name: "Spotify", value: QueryType.SPOTIFY_SEARCH },
            { name: "Apple Music", value: QueryType.APPLE_MUSIC_SEARCH },
            { name: "SoundCloud", value: QueryType.SOUNDCLOUD },
            { name: "File / URL", value: QueryType.AUTO }
        )),
    async execute(client, interaction) {
        await interaction.deferReply({ ephemeral: true });
        if (interaction.options.getString("platform") == QueryType.AUTO && !/^https?:\/\/(.+\/)+.+(\.(aac|aiff|flac|m4a|mp3|wav|wma))$/.test(interaction.options.getString("song"))) {
            console.log("yes");
        }
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
            },
            requestedBy: interaction.user,
            searchEngine: interaction.options.getString("platform") ?? QueryType.YOUTUBE
        });
        await interaction.editReply({ content: `I'm loading and queuing your song "${track.title}".`, ephemeral: true });
    }
}