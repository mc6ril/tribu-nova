"use client";

import { useMutation } from "@tanstack/react-query";

import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";

import type { AcceptInvitationResult } from "@/domains/project/core/domain/invitation.types";
import { acceptInvitation } from "@/domains/project/core/usecases/acceptInvitation";
import { createSupabaseInvitationGateway } from "@/domains/project/infrastructure/supabase/InvitationGateway.supabase";

export const useAcceptInvitation = () => {
  const gateway = createSupabaseInvitationGateway(
    createSupabaseBrowserClient()
  );

  return useMutation<AcceptInvitationResult, unknown, string>({
    mutationFn: (token: string) => acceptInvitation(gateway, token),
  });
};
