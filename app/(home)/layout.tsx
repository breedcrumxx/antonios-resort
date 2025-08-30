import Footer from '@/app/components/footer/footer';
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import dynamic from 'next/dynamic';
import { options } from "../api/auth/[...nextauth]/options";
import NavBarContent from '../components/nav-components/navbar-content';
import ChatContextProvider from "./components/client-chat/provider";
import MaintenanceCounter from "./components/maintenance-counter";
import MaintenanceWrapper from "./components/maintenance-wrapper";
import VisitCounter from "./components/visit-counter/visit-counter";
import QueryWrapper from '../providers/query-wrapper';
const FabControls = dynamic(() => import('./components/fab-controls'), {
  ssr: false
})

export const metadata: Metadata = {
  title: "Antonio's Resort",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await getServerSession(options)

  return (
    <QueryWrapper>
      <MaintenanceWrapper>
        <ChatContextProvider>
          <div className="min-w-screen max-w-screen relative z-0">
            <VisitCounter />
            <NavBarContent />
            {children}
            <MaintenanceCounter />
            {/* <FabControls user={(session ? session.user as UserSession : null)} /> */}
            <Footer />
          </div>
        </ChatContextProvider>
      </MaintenanceWrapper>
    </QueryWrapper>
  );
}
