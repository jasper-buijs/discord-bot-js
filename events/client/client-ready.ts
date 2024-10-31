// noinspection JSUnusedGlobalSymbols

import type { ClientProps } from "../../types";
import { Events } from "discord.js";

export const name = Events.ClientReady;
export const once = true;

export async function execute(client: ClientProps, ..._args: any[]): Promise<void> {
  console.log("> Logged in and ready!");
  client.user?.setStatus("online");
}