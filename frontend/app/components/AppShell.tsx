"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";

import CommandPalette from "./CommandPalette";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

type LayoutRenderState =
  | "idle"
  | "rendering"
  | "completed";

type LayoutMetrics = {
  routeDepth: number;
  sidebarVisible: boolean;
  navbarVisible: boolean;
};

type LayoutRecoveryState =
  | "healthy"
  | "recovering"
  | "fallback";

type LayoutDiagnostics = {
  recoveryAttempts: number;
  fallbackActivations: number;
  renderFailures: number;
};

function getLayoutState(
  pathname: string | null
) {
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup";

  const isInsightsRoute =
    pathname?.startsWith("/insights") ?? false;

  const hideSidebar =
    isPublicRoute ||
    isInsightsRoute;

  const mainClass =
    hideSidebar
      ? "min-w-0 flex-1 overflow-x-hidden"
      : "min-w-0 flex-1 overflow-x-hidden p-6";

  return {
    isPublicRoute,
    isInsightsRoute,
    hideSidebar,
    mainClass,
  };
}

function buildLayoutMetrics(
  pathname: string | null,
  hideSidebar: boolean,
  isPublicRoute: boolean
): LayoutMetrics {
  return {
    routeDepth:
      pathname?.split("/")
        .length ?? 0,
    sidebarVisible:
      !hideSidebar,
    navbarVisible:
      !isPublicRoute,
  };
}

function createLayoutDiagnostics(): LayoutDiagnostics {
  return {
    recoveryAttempts: 0,
    fallbackActivations: 0,
    renderFailures: 0,
  };
}

function validateLayoutChildren(
  children: React.ReactNode
) {
  return (
    children !== null &&
    children !== undefined
  );
}

function buildFallbackContent() {
  return (
    <div className="flex h-full items-center justify-center p-10 text-center">
      <div>
        <h2 className="text-lg font-semibold">
          Layout Recovery Active
        </h2>

        <p className="text-sm text-slate-500">
          Recovering from a rendering issue.
        </p>
      </div>
    </div>
  );
}

function shouldRenderSidebar(
  hideSidebar: boolean
) {
  return !hideSidebar;
}

function shouldRenderNavbar(
  isPublicRoute: boolean
) {
  return !isPublicRoute;
}

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname =
    usePathname();

  const [
    renderState,
    setRenderState,
  ] =
    useState<LayoutRenderState>(
      "idle"
    );

  const [
    recoveryState,
    setRecoveryState,
  ] =
    useState<LayoutRecoveryState>(
      "healthy"
    );

  const [
    diagnostics,
    setDiagnostics,
  ] = useState(
    createLayoutDiagnostics()
  );

  const {
    isPublicRoute,
    hideSidebar,
    mainClass,
  } = useMemo(
    () =>
      getLayoutState(
        pathname
      ),
    [pathname]
  );

  useEffect(() => {
    setRenderState(
      "rendering"
    );

    const timer =
      window.setTimeout(
        () => {
          setRenderState(
            "completed"
          );
        },
        0
      );

    return () =>
      window.clearTimeout(
        timer
      );
  }, [pathname]);

  const layoutMetrics =
    useMemo(
      () =>
        buildLayoutMetrics(
          pathname,
          hideSidebar,
          isPublicRoute
        ),
      [
        pathname,
        hideSidebar,
        isPublicRoute,
      ]
    );

  const shouldUseFallback =
    !validateLayoutChildren(
      children
    );

  useEffect(() => {
    if (shouldUseFallback) {
      setRecoveryState(
        "fallback"
      );

      setDiagnostics(
        (current) => ({
          ...current,
          fallbackActivations:
            current.fallbackActivations +
            1,
        })
      );
    } else {
      setRecoveryState(
        "healthy"
      );
    }
  }, [shouldUseFallback]);

  return (
    <div className="flex min-h-screen w-full bg-[#f5f7f2]">
      <CommandPalette />

      {shouldRenderSidebar(
        hideSidebar
      ) && <Sidebar />}

      <div className="flex min-w-0 flex-1 flex-col">
        {shouldRenderNavbar(
          isPublicRoute
        ) && (
          <div className="sticky top-0 z-40">
            <TopNavbar />
          </div>
        )}

        <main
          className={
            mainClass
          }
        >
          {shouldUseFallback
            ? buildFallbackContent()
            : children}
        </main>
      </div>

      <div
        className="hidden"
        data-render-state={
          renderState
        }
        data-route-depth={
          layoutMetrics.routeDepth
        }
        data-sidebar-visible={
          layoutMetrics.sidebarVisible
        }
        data-navbar-visible={
          layoutMetrics.navbarVisible
        }
        data-recovery-state={
          recoveryState
        }
        data-recovery-attempts={
          diagnostics.recoveryAttempts
        }
        data-fallback-activations={
          diagnostics.fallbackActivations
        }
        data-render-failures={
          diagnostics.renderFailures
        }
      />
    </div>
  );
}