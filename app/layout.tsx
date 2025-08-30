import type { Metadata } from "next";
import { Inter } from "next/font/google";

// ASSETS
import './configuration.css';
import "./globals.css";
import RolesConfigRepair from "./providers/roles-config-repair";
import DevConfig from "./providers/dev-configuration";
import SessionWrapper from "./providers/session-wrapper";
import { cormorant } from "./fonts";
import { SimpleNotificationProvider } from "./components/custom/simple-notification";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Antonio's Resort",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <SessionWrapper>
        <DevConfig>
          <RolesConfigRepair>
            <body className={`${inter.className} ${cormorant.variable} font-sans`}>
              <SimpleNotificationProvider>
                {children}
              </SimpleNotificationProvider>
            </body>
          </RolesConfigRepair>
        </DevConfig>
      </SessionWrapper>
    </html>
  );
}
