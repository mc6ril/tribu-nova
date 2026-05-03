import type { SupabaseClient } from "@supabase/supabase-js";

import { createAppError } from "@/shared/errors/appError";
import {
  DOMAIN_RULE_ERROR_CODE,
  REPOSITORY_ERROR_CODE,
} from "@/shared/errors/appErrorCodes";
import type { Database } from "@/shared/infrastructure/supabase/database.types";
import { createLoggerFactory } from "@/shared/observability";

import type { AcceptInvitationResult } from "@/domains/project/core/domain/invitation.types";
import type { InvitationGateway } from "@/domains/project/core/ports/invitation.gateway";

const loggerFactory = createLoggerFactory();
const logger = loggerFactory.forScope("infrastructure.invitation");

const mapInvitationError = (error: unknown): never => {
  const message =
    error && typeof error === "object" && "message" in error
      ? String((error as { message?: unknown }).message ?? "").toLowerCase()
      : "";

  logger.warn("Invitation error", { error, message });

  if (message.includes("expired")) {
    throw createAppError(DOMAIN_RULE_ERROR_CODE.INVITATION_EXPIRED, {
      debugMessage: "Invitation token has expired.",
    });
  }

  if (
    message.includes("already used") ||
    message.includes("consumed") ||
    message.includes("accepted")
  ) {
    throw createAppError(DOMAIN_RULE_ERROR_CODE.INVITATION_ALREADY_USED, {
      debugMessage: "Invitation token has already been used.",
    });
  }

  if (
    message.includes("already a member") ||
    message.includes("already member")
  ) {
    throw createAppError(DOMAIN_RULE_ERROR_CODE.INVITATION_ALREADY_MEMBER, {
      debugMessage: "User is already a member of this project.",
    });
  }

  throw createAppError(REPOSITORY_ERROR_CODE.DATABASE_ERROR, {
    debugMessage: message || "Unexpected error while accepting invitation.",
    context: { originalError: error },
  });
};

export const createSupabaseInvitationGateway = (
  supabase: SupabaseClient<Database>
): InvitationGateway => ({
  async acceptInvitation(token: string): Promise<AcceptInvitationResult> {
    const { data, error } = await supabase.rpc("accept_invitation", {
      invitation_token: token,
    });

    if (error) {
      mapInvitationError(error);
    }

    const row = data?.[0];

    if (!row?.project_id) {
      throw createAppError(REPOSITORY_ERROR_CODE.NOT_FOUND, {
        debugMessage: "accept_invitation returned no rows.",
      });
    }

    return {
      projectId: row.project_id,
      projectName: row.project_name,
      role: row.role,
    };
  },
});
