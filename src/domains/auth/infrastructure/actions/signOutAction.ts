"use server";

import { clearAppSessionCookie } from "@/shared/infrastructure/auth/appSessionCookie.server";
import { getServerClient } from "@/shared/infrastructure/supabase/client-server";

import { handleAuthError } from "@/domains/auth/infrastructure/errors/authErrorHandler";

export const signOutAction = async (): Promise<void> => {
  try {
    const supabase = await getServerClient();
    const { error } = await supabase.auth.signOut();
    if (error) return handleAuthError(error);
    await clearAppSessionCookie();
  } catch (error) {
    return handleAuthError(error);
  }
};
