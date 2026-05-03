"use client";

import { useCallback, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";
import { useAppRouter } from "@/shared/navigation/useAppRouter";

import type { VerifyEmailInput } from "@/domains/auth/core/domain/auth.types";
import { verifyEmail } from "@/domains/auth/core/usecases/verifyEmail";
import { writeSessionCookieAction } from "@/domains/auth/infrastructure/actions/writeSessionCookieAction";
import { createSupabaseAuthGateway } from "@/domains/auth/infrastructure/supabase/AuthGateway.supabase";

export const useVerifyEmail = () => {
  const router = useAppRouter();
  const gateway = useMemo(
    () => createSupabaseAuthGateway(createSupabaseBrowserClient()),
    []
  );
  const mutationFn = useCallback(
    (input: VerifyEmailInput) => verifyEmail(gateway, input),
    [gateway]
  );
  const onSuccess = useCallback(
    async (result: Awaited<ReturnType<typeof verifyEmail>>) => {
      if (result.session) {
        await writeSessionCookieAction();
        router.replace(PAGE_ROUTES.WORKSPACE);
      }
    },
    [router]
  );

  return useMutation({
    mutationFn,
    onSuccess,
  });
};
