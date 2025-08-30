import type { Metadata } from "next";

// ASSETS
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Antonio's Resort - Sign up",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
    </>
  );
}
