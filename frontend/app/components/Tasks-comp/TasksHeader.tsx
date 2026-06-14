"use client";

import React, { useMemo } from "react";

const HEADER_ACTIONS = [
  {
    id: "notifications",
    icon: "notifications",
    ariaLabel: "Notifications",
  },
] as const;

export default function TasksHeader() {
  const profileImage = useMemo(
    () =>
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCkg4vnO8f5CYXs98lXGmEBvpJyvEeFPY6KpI0D_WhJwkurBhewAXswpL7cAddlTuhyR3U9Yk7rCC4QV5tyDr0o5el9lVbLOgvEy_qlV0DyU9TlHmMDHO4uZFtQcTplFQsXMmQOR-dZXVcZUPmKq_m27_2QK0GkIeecDTElHOJNFY7pLXTxpxz2cAsyUuYpFz_aAdJmFIESRW7TrFVHQ8zx3z2-_8VPIKY6tZawlDn4j6nMx6noasR9sKFo1YvfhZp-qJ3HPbjktw5E",
    []
  );

  const searchPlaceholder = useMemo(
    () => "Search tasks...",
    []
  );

  const headerTitle = useMemo(
    () => "Flow Insights",
    []
  );

  return (
    <header
      className="
        flex items-center justify-between
        w-full h-20 shrink-0
        px-4 md:px-margin-desktop
        border-b border-outline-variant
        bg-white
      "
    >
      {/* Page Title */}
      <div className="flex items-center">
        <h1 className="font-headline-md text-[26px] font-bold text-on-surface">
          {headerTitle}
        </h1>
      </div>

      {/* Search + Actions */}
      <div className="flex items-center gap-6">
        <div
          className="
            hidden md:flex items-center
            rounded-xl border border-outline-variant/50
            bg-surface-container-low/50
            px-4 py-2
            backdrop-blur
          "
        >
          <span className="material-symbols-outlined text-[20px] text-outline">
            search
          </span>

          <input
            type="text"
            placeholder={searchPlaceholder}
            className="
              w-48 border-none bg-transparent
              text-body-md font-body-md
              placeholder:text-outline
              focus:ring-0 focus:outline-none
            "
          />
        </div>

        <div className="flex items-center gap-3">
          {HEADER_ACTIONS.map((action) => (
            <button
              key={action.id}
              aria-label={action.ariaLabel}
              className="
                rounded-full p-2.5
                text-on-surface-variant
                transition-all
                hover:bg-surface-container-low
              "
            >
              <span className="material-symbols-outlined text-[22px]">
                {action.icon}
              </span>
            </button>
          ))}

          <img
            alt="User profile"
            src={profileImage}
            className="
              ml-2 h-9 w-9 rounded-full
              border-2 border-surface shadow-sm
            "
          />
        </div>
      </div>
    </header>
  );
}