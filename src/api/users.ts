import { http } from "./http";
import type { User } from "../types";

/** Case-insensitive lookup: json-server's equality filter is case-sensitive, so we compare ourselves. */
export async function findUserByUsername(username: string): Promise<User[]> {
  const all = await http<User[]>(`/users?username_like=${encodeURIComponent(`^${escapeRegex(username)}$`)}`);
  const wanted = username.toLowerCase();
  return all.filter((u) => u.username.toLowerCase() === wanted);
}

export function getUser(id: number): Promise<User> {
  return http<User>(`/users/${id}`);
}

export function createUser(input: Omit<User, "id">): Promise<User> {
  return http<User>("/users", { method: "POST", body: JSON.stringify(input) });
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
