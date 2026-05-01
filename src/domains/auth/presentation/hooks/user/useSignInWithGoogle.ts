"use client";

import { useMutation } from "@tanstack/react-query";

import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";

import { signInWithGoogle } from "@/domains/auth/core/usecases/user/signInWithGoogle";
import { createSupabaseAuthGateway } from "@/domains/auth/infrastructure/supabase/AuthGateway.supabase";

export const useSignInWithGoogle = (redirectPath?: string) => {
  const gateway = createSupabaseAuthGateway(createSupabaseBrowserClient());

  return useMutation({
    mutationFn: () => signInWithGoogle(gateway, redirectPath),
  });
};
