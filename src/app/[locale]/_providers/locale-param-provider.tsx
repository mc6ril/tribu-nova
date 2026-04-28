"use client";

import { createContext, useContext } from "react";

import type { Locale } from "@/shared/i18n";

const LocaleParamContext = createContext<Locale | null>(null);

export const LocaleParamProvider = ({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) => {
  return (
    <LocaleParamContext.Provider value={locale}>
      {children}
    </LocaleParamContext.Provider>
  );
};

export const useLocaleParam = (): Locale => {
  const value = useContext(LocaleParamContext);
  if (!value) {
    throw new Error("useLocaleParam must be used within LocaleParamProvider");
  }
  return value;
};

