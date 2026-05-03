import { createLoggerFactory } from "@/shared/observability";

import WorkspaceTemporaryPage from "@/domains/workspace/presentation/pages/workspace/temporary.page";

const logger = createLoggerFactory().forScope("workspace.page");

export default function WorkspacePage() {
  logger.info("WorkspacePage entry", {
    function: "WorkspacePage",
  });

  return <WorkspaceTemporaryPage />;
}
