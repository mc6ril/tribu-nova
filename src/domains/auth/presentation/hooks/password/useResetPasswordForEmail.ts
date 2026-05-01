"use client";

import { useMutation } from "@tanstack/react-query";

import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";

import type { ResetPasswordInput } from "@/domains/auth/core/domain/auth.types";
import { resetPasswordForEmail } from "@/domains/auth/core/usecases/password/resetPasswordForEmail";
import { createSupabaseAuthGateway } from "@/domains/auth/infrastructure/supabase/AuthGateway.supabase";

export const useResetPasswordForEmail = () => {
  const gateway = createSupabaseAuthGateway(createSupabaseBrowserClient());

  return useMutation({
    mutationFn: (input: ResetPasswordInput) =>
      resetPasswordForEmail(gateway, input),
  });
};
