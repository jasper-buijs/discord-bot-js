import { Client, Collection } from "discord.js";

interface ClientProps extends Client {
  commands?: Collection<string, any>;
}

interface dbFormatProps extends object {
  [keyName: string]: {
    [keyName: string]: string | boolean;
  }
}