import { EdgeStoreProvider } from "@/lib/edgestore";
import { Metadata } from "next";
import NavBarContent from "../components/nav-components/navbar-content";
import { Toaster } from "../components/ui/toaster";

export const metadata: Metadata = {
  title: "Antonio's Resort | New",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <EdgeStoreProvider>
        <NavBarContent />
        {children}
        <Toaster />
      </EdgeStoreProvider>
    </>
  )
}