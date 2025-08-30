
import { options } from "@/app/api/auth/[...nextauth]/options"
import { getServerSession } from "next-auth"
import Link from "next/link"
import { redirect } from "next/navigation"
import ResetPasswordForm from "../signin-components/reset-form"

export default async function SignInPage() {

  const session = await getServerSession(options)

  if (session) redirect("/")

  return (
    <>
      <Link
        href='/'
        className="self-start text-xl elegant hover-text-active"
        prefetch>ANTONIO'S</Link>
      <div className="hidden md:block md:flex-grow"></div>
      <ResetPasswordForm />
      <div className="hidden md:block md:flex-grow"></div>
      <br className="block md:hidden" />
      <p className="text-sm">Just remembered the password? <Link href="/signup" className="text-prm cursor-pointer underline" prefetch>Back to login</Link></p>
    </>
  )
}