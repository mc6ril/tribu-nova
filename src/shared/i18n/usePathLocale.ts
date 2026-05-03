"use client";

import { usePathname } from "next/navigation";

import { defaultLocale } from "@/shared/core/i18n";
import { getLocaleFromPathname } from "@/shared/i18n/routing";

export const usePathLocale = () => {
  const pathname = usePathname();
  return getLocaleFromPathname(pathname ?? "") ?? defaultLocale;
};
