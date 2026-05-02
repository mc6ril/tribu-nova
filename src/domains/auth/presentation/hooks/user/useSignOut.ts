"use client";

import { useMutation } from "@tanstack/react-query";

import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";
import { useAppRouter } from "@/shared/navigation/useAppRouter";

import { signOutUser } from "@/domains/auth/core/usecases/user/signOutUser";
import { createSupabaseAuthGateway } from "@/domains/auth/infrastructure/supabase/AuthGateway.supabase";

export const useSignOut = () => {
  const router = useAppRouter();
  const gateway = createSupabaseAuthGateway(createSupabaseBrowserClient());

  return useMutation({
    mutationFn: async () => {
      await signOutUser(gateway);
    },
    onSuccess: () => {
      router.push("/");
    },
  });
};
