import type { Metadata } from "next";

// ASSETS
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Antonio's Resort - Reset account",
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
