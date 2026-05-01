"use client";

import { useMutation } from "@tanstack/react-query";

import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";

import { resendVerificationEmail } from "@/domains/auth/core/usecases/resendVerificationEmail";
import { createSupabaseAuthGateway } from "@/domains/auth/infrastructure/supabase/AuthGateway.supabase";

export const useResendVerificationEmail = () => {
  const gateway = createSupabaseAuthGateway(createSupabaseBrowserClient());

  return useMutation({
    mutationFn: (email: string) => resendVerificationEmail(gateway, email),
  });
};
