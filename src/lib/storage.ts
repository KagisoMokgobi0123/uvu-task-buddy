// LocalStorage-backed persistence for UVU AI Workplace Assistant
export type HistoryKind = "email" | "summary" | "plan" | "chat";

export interface HistoryEntry {
  id: string;
  kind: HistoryKind;
  title: string;
  content: string;
  meta?: Record<string, unknown>;
  createdAt: number;
}

export interface UserProfile {
  fullName: string;
  email: string;
  role: string;
  company: string;
  language: string;
  theme: "light" | "dark" | "system";
  notifications: boolean;
  aiTone: string;
}

interface UserRecord {
  email: string;
  fullName: string;
  passwordHash: string;
  createdAt: number;
}

const USERS_KEY = "uvu.users";
const SESSION_KEY = "uvu.session";

function safeWindow(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function hashPassword(pw: string): Promise<string> {
  const data = new TextEncoder().encode(`uvu::${pw}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function loadUsers(): Record<string, UserRecord> {
  const ls = safeWindow();
  if (!ls) return {};
  try {
    return JSON.parse(ls.getItem(USERS_KEY) ?? "{}") as Record<string, UserRecord>;
  } catch {
    return {};
  }
}

function saveUsers(u: Record<string, UserRecord>) {
  const ls = safeWindow();
  if (!ls) return;
  ls.setItem(USERS_KEY, JSON.stringify(u));
}

export function currentEmail(): string | null {
  const ls = safeWindow();
  if (!ls) return null;
  try {
    const raw = ls.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as { email?: string };
    return s.email ? normalizeEmail(s.email) : null;
  } catch {
    return null;
  }
}

export function isAuthed(): boolean {
  return currentEmail() !== null;
}

export async function registerUser(
  email: string,
  password: string,
  fullName: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const ls = safeWindow();
  if (!ls) return { ok: false, error: "Storage unavailable" };
  const key = normalizeEmail(email);
  const users = loadUsers();
  if (users[key]) return { ok: false, error: "An account with this email already exists" };
  users[key] = {
    email: key,
    fullName: fullName.trim() || key.split("@")[0],
    passwordHash: await hashPassword(password),
    createdAt: Date.now(),
  };
  saveUsers(users);
  // Seed profile
  const profile: UserProfile = {
    ...DEFAULT_PROFILE,
    email: key,
    fullName: users[key].fullName,
  };
  ls.setItem(profileKey(key), JSON.stringify(profile));
  ls.setItem(SESSION_KEY, JSON.stringify({ email: key }));
  window.dispatchEvent(new Event("uvu:profile-changed"));
  return { ok: true };
}

export async function signInUser(
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const ls = safeWindow();
  if (!ls) return { ok: false, error: "Storage unavailable" };
  const key = normalizeEmail(email);
  const users = loadUsers();
  const user = users[key];
  if (!user) return { ok: false, error: "No account found. Please sign up first." };
  const hash = await hashPassword(password);
  if (hash !== user.passwordHash) return { ok: false, error: "Incorrect password" };
  ls.setItem(SESSION_KEY, JSON.stringify({ email: key }));
  window.dispatchEvent(new Event("uvu:profile-changed"));
  return { ok: true };
}

export function signOutUser() {
  const ls = safeWindow();
  if (!ls) return;
  ls.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("uvu:profile-changed"));
}

// Legacy shim
export function setAuthed(v: boolean) {
  if (!v) signOutUser();
}

// Namespaced keys
function historyKey(email: string) {
  return `uvu.history:${email}`;
}
function chatKey(email: string) {
  return `uvu.chat.messages:${email}`;
}
function profileKey(email: string) {
  return `uvu.profile:${email}`;
}

export function loadHistory(): HistoryEntry[] {
  const ls = safeWindow();
  const email = currentEmail();
  if (!ls || !email) return [];
  try {
    return JSON.parse(ls.getItem(historyKey(email)) ?? "[]") as HistoryEntry[];
  } catch {
    return [];
  }
}

export function saveHistoryEntry(entry: Omit<HistoryEntry, "id" | "createdAt">): HistoryEntry {
  const full: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  const ls = safeWindow();
  const email = currentEmail();
  if (!ls || !email) return full;
  const all = loadHistory();
  all.unshift(full);
  ls.setItem(historyKey(email), JSON.stringify(all.slice(0, 200)));
  window.dispatchEvent(new Event("uvu:history-changed"));
  return full;
}

export function deleteHistoryEntry(id: string) {
  const ls = safeWindow();
  const email = currentEmail();
  if (!ls || !email) return;
  const all = loadHistory().filter((e) => e.id !== id);
  ls.setItem(historyKey(email), JSON.stringify(all));
  window.dispatchEvent(new Event("uvu:history-changed"));
}

const DEFAULT_PROFILE: UserProfile = {
  fullName: "",
  email: "",
  role: "Employee",
  company: "UVU",
  language: "English",
  theme: "system",
  notifications: true,
  aiTone: "Professional",
};

export function loadProfile(): UserProfile {
  const ls = safeWindow();
  const email = currentEmail();
  if (!ls || !email) return { ...DEFAULT_PROFILE };
  try {
    const raw = ls.getItem(profileKey(email));
    return { ...DEFAULT_PROFILE, email, ...(JSON.parse(raw ?? "{}") as Partial<UserProfile>) };
  } catch {
    return { ...DEFAULT_PROFILE, email };
  }
}

export function saveProfile(p: UserProfile) {
  const ls = safeWindow();
  const email = currentEmail();
  if (!ls || !email) return;
  ls.setItem(profileKey(email), JSON.stringify({ ...p, email }));
  window.dispatchEvent(new Event("uvu:profile-changed"));
}

export interface StoredChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function loadChat(): StoredChatMessage[] {
  const ls = safeWindow();
  const email = currentEmail();
  if (!ls || !email) return [];
  try {
    return JSON.parse(ls.getItem(chatKey(email)) ?? "[]") as StoredChatMessage[];
  } catch {
    return [];
  }
}

export function saveChat(messages: StoredChatMessage[]) {
  const ls = safeWindow();
  const email = currentEmail();
  if (!ls || !email) return;
  ls.setItem(chatKey(email), JSON.stringify(messages));
}

export function clearChat() {
  const ls = safeWindow();
  const email = currentEmail();
  if (!ls || !email) return;
  ls.removeItem(chatKey(email));
}
