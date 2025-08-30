import { options } from "@/app/api/auth/[...nextauth]/options";
import { Separator } from "@/app/components/ui/separator";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react";
import HeadTabs from "./components/head-tabs";
import Redirector from "@/lib/utils/redirector";

export default async function Layout({ children }: { children: React.ReactNode }) {

  const session = await getServerSession(options)

  if (!session) {
    redirect('/signin?callback=/profile')
    return null
  }

  return (
    <div className="w-full flex justify-center bg-muted/30 py-10">
      <div className="w-full sm:w-[1000px]">
        <HeadTabs />
        <Separator className="my-8" />
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  )
}