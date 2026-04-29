export enum PasswordStrength {
  NONE = "none",
  WEAK = "weak",
  MEDIUM = "medium",
  STRONG = "strong",
}

export type PasswordStrengthCriteria = {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
};

const MIN_LENGTH_THRESHOLD = 6;
const MEDIUM_LENGTH_THRESHOLD = 10;

export const evaluatePasswordCriteria = (
  password: string
): PasswordStrengthCriteria => ({
  hasMinLength: password.length >= MIN_LENGTH_THRESHOLD,
  hasUppercase: /[A-Z]/.test(password),
  hasLowercase: /[a-z]/.test(password),
  hasNumber: /\d/.test(password),
  hasSpecialChar: /[^A-Za-z0-9]/.test(password),
});

const CRITERIA_ORDER: (keyof PasswordStrengthCriteria)[] = [
  "hasMinLength",
  "hasUppercase",
  "hasLowercase",
  "hasNumber",
  "hasSpecialChar",
];

export const getNextUnmetCriterion = (
  password: string
): keyof PasswordStrengthCriteria | null => {
  if (!password) {
    return "hasMinLength";
  }

  const criteria = evaluatePasswordCriteria(password);
  return CRITERIA_ORDER.find((key) => !criteria[key]) ?? null;
};

const STRENGTH_LEVEL: Record<PasswordStrength, number> = {
  [PasswordStrength.NONE]: 0,
  [PasswordStrength.WEAK]: 1,
  [PasswordStrength.MEDIUM]: 2,
  [PasswordStrength.STRONG]: 3,
};

export const MAX_STRENGTH_LEVEL = STRENGTH_LEVEL[PasswordStrength.STRONG];

export const getPasswordStrengthLevel = (strength: PasswordStrength): number =>
  STRENGTH_LEVEL[strength];

export const calculatePasswordStrength = (
  password: string
): PasswordStrength => {
  if (!password) {
    return PasswordStrength.NONE;
  }

  const criteria = evaluatePasswordCriteria(password);

  if (!criteria.hasMinLength) {
    return PasswordStrength.WEAK;
  }

  const metCount = Object.values(criteria).filter(Boolean).length;

  if (metCount >= 5 && password.length >= MEDIUM_LENGTH_THRESHOLD) {
    return PasswordStrength.STRONG;
  }

  if (metCount >= 3) {
    return PasswordStrength.MEDIUM;
  }

  return PasswordStrength.WEAK;
};
