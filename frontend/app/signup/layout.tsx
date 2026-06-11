import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
