"use server";

import { getServerClient } from "@/shared/infrastructure/supabase/client-server";

import { clearAppSessionCookie } from "@/domains/session/infrastructure/supabase/writeAppSessionCookie";

export const signOutAction = async (): Promise<void> => {
  const supabase = await getServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
  await clearAppSessionCookie();
};
