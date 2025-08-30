import { options } from "@/app/api/auth/[...nextauth]/options"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import TableTop from "./components/client-table"

export default async function ClientsPage() {

  const session = await getServerSession(options)

  if (!session) redirect("/signin?callbackUrl=/admin")

  return (
    <div className="h-max px-4 overflow-y-scroll scroll">
      <TableTop user={session.user as UserSession} />
    </div>
  )
}