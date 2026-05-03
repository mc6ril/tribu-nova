"use client";

import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import RouteFallbackPage from "@/shared/design-system/route_fallback_page";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type BoundaryFallbackProps = {
  error: Error;
  reset: () => void;
};

type BoundaryProps = {
  children: ReactNode;
  resetKey: string;
  fallback: (props: BoundaryFallbackProps) => ReactNode;
};

type BoundaryState = {
  error: Error | null;
};

class InternalAppErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App error boundary caught an error", error, errorInfo);
  }

  componentDidUpdate(prevProps: BoundaryProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.reset();
    }
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return this.props.fallback({
        error: this.state.error,
        reset: this.reset,
      });
    }

    return this.props.children;
  }
}

const AppErrorBoundary = ({ children }: AppErrorBoundaryProps) => {
  const t = useTranslations("routeFallback.error");
  const pathname = usePathname() ?? "";

  return (
    <InternalAppErrorBoundary
      resetKey={pathname}
      fallback={({ error, reset }) => (
        <RouteFallbackPage
          tone="error"
          eyebrow={t("eyebrow")}
          statusLabel={t("status")}
          statusValue="500"
          title={t("title")}
          message={t("message")}
          detail={
            process.env.NODE_ENV === "development" ? error.message : undefined
          }
          actions={[
            {
              label: t("primaryAction"),
              ariaLabel: t("primaryActionAriaLabel"),
              onClick: reset,
              variant: "primary",
            },
            {
              label: t("secondaryAction"),
              ariaLabel: t("secondaryActionAriaLabel"),
              href: PAGE_ROUTES.HOME,
              variant: "secondary",
            },
          ]}
        />
      )}
    >
      {children}
    </InternalAppErrorBoundary>
  );
};

export default AppErrorBoundary;
