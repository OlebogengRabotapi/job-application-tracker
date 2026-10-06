import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createUser, findUserByUsername, getUser } from "../api/users";
import type { PublicUser, User } from "../types";
import { hashPassword } from "../utils/hash";

const SESSION_KEY = "jobtrack_session";

interface AuthContextValue {
  user: PublicUser | null;
  /** true while we are restoring a saved session on first load */
  loading: boolean;
  register: (username: string, password: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toPublic(user: User): PublicUser {
  return { id: user.id, username: user.username };
}

function readSession(): number | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    const id = raw ? Number(raw) : NaN;
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}

function writeSession(id: number | null) {
  try {
    if (id === null) localStorage.removeItem(SESSION_KEY);
    else localStorage.setItem(SESSION_KEY, String(id));
  } catch {
    /* storage unavailable: session lasts until reload */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore the session on first load by re-checking the user on the server.
  useEffect(() => {
    let cancelled = false;
    const id = readSession();
    if (id === null) {
      setLoading(false);
      return;
    }
    getUser(id)
      .then((u) => {
        if (!cancelled) setUser(toPublic(u));
      })
      .catch(() => writeSession(null))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    const name = username.trim();
    const existing = await findUserByUsername(name);
    if (existing.length > 0) throw new Error("That username is already taken.");
    const created = await createUser({
      username: name,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    });
    writeSession(created.id);
    setUser(toPublic(created));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const matches = await findUserByUsername(username.trim());
    const hash = await hashPassword(password);
    const found = matches.find((u) => u.passwordHash === hash);
    // One message for "no such user" and "wrong password" so usernames can't be probed.
    if (!found) throw new Error("Incorrect username or password.");
    writeSession(found.id);
    setUser(toPublic(found));
  }, []);

  const logout = useCallback(() => {
    writeSession(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, register, login, logout }),
    [user, loading, register, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
