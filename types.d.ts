import { Client, CommandInteraction, Collection } from "discord.js";

interface ClientProps extends Client {
  commands?: Collection<string, any>;
}

interface dbFormatProps {
  [keyName: string]: {
    [keyName: string]: string | boolean;
  }
}