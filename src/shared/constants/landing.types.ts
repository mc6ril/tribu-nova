export type FeatureKey =
  (typeof import("@/shared/constants/landing").FEATURE_KEYS)[number];
export type PreviewColumnKey =
  (typeof import("@/shared/constants/landing").PREVIEW_COLUMNS)[number];

export type FeaturePreviewContent = {
  title: string;
  description: string;
  columns: Record<PreviewColumnKey, string[]>;
};
