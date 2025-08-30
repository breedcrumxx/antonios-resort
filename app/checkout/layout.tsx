import type { Metadata } from "next";
import Footer from "../components/footer/footer";
import { EdgeStoreProvider } from "@/lib/edgestore";
import MaintenanceCounter from "../(home)/components/maintenance-counter";
import MaintenanceWrapper from "../(home)/components/maintenance-wrapper";

export const metadata: Metadata = {
  title: "Antonio's Resort | Checkout",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <>
      <MaintenanceWrapper>
        <EdgeStoreProvider>
          {children}
        </EdgeStoreProvider>
        <Footer />
        <div className="fixed w-full bottom-5 flex gap-4 px-5">
          <div className="flex-grow"></div>
          <MaintenanceCounter />
        </div>
      </MaintenanceWrapper>
    </>
  );
}
