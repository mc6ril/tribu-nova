"use client";

import { useCallback, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";

import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";

import type { ResetPasswordInput } from "@/domains/auth/core/domain/auth.types";
import { resetPasswordForEmail } from "@/domains/auth/core/usecases/password/resetPasswordForEmail";
import { createSupabaseAuthGateway } from "@/domains/auth/infrastructure/supabase/AuthGateway.supabase";

export const useResetPasswordForEmail = () => {
  const gateway = useMemo(
    () => createSupabaseAuthGateway(createSupabaseBrowserClient()),
    []
  );
  const mutationFn = useCallback(
    (input: ResetPasswordInput) => resetPasswordForEmail(gateway, input),
    [gateway]
  );

  return useMutation({
    mutationFn,
  });
};
