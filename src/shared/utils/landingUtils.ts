import {
  FEATURE_KEYS,
  PREVIEW_COLUMNS,
  PREVIEW_ITEM_KEYS,
} from "@/shared/constants/landing";
import type {
  FeatureKey,
  FeaturePreviewContent,
  PreviewColumnKey,
} from "@/shared/constants/landing.types";

export const isFeatureKey = (value: string): value is FeatureKey => {
  return FEATURE_KEYS.includes(value as FeatureKey);
};

export const buildFeaturePreviewContent = (
  featureKey: FeatureKey,
  translateExample: (key: string) => string
): FeaturePreviewContent => {
  const columns = PREVIEW_COLUMNS.reduce(
    (accumulator, columnKey) => {
      accumulator[columnKey] = PREVIEW_ITEM_KEYS[columnKey].map((itemKey) =>
        translateExample(`${featureKey}.${itemKey}`)
      );
      return accumulator;
    },
    {} as Record<PreviewColumnKey, string[]>
  );

  return {
    title: translateExample(`${featureKey}.title`),
    description: translateExample(`${featureKey}.description`),
    columns,
  };
};
