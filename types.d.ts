import { Client, CommandInteraction, Collection } from "discord.js";

interface ClientProps extends Client {
  commands?: Collection<string, any>;
}
