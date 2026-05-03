"use client";

import { useCallback, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";
import { useAppRouter } from "@/shared/navigation/useAppRouter";

import type { UpdatePasswordInput } from "@/domains/auth/core/domain/auth.types";
import { updatePassword } from "@/domains/auth/core/usecases/password/updatePassword";
import { writeSessionCookieAction } from "@/domains/auth/infrastructure/actions/writeSessionCookieAction";
import { createSupabaseAuthGateway } from "@/domains/auth/infrastructure/supabase/AuthGateway.supabase";

export const useUpdatePassword = () => {
  const router = useAppRouter();
  const gateway = useMemo(
    () => createSupabaseAuthGateway(createSupabaseBrowserClient()),
    []
  );
  const mutationFn = useCallback(
    (input: UpdatePasswordInput) => updatePassword(gateway, input),
    [gateway]
  );
  const onSuccess = useCallback(async () => {
    await writeSessionCookieAction();
    router.push(PAGE_ROUTES.WORKSPACE);
  }, [router]);

  return useMutation({
    mutationFn,
    onSuccess,
  });
};
