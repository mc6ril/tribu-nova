"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

import type { Locale } from "./config";
import {
  getBrowserAcceptLanguage,
  resolveRuntimeLocale,
} from "./runtimeLocale";

const subscribeToRuntimeLocale = () => {
  return () => {};
};

const getServerSnapshot = (pathname: string | null): Locale => {
  return resolveRuntimeLocale({ pathname });
};

const getClientSnapshot = (pathname: string | null): Locale => {
  return resolveRuntimeLocale({
    pathname,
    cookieString: document.cookie,
    acceptLanguage: getBrowserAcceptLanguage(),
  });
};

export const useRuntimeLocaleSnapshot = (): Locale => {
  const pathname = usePathname();

  return useSyncExternalStore(
    subscribeToRuntimeLocale,
    () => getClientSnapshot(pathname),
    () => getServerSnapshot(pathname)
  );
};
