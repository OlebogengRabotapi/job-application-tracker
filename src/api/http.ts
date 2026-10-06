const BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3001";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch {
    throw new ApiError(
      "Cannot reach the server. Make sure JSON server is running (npm run dev).",
      0,
    );
  }

  if (!response.ok) {
    throw new ApiError(
      response.status === 404
        ? "That item could not be found."
        : `Request failed (${response.status}).`,
      response.status,
    );
  }

  // DELETE returns "{}"; tolerate empty bodies as well.
  const text = await response.text();
  return (text ? JSON.parse(text) : {}) as T;
}
