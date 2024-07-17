import { Client, Collection } from "discord.js";
import type { ClientProps } from "./types";
import { Database } from "bun:sqlite";

export default class Wumpus extends Client implements ClientProps {
  public guildId = Bun.env.GUILDID;
  public db = new Database("db.sqlite");
  public commands = new Collection<string, any>();
}