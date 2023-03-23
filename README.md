# discord-bot-js
Discord bot with discord.js for a private server.

## Starting the Bot
When starting, you should always do the following things:
1. Make sure you're branched correctly.
2. Pull changes from GitHub.
3. Update or install packages by removing everything in the "node_modules" folder and then running `npm install`.
4. If you want to update packages to versions more recent than the last GitHub commit, run `npm-check -u`, hit <kbd>Space</kbd> on all updates you want to install and then hit <kbd>Enter</kbd>.
5. Before launching the bot, run `npm run deploy` to register all commands with Discord.
6. Run `npm run main` to launch the bot; and press `Ctrl+C` in the terminal to stop it again.

## Useful Documentation
General documentation on the Discord API (used by packages) can be found [here](https://discord.com/developers/docs).
Documentation for the most important packages used:
- [discord.js](https://discord.js.org/#/) and some subpackages (@discordjs/voice, @discordjs/rest, @discordjs/player) for general Discord support.
- [discord-player](https://discord-player.js.org/) and a subpackage (@discord-player/extractor) to be able to stream music to Discord.
- [node-schedule](https://github.com/node-schedule/node-schedule#cron-style-scheduling) to run code at a specific time each day, week or month.

## Functionality
### Commands
Our bot currently has six commands, of which four public. The "/ping" command sort of lets you know your and the bot's ping; although its accuracy is very much up for debate. With "/play" you can make the bot play music in a voice channel you're in. "/create-voice-channel" (which is coded in create_private_conversation.js) can be used to temporarily create additional voice channels. And finally, with "/access enable" and "/access disable", users can add or remove themselves from roles, allowing them to access more or less channels about specific subjects. There are also two commands that are for mods only. The "/formula1" command helps in uploading the Formula 1 graphics; and "/move" lets you move all users in a voice call with you to another call all at once.

The "/ping" command (see [ping.js](./commands/ping.js)) provides two things: the user's (theoretical) ping and the ping between the bot and the API. The user's ping is calculated by subtracting the time at which the interaction (which the official name of the *thing* that the bot receives when a user uses any kind of command in Discord) was sent from the time it is now. The time when the interaction is send is calculated from the interaction ID. Almost everything in Discord gets assigned an ID when created. The format of this ID is called snowflake, and part of it consists of the timestamp of creation (if you enable "dev mode" in discord, you can copy IDs of almost everything by right-clicking). Therefore, we can calculate the moment the interaction was created from its ID. The bot-API ping is calculated by discord.js. Both are returned to the user in an ephemeral interaction response, a response only the user who created the interaction will be able to see. Ephemeral messages can be deleted by the user, and will be deleted automatically by Discord when unfocussing the channel they are sent in. Ephemeral messages can, however, only be sent as responses to interactions.

The "/create-voice-channel" command (see [create_private_conversation.js](./commands/create_private_conversation.js)) is also pretty easy. It differentiates between four scenarios, based on whether or not the user who used the command is in a voice channel, and whether or not they set a maximum user size for the new channel. The code then creates a new channel in the guild (which is the word Discord uses for servers) and sets it properties: channel name, type (a voice channel), reason for its creation, position (where in the list of channels it should be), permissions (what users can and can't do in these channels) and optionally a maximum user size. If the user was already in a voice channel, they get moved to the new channel. The reply to the command gets edited, and we save the voice channel in the "global" (but not really global) list of voice channels (`client.temporaryVoiceChannels`).
The reason we "edit" the reply and not "send" it, is because for every command (one of) the first thing(s) you should do is always `interaction.deferReply()` (or `interaction.deferReply({ ephemeral: true })` if you only want the user who used the command to see the reply). To the user, this'll just show like a "BOT is thinking..." message. However, if you don't run this code as soon as possible, the interaction will "expire" almost immediately. After the deferReply, the interaction won't expire until 15 minutes afterwards.

The "/access" commands consists of two subcommands: "/access enable" and "access disable". However, both are really easy. In both cases, we take the name of the role the user wanted to be added to or removed from. We then convert it to that role's ID through an object (like a dictionary in python, quick and dirty). The object has two sets of keys, one for the testing server and one for the main server. We then add or remove that role to/from the user and edit the reply to the interaction.

Maybe the most difficult of all, is the "/play" command. First, we check whether the user is in a voice channel. Then, if he is, we check whether the bot is "available" (in other words, we make sure the bot is not already playing music in a different channel). We get the search terms the user gave and save them as a variable "query". Then we either create a queue, or add to an existing queue (both are done with the `player.nodes.create(...)`- and `queue.addTrack(...)`-commands, and I don't fully understand why either, but it works). We then try to connect the bot to a voice channel. We look for the query the user entered, then take the first track of the results. Then, we check whether the song is longer than 15 minutes. If it is, we can't play it because by the time it would have ended, the interaction would have expired even though we used "deferReply". If this is the case, we send an error back to the user. If it isn't, we also check whether the queue would become longer than 15 minutes (for the same reason). Theoretically, we could "renew" the interactions after every song, and this problem would be solved. However, I haven't gotten around to doing this yet :). Finally, we start playing and edit the reply.

The "/formula1" command is quite complex, and I don't think it's very easy nor interesting to explain it all here.

The "/move" command can only be run by moderators and is therefore not very robust. It can only move from the channel the user is currently in, to a channel the user can specify. Then, every user in the initial channel is moved one by one automatically.

### Context Menus
There are only two context menu commands, both for reporting things that go against the server rules. One for messages, on for users in general. You can run these commands in Discord by right-clicking a message or user, and selecting "Report Message" or "Report User" under "Apps". In both cases, when it's run, the first thing the command does is add a "report" object to the `client.messageReports` or `client.userReports` arrays. For messages, it saves the target message ID, the target message itself, the user that made the report, the reason (unknown at first) and whether action has been taken (false at first). For users, it saves the ID of the reported user, the reported user itself, the reported member itself (user is an object that describes an account on Discord in general, member is an object that describes an account in our specific guild/server), the ID of the user that made the report, the reason (unknown at first) and whether action has been taken (false at first). It then asks the user the reason for the report (in other words the rule that was broken) in a drop-down menu. If the user that reported isn't an administrator, a message describing the report is sentt to #blocked-messages. If the user is an administrator, the message gets deleted (if a message was reported), a message describing the report is sent to #blocked-messages and a message explaining what they did wrong is sent in DM to the user reported.

### Aditional Functions in [index.js](./index.js)
#### Gif Filter
The code in this section runs automatically every time a message is sent somewhere in our guild. It then checks whether the message contains a gif (".gif", "tenor.com", "giphy.com", "imgur.com"). If it does, it checks whether the message was sent in #gifs-and-memes or #adult-content; and if so, it ignores the message. Otherwise, the last 90 messages in that channel are loaded and checked on whether they contain other gif-containing messages from the same user. If there are less than 3, it ignores the messages. Otherwise, it gets the "gif violation level" (a level tracked for each user indicating how many times they have reached the gif limit of 3 since midnight). If there is no such level yet (which means the user is at level 0), the level gets added, otherwise it gets raised by 1 up to 5. If the level was already between 1 and 5, the user gets timed out for 10s, 1min, 5min, 10min, 60min, until midnight. If the time-out length is longer than 1 minute, 15 seconds are subtracted because of a bug with Discord. If the user somehow does it again within the same day (theoretically impossible) they will get timed-out for 24 hours. Then, all (normally 3) gif messages from that user get removed.
#### Empty Channel Check
Every time an update happens in a voice channel (someone connects, leaves, mutes, etc.) an event is send to our bot. When this is received, we check all temporary voice channels (made with the "/create-voice-channel" command) on whether they're empty. If they are empty and older than 20 seconds (to prevent new channels being deleted) will be deleted.
#### Music Buttons
When the pause, skip or stop buttons from the music player are pressed, Discords also create an interaction. These interactions are acted upon here, by (you guessed it) pausing, skipping or stopping the music.
#### Song Starts or Ends
When a song starts to play, we send a message as a reply to the initial response from the "/play" command informing the user their song is starting to play and providing the pause, skip and stop buttons.<br>
When a song is stopped or finishes, we remove the buttons from that message. After 15 seconds, the message is also removed to prevent cluttering of the channel.
#### Midnight Cleanup
Finally, every day at midnight, we do some resets. Everyone's "gif violation level" is reset to 0, and all messages in the voice channels and in command line are removed.