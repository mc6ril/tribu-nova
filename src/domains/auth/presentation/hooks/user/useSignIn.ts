"use client";

import { useCallback, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";
import { useAppRouter } from "@/shared/navigation/useAppRouter";

import type { SignInInput } from "@/domains/auth/core/domain/auth.types";
import { signInUser } from "@/domains/auth/core/usecases/user/signInUser";
import { writeSessionCookieAction } from "@/domains/auth/infrastructure/actions/writeSessionCookieAction";
import { createSupabaseAuthGateway } from "@/domains/auth/infrastructure/supabase/AuthGateway.supabase";

export const useSignIn = (redirectPath: string = PAGE_ROUTES.WORKSPACE) => {
  const router = useAppRouter();
  const gateway = useMemo(
    () => createSupabaseAuthGateway(createSupabaseBrowserClient()),
    []
  );

  const mutationFn = useCallback(
    (input: SignInInput) => signInUser(gateway, input),
    [gateway]
  );

  const onSuccess = useCallback(async () => {
    await writeSessionCookieAction();
    router.push(redirectPath);
  }, [redirectPath, router]);

  return useMutation({
    mutationFn,
    onSuccess,
  });
};
