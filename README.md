# discord-bot-js
Discord bot with discord.js for private server.

## Starting the Bot
When starting, you should always do the following things:
1. Make sure you're branched correctly.
2. Pull changes from Github.
3. Update packages using `npm install` in terminal.
4. When launching the bot, only if there are new commands or there are commands with updated structures, run `npm run deploy`.
5. Run `npm run main` to launch the bot; and press `Ctrl+C` in the terminal to stop it again.

## Useful Documentation
General documentation on the Discord API (used by packages) can be found [here](https://discord.com/developers/docs).
Documentation for the most imporatant packages used:
- [discord.js](https://discord.js.org/#/) and some subpackages (@discordjs/voice, @discordjs/rest, @discordjs/player) for general Discord support.
- [discord-player](https://discord-player.js.org/) and a subpackage (@discord-player/extractor) to be able to stream music to Discord.
- [node-schedule](https://github.com/node-schedule/node-schedule#cron-style-scheduling) to run code at a specific time each day, week or month.