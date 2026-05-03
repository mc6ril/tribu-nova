import type { AcceptInvitationResult } from "@/domains/project/core/domain/invitation.types";
import type { InvitationGateway } from "@/domains/project/core/ports/invitation.gateway";

export const acceptInvitation = (
  gateway: InvitationGateway,
  token: string
): Promise<AcceptInvitationResult> => {
  return gateway.acceptInvitation(token);
};
