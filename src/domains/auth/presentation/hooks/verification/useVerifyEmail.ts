"use client";

import { useMutation } from "@tanstack/react-query";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";
import { useAppRouter } from "@/shared/navigation/useAppRouter";

import type { VerifyEmailInput } from "@/domains/auth/core/domain/auth.types";
import { verifyEmail } from "@/domains/auth/core/usecases/verifyEmail";
import { createSupabaseAuthGateway } from "@/domains/auth/infrastructure/supabase/AuthGateway.supabase";

export const useVerifyEmail = () => {
  const router = useAppRouter();
  const gateway = createSupabaseAuthGateway(createSupabaseBrowserClient());

  return useMutation({
    mutationFn: (input: VerifyEmailInput) => verifyEmail(gateway, input),
    onSuccess: (result) => {
      if (result.session) {
        router.replace(PAGE_ROUTES.WORKSPACE);
      }
    },
  });
};
