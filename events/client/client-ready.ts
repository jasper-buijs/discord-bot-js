// noinspection JSUnusedGlobalSymbols

import type { ClientProps } from "../../types";
import { Events } from "discord.js";
import { Database } from "bun:sqlite";

export const name = Events.ClientReady;
export const once = true;

export async function execute(client: ClientProps, ..._args: any[]): Promise<void> {
  console.log("> Logged in and ready!");
  client.user?.setStatus("online");

  /* CLEAR DATABASE > SCHEDULE */
  const db = new Database(import.meta.dir + "/../../db.sqlite");
  db.query(`DELETE FROM schedule;`).run();
  db.close(false);
}