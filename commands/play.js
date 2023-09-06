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
        let query = interaction.options.getString("song");
        let engine = interaction.options.getString("platform") ?? QueryType.YOUTUBE;
        if (/^https?:\/\/(.+\/)+.+$/.test(query)) {
            engine = QueryType.AUTO;
        }
        if (interaction.options.getString("platform") == QueryType.AUTO && !/^https?:\/\/(.+\/)+.+(\.(aac|aiff|flac|m4a|mp3|wav|wma))$/.test(query)) {
            return await interaction.editReply({ content: "Either you didn't pass a url to an audio file or song.", ephemeral: true });
        }
        const memberChannel = interaction.member.voice.channel;
        if (!memberChannel) return await interaction.editReply({ content: "You must be in a voice channel if you want to play music.", ephemeral: true });
        if (interaction.guild.members.me.voice.channelId && interaction.guild.members.me.voice.channelId != memberChannel.id) return await interaction.editReply({ content: "I'm already playing music in a diffrent voice channel. Please try again later.", ephemeral: true });
        //const query = interaction.options.getString("song");
        const result = await client.player.search(query, {
            requestedBy: interaction.user,
            searchEngine: engine
        }).then(results => results.tracks[0]);
        //console.log(result.durationMS);
        if (!result) return await interaction.editReply({ content: `I couldn't find any songs for ${interaction.options.getString("song")} on that platform.`, ephemeral: true });
        else if (result.durationMS > 1800000) return await interaction.editReply({ content: "Unfortunately, I'm not allowed to play songs longer than 30 minutes.", ephemeral: true });
        const { track } = await client.player.play(interaction.member.voice.channel, result, {
            nodeOptions: {
                /*bufferingTimeout: 10000,
                connectionTimeout: 10000,*/
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
            }//,
            //requestedBy: interaction.user,
            //searchEngine: interaction.options.getString("platform") ?? QueryType.YOUTUBE
        });
        await interaction.editReply({ content: `I'm loading and queuing your song "${track.title}".`, ephemeral: true });
    }
}