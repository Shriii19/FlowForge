"use client";

import React, {
  useMemo,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "../../lib/navItems";

type NavigationState = {
  activePath: string;
  previousPath: string;
  transitionCount: number;
};

function createNavigationState(
  pathname: string
): NavigationState {
  return {
    activePath: pathname,
    previousPath: "",
    transitionCount: 0,
  };
}

function isNavigationActive(
  currentPath: string,
  itemPath: string
) {
  return (
    currentPath === itemPath ||
    currentPath.startsWith(
      `${itemPath}/`
    )
  );
}

const NavBar: React.FC = () => {
  const pathname = usePathname();

  const [
    navigationState,
    setNavigationState,
  ] = useState<NavigationState>(
    createNavigationState(
      pathname ?? ""
    )
  );

  useEffect(() => {
    setNavigationState(
      (previous) => ({
        activePath:
          pathname ?? "",
        previousPath:
          previous.activePath,
        transitionCount:
          previous.transitionCount + 1,
      })
    );
  }, [pathname]);

  const navigationItems =
    useMemo(
      () =>
        navItems.map((item) => ({
          ...item,
          isActive:
            isNavigationActive(
              navigationState.activePath,
              item.href
            ),
        })),
      [navigationState.activePath]
    );

  return (
    <nav className="flex gap-6 border-b border-gray-200 px-4 py-3">
      <div className="hidden">
        {navigationState.transitionCount}
      </div>

      {navigationItems.map(
        (item) => {
          return (
            <Link
              key={item.href}
              href={item.href}
              data-active={
                item.isActive
              }
              data-route={
                item.href
              }
              className={`px-3 py-1 text-sm font-medium transition-colors ${
                item.isActive
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {item.label}
            </Link>
          );
        }
      )}
    </nav>
  );
};

export default NavBar;