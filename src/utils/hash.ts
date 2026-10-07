/**
 * SHA-256 hash of a password, hex encoded.
 * NOTE: this is a mock-app measure so plain passwords are never written to db.json.
 * A real app must hash (with a salt, e.g. bcrypt/argon2) on a server.
 */
export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
