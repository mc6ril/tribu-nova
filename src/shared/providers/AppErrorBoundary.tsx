"use client";

import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";
import { usePathname } from "next/navigation";

import RouteFallbackPage from "@/shared/design-system/route_fallback_page";
import { getFallbackMessages } from "@/shared/i18n/fallbackMessages";
import { buildHomePath } from "@/shared/i18n/publicPaths";
import { useRuntimeLocaleSnapshot } from "@/shared/i18n/useRuntimeLocaleSnapshot";

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
  const locale = useRuntimeLocaleSnapshot();
  const pathname = usePathname() ?? "";
  const copy = getFallbackMessages(locale).error;
  const homePath = buildHomePath(locale);

  return (
    <InternalAppErrorBoundary
      resetKey={pathname}
      fallback={({ error, reset }) => (
        <RouteFallbackPage
          tone="error"
          eyebrow={copy.eyebrow}
          statusLabel={copy.status}
          statusValue="500"
          title={copy.title}
          message={copy.message}
          detail={
            process.env.NODE_ENV === "development" ? error.message : undefined
          }
          actions={[
            {
              label: copy.primaryAction,
              ariaLabel: copy.primaryActionAriaLabel,
              onClick: reset,
              variant: "primary",
            },
            {
              label: copy.secondaryAction,
              ariaLabel: copy.secondaryActionAriaLabel,
              href: homePath,
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
