/// <reference types="bun-types/overrides.d.ts" />

declare module "bun" {
  interface Env {
    TOKEN: string;
    GUILDID: string;
    CLIENTID: string;
  }
}