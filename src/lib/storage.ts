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

const HISTORY_KEY = "uvu.history";
const PROFILE_KEY = "uvu.profile";
const AUTH_KEY = "uvu.auth";
const CHAT_KEY = "uvu.chat.messages";

function safeWindow(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function loadHistory(): HistoryEntry[] {
  const ls = safeWindow();
  if (!ls) return [];
  try {
    return JSON.parse(ls.getItem(HISTORY_KEY) ?? "[]") as HistoryEntry[];
  } catch {
    return [];
  }
}

export function saveHistoryEntry(entry: Omit<HistoryEntry, "id" | "createdAt">): HistoryEntry {
  const ls = safeWindow();
  const full: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  if (!ls) return full;
  const all = loadHistory();
  all.unshift(full);
  ls.setItem(HISTORY_KEY, JSON.stringify(all.slice(0, 200)));
  window.dispatchEvent(new Event("uvu:history-changed"));
  return full;
}

export function deleteHistoryEntry(id: string) {
  const ls = safeWindow();
  if (!ls) return;
  const all = loadHistory().filter((e) => e.id !== id);
  ls.setItem(HISTORY_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event("uvu:history-changed"));
}

const DEFAULT_PROFILE: UserProfile = {
  fullName: "Demo User",
  email: "demo@uvu.co.za",
  role: "Employee",
  company: "UVU",
  language: "English",
  theme: "system",
  notifications: true,
  aiTone: "Professional",
};

export function loadProfile(): UserProfile {
  const ls = safeWindow();
  if (!ls) return DEFAULT_PROFILE;
  try {
    return { ...DEFAULT_PROFILE, ...(JSON.parse(ls.getItem(PROFILE_KEY) ?? "{}") as Partial<UserProfile>) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(p: UserProfile) {
  const ls = safeWindow();
  if (!ls) return;
  ls.setItem(PROFILE_KEY, JSON.stringify(p));
  window.dispatchEvent(new Event("uvu:profile-changed"));
}

export function isAuthed(): boolean {
  const ls = safeWindow();
  if (!ls) return false;
  return ls.getItem(AUTH_KEY) === "1";
}

export function setAuthed(v: boolean) {
  const ls = safeWindow();
  if (!ls) return;
  if (v) ls.setItem(AUTH_KEY, "1");
  else ls.removeItem(AUTH_KEY);
}

export interface StoredChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function loadChat(): StoredChatMessage[] {
  const ls = safeWindow();
  if (!ls) return [];
  try {
    return JSON.parse(ls.getItem(CHAT_KEY) ?? "[]") as StoredChatMessage[];
  } catch {
    return [];
  }
}

export function saveChat(messages: StoredChatMessage[]) {
  const ls = safeWindow();
  if (!ls) return;
  ls.setItem(CHAT_KEY, JSON.stringify(messages));
}

export function clearChat() {
  const ls = safeWindow();
  if (!ls) return;
  ls.removeItem(CHAT_KEY);
}
