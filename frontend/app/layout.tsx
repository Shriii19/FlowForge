import "./globals.css";
import type { Metadata } from "next";
import AppShell from "@/app/components/AppShell";
import { ToastProvider } from "@/app/context/ToastContext";

export const metadata: Metadata = {
  title: {
    default: "FlowForge",
    template: "%s — FlowForge",
  },
  description:
    "Kanban boards, team chat, and project tracking — without the extra tools you don't need.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}