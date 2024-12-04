import { Collection, Client } from "discord.js";
import type { Database } from "bun:sqlite";
import type { Cron } from "croner";

interface ClientProps extends Client {
  guildId: string;
  db: Database;
  commands: Collection<string, any>;
}

interface DBFormatProps extends object {
  [keyName: string]: {
    [keyName: string]: string | boolean;
  }
}

/* SCHEDULES */
interface JobInformation {
  timestamp: string;
  id: number | bigint;
  job: Cron;
}