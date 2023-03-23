const playdl = require("play-dl");
const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require("@discordjs/voice");
module.exports = {
    data: new SlashCommandBuilder().setName("play").setDescription("Play a song in a voice channel.").addStringOption(op => op.setName("song").setDescription("name or url of the song you want to play.").setRequired(true)),
    async execute(client, interaction) {
        if (!interaction.member.voice.channelId) {
            console.log("> ERROR with MUSIC: user not in voice channel");
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
            leaveOnEmptyCooldown: 0,
            leaveOnEnd: true,
            leaveOnEndCooldown: 300000,
            leaveOnStop: true,
            leaveOnStopCooldown: 300000
        });
        try {
            if (!client.queue.connection) await client.queue.connect(interaction.member.voice.channel); // error
        } catch {
            client.queue.delete();
            console.log("> ERROR with MUSIC: could not connect to voice channel.");
            return await interaction.followUp({ content: "Could not join your voice channel!", ephemeral: true });
        }
        const track = await client.player.search(query, {
            requestedBy: interaction.user,
            searchEngine: "youtube",
            fallbackSearchEngine: "auto"
        }).then(result => result.tracks[0]);
        if (!track) return await interaction.editReply({ content: `I could not find anything for "${query}".` });
        // longer than 15:00 song
        if (track.durationMS >= 899000) {
            if (!(await client.queue.getSize()) && !(await client.queue.node.isPlaying())) await client.queue.delete();
            interactionToDelete = await interaction.editReply({ content: `I can't play songs that are longer than 15 minutes. That song was ${track.duration} long.` });
            setTimeout(async function(message){
                try {
                    await message.delete();
                } catch {
                    // ephemeral message already dismissed
                }
            }, 15000, interactionToDelete);
            return interactionToDelete;
        }
        // longer than 15:00 queue (This only works because if the length goes above one hour, it would have been stopped above. Shit code! UPDATE I think this is no longer the case, check later!)
        let queueLength = track.durationMS;
        if (await client.queue.node.isPlaying()) {
            queueLength += client.queue.currentTrack.durationMS;
        }
        if (client.queue.tracks[0]) {
            for (tIndex in client.queue.tracks) {
                queueLength += client.queue.tracks[tIndex].durationMS;
            }
        }
        if (queueLength >= 870000) {
            interactionToDelete = await interaction.editReply({ content: `I can't handle queues that are longer than 15 minutes. Try again in a moment.` });
            setTimeout(async function(message){
                try {
                    await message.delete();
                } catch {
                    // ephemeral message already dismissed
                }
            }, 15000, interactionToDelete);
            return interactionToDelete;
        }
        await client.queue.addTrack(track);
        if (!client.queue.isPlaying()) await client.queue.node.play();
        return await interaction.editReply({ content: `I'm loading your song "${track.title}".`});
    }
}