/**
 * Shared presets used anywhere the UI lets the user choose a project emoji.
 */
export const PROJECT_BOARD_EMOJI_PRESETS = [
  "📋",
  "🎯",
  "🚀",
  "💼",
  "🎨",
  "🔧",
  "📌",
  "✅",
  "🌟",
  "📁",
  "🔔",
  "💡",
] as const;

export type ProjectBoardEmojiPreset =
  (typeof PROJECT_BOARD_EMOJI_PRESETS)[number];

/**
 * Removes a leading board emoji preset from a project name.
 */
export const stripProjectBoardEmojiPrefix = (value: string): string => {
  const trimmed = value.trim();

  for (const emoji of PROJECT_BOARD_EMOJI_PRESETS) {
    if (trimmed.startsWith(`${emoji} `)) {
      return trimmed.slice(emoji.length + 1).trim();
    }
  }

  return trimmed;
};
