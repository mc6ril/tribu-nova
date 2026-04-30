"use client";

import type { AuthSession } from "@/domains/session/core/domain/session.types";

const STORAGE_KEY = "workbench:auth:session:v1";
let inMemorySession: AuthSession | null = null;

const isBrowser = (): boolean => typeof window !== "undefined";

export const getPersistedAuthSession = (): AuthSession | null => {
  if (inMemorySession) {
    return inMemorySession;
  }

  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as AuthSession;
    inMemorySession = parsed;
    return parsed;
  } catch {
    return null;
  }
};

export const persistAuthSession = (session: AuthSession | null): void => {
  inMemorySession = session;

  if (!isBrowser()) {
    return;
  }

  try {
    if (!session) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage quota / privacy mode issues.
  }
};
