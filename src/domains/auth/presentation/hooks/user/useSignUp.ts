"use client";

import { useMutation } from "@tanstack/react-query";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";
import { useAppRouter } from "@/shared/navigation/useAppRouter";

import type { SignUpInput } from "@/domains/auth/core/domain/auth.types";
import { signUpUser } from "@/domains/auth/core/usecases/user/signUpUser";
import { writeSessionCookieAction } from "@/domains/auth/infrastructure/actions/writeSessionCookieAction";
import { createSupabaseAuthGateway } from "@/domains/auth/infrastructure/supabase/AuthGateway.supabase";

export const useSignUp = (redirectPath: string = PAGE_ROUTES.WORKSPACE) => {
  const router = useAppRouter();
  const gateway = createSupabaseAuthGateway(createSupabaseBrowserClient());

  return useMutation({
    mutationFn: (input: SignUpInput) => signUpUser(gateway, input),
    onSuccess: async (result) => {
      if (!result.requiresEmailVerification && result.session) {
        await writeSessionCookieAction();
        router.push(redirectPath);
      }
      // requiresEmailVerification=true → component reads mutation.data and shows verification screen
    },
  });
};
