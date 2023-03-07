const playdl = require("play-dl");
const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require("@discordjs/voice");
module.exports = {
    data: new SlashCommandBuilder().setName("play").setDescription("Play a song in a voice channel.").addStringOption(op => op.setName("song").setDescription("name or url of the song you want to play.").setRequired(true)),
    async execute(client, interaction) {
        if (!interaction.member.voice.channelId) {
            console.log("> ERROR with MUSIC: user not in voice channel")
            return await interaction.reply({ content: "You are not in a voice channel.", ephemeral: true });
        }
        if (interaction.guild.members.me.voice.channelId && interaction.member.voice.channelId != interaction.guild.members.me.voice.channelId) {
            console.log("> ERROR with MUSIC: user in diffrent voice channel.");
            return await interaction.reply({ content: "You are not in my voice channel!", ephemeral: true });
        }
        await interaction.deferReply({ ephemeral: true });
        const query = interaction.options.getString("song");
        client.queue = client.player.nodes.create(interaction.guild, {
            metadata: {
                interaction: interaction,
                channel: interaction.channel
            },
            selfDeaf: true,
            leaveOnEmpty: true,
            leaveOnEmptyCooldown: 10,
            leaveOnEnd: true,
            leaveOnEndCooldown: 10,
            leaveOnStop: true,
            leaveOnStopCooldown: 10,
            repeatMode: false
            /*async onBeforeCreateStream(track, source, _queue) {
                if (source === "youtube") {
                    return (await playdl.stream(track.url, { discordPlayerCompatibility: true })).stream;
                }
            }*/
        });
        try {
            if (!client.queue.connection) await client.queue.connect(interaction.member.voice.channel); // error
        } catch {
            client.queue.delete();
            console.log("> ERROR with MUSIC: could not connect to voice channel.");
            return await interaction.followUp({ content: "Could not join your voice channel!", ephemeral: true });
        }
        const track = await client.player.search(query, {
            requestedBy: interaction.user
        }).then(result => result.tracks[0]);
        if (!track) return await interaction.editReply({ content: `I could not find anything for "${query}".` });
        // time filters here
        await client.queue.addTrack(track);
        //if (!client.queue.isPlaying()) await client.queue.node.play(track);
        if (!client.queue.isPlaying()) await client.queue.node.play();
        return await interaction.editReply({ content: `I'm loading your song "${track.title}".`});
    }
}