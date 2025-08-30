import { options } from "@/app/api/auth/[...nextauth]/options";
import { Toaster } from "@/app/components/ui/toaster";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import DevConfig from "@/app/providers/dev-configuration";
import { SideBarProvider } from "../../components/navigation-components/provider";
import SideBarToggler from "../../components/navigation-components/sidebar-toggler";
import HeaderMenu from "../../components/navigation-components/header-menu";

export const metadata: Metadata = {
  title: "Antonio's Resort | System",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await getServerSession(options)

  if (!session) {
    redirect("/signin?callbackUrl=/admin")
  }

  const user = session.user as UserSession

  if (!user.role.systemcontrol && !user.role.businesscontrol) {
    redirect("/");
  }

  return (
    <DevConfig>
      <SideBarProvider>
        <div className="w-screen flex h-screen">
          <SideBarToggler user={user as UserSession} />
          {/* container */}
          <div className="w-full h-full flex flex-col">
            <HeaderMenu user={user as UserSession} />
            <div className="flex-grow flex flex-col overflow-hidden">
              {children}
            </div>
          </div>
          <Toaster />
        </div>
      </SideBarProvider>
    </DevConfig>
  );
}
