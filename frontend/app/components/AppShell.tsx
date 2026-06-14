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
          {children}
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
      />
    </div>
  );
}