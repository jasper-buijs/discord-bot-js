import { Cron } from "croner";
import { Database } from "bun:sqlite";
import type { JobInformation } from "../types";

/**
 * Register a planned or recurring function.
 *
 * @param {string} name - The descriptive name of the function
 * @param timestamps - Array of cron strings
 * @param function_ - The callback function to run
 * @param [args] - The arguments to pass along
 *
 * @return {Promise<JobInformation[]>} - An array of information objects for each timestamp.
 *
 * @example register("function name", ["0 13 * * *", "0 14 * * *"], function, arg1, arg2)
 */
export async function register(name: string, timestamps: string[], function_: Function, ...args: any[]): Promise<JobInformation[]> {
  const db = new Database(import.meta.dir + "/../db.sqlite");
  const response: JobInformation[] = [];
  timestamps.forEach(timestamp => {
    const job = new Cron(timestamp, () => function_(...args), { name: name });
    const registerToDB = db.query(`INSERT INTO schedule (name, function, arguments) VALUES ($name, $func, $arg);`);
    const jobID = registerToDB.run({ $name: name, $func: String(function_), $arg: JSON.stringify(args) }).lastInsertRowid;
    response.push({
      timestamp: timestamp,
      id: jobID,
      job: job
    });
  });
  db.close(false);
  return response;
}