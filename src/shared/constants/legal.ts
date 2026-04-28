/**
 * Legal page section configuration and GDPR rights keys.
 * Used by the legal page to render sections and data protection rights.
 */

export type LegalSection = {
  key: string;
  id: string;
};

export const LEGAL_SECTIONS: LegalSection[] = [
  { key: "editor", id: "legal-editor" },
  { key: "intellectualProperty", id: "legal-intellectual-property" },
  { key: "dataProtection", id: "legal-data-protection" },
  { key: "cookies", id: "legal-cookies" },
  { key: "liability", id: "legal-liability" },
  { key: "applicableLaw", id: "legal-applicable-law" },
];

export const GDPR_RIGHTS_KEYS = [
  "access",
  "rectification",
  "deletion",
  "portability",
] as const;
