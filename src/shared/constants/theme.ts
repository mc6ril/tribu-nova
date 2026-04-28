import { isNonEmptyString } from "@/shared/utils";

export type Theme = "light" | "dark" | "system";

export const isTheme = (value: string): value is Theme => {
  if (isNonEmptyString(value)) {
    return ["light", "dark", "system"].includes(value);
  }
  return false;
};
