import nom4 from '@/public/home-src/nom4.jpg';
import type { Metadata } from "next";

import "@/app/globals.css";
export const metadata: Metadata = {
  title: "Antonio's Resort - Sign in",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-screen h-screen sm:flex relative">
      <div className="absolute flex flex-col items-center justify-center w-1/3 p-4 space-y-2 md:relative md:h-full border">
        {children}
      </div>
      <div className="sm:w-full md:w-2/3 sm:min-h-screen h-full p-4 relative">
        <img
          src={nom4.src}
          className="image h-full w-full inset-0 object-cover object-center rounded-lg overflow-hidden"
        />
        <div className="absolute top-0 left-0 h-full w-full flex flex-col justify-end items-end p-8 z-1 bg-black/30">
        </div>
      </div>
    </div>
  );
}
