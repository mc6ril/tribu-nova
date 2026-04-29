import { Profile } from "@/domains/profile/core/domain/profile.types";

export type AuthSession = {
  user: Profile | null;
  expiresAt?: number;
};
