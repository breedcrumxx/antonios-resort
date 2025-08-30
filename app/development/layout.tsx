import { getServerSession } from "next-auth"
import { options } from "../api/auth/[...nextauth]/options"
import { redirect } from "next/navigation"

export default async function Layout({ children }: { children: React.ReactNode }) {

  const session = await getServerSession(options)

  if (!session) redirect('/')

  const user = session.user as UserSession

  if (!user.role.systemcontrol) redirect("/")

  return (
    <>
      {children}
    </>
  )
}