export const getAvatarInitials = (input: string | null | undefined): string => {
  if (!input || input.trim().length === 0) {
    return "?";
  }

  const normalized = input.includes("@")
    ? (input.split("@")[0] ?? "").replace(/[._]/g, " ")
    : input;

  const words = normalized.trim().split(/\s+/);

  if (words.length >= 2) {
    return ((words[0]?.[0] ?? "") + (words[1]?.[0] ?? "")).toUpperCase();
  }

  const word = words[0] ?? "";
  if (word.length >= 2) {
    return word.slice(0, 2).toUpperCase();
  }

  if (word.length === 1) {
    return word.toUpperCase();
  }

  return "?";
};
