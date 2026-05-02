"use server";

import { getServerClient } from "@/shared/infrastructure/supabase/client-server";

import { writeAppSessionCookie } from "@/domains/auth/infrastructure/supabase/authCookie";

export const writeSessionCookieAction = async (): Promise<void> => {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await writeAppSessionCookie(user);
  }
};
