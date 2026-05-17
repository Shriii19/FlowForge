"use client";

import React from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import { NavItems, navItems } from "../lib/navItems";

const NavBar: React.FC = () => {
    const pathname = usePathname();

    return (
        <nav className="flex gap-6 border-b border-gray-200 px-4 py-3">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                      key={item.href}
                      href={item.href}
                    className={`px-3 py-1 text-sm font-medium transition-colors ${
                    isActive
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}

                    >
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    )


}

export default NavBar;