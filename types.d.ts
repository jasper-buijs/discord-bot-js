import { Collection, Client } from "discord.js";
import type { Database } from "bun:sqlite";

interface ClientProps extends Client {
  guildId: string;
  db: Database;
  commands: Collection<string, any>;
}

interface dbFormatProps extends object {
  [keyName: string]: {
    [keyName: string]: string | boolean;
  }
}