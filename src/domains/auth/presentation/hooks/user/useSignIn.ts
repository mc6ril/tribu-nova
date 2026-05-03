"use client";

import { useMutation } from "@tanstack/react-query";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";
import { useAppRouter } from "@/shared/navigation/useAppRouter";
import { createLoggerFactory } from "@/shared/observability";

import type { SignInInput } from "@/domains/auth/core/domain/auth.types";
import { signInUser } from "@/domains/auth/core/usecases/user/signInUser";
import { writeSessionCookieAction } from "@/domains/auth/infrastructure/actions/writeSessionCookieAction";
import { createSupabaseAuthGateway } from "@/domains/auth/infrastructure/supabase/AuthGateway.supabase";

const logger = createLoggerFactory().forScope("auth.signin.hook");

export const useSignIn = (redirectPath: string = PAGE_ROUTES.WORKSPACE) => {
  logger.info("useSignIn entry", {
    function: "useSignIn",
    redirectPath,
  });

  const router = useAppRouter();
  const gateway = createSupabaseAuthGateway(createSupabaseBrowserClient());

  return useMutation({
    mutationFn: (input: SignInInput) => {
      logger.info("mutationFn entry", {
        function: "mutationFn",
        email: input.email,
        redirectPath,
      });
      return signInUser(gateway, input, createLoggerFactory());
    },
    onSuccess: async (result) => {
      logger.info("onSuccess entry", {
        function: "onSuccess",
        hasSession: Boolean(result.session),
        sessionEmail: result.session?.user.email,
        redirectPath,
      });
      await writeSessionCookieAction();
      logger.info("session cookie action resolved", {
        function: "onSuccess",
        redirectPath,
      });
      router.push(redirectPath);
      logger.info("router push requested", {
        function: "onSuccess",
        redirectPath,
      });
    },
  });
};
