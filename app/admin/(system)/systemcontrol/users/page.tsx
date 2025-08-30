import { options } from "@/app/api/auth/[...nextauth]/options";
import ReloadProvider from "@/app/providers/reloader";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import TableTop from "./components/users-table";

export default async function SystemControlUsers() {

  const session = await getServerSession(options)

  if (!session) {
    redirect("/signin?callbackUrl=/admin")
  }

  return (
    <div className="h-max px-4 overflow-y-scroll scroll">
      <ReloadProvider>
        <TableTop user={session.user as UserSession} />
      </ReloadProvider>
    </div>
  )
}