"use client";

import { useMutation } from "@tanstack/react-query";

import { useAppRouter } from "@/shared/navigation/useAppRouter";

import { signOutAction } from "@/domains/auth/infrastructure/actions/signOutAction";

export const useSignOut = () => {
  const router = useAppRouter();

  return useMutation({
    mutationFn: signOutAction,
    onSuccess: () => {
      router.push("/");
    },
  });
};
