import type { AcceptInvitationResult } from "@/domains/project/core/domain/invitation.types";

export type InvitationGateway = {
  acceptInvitation(token: string): Promise<AcceptInvitationResult>;
};
