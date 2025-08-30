
import AuthSlider from "../admin/components/auth-slider"
import ClientSignInForm from "./signin-components/signin-form"
import Link from "next/link"
import { Card } from "../components/ui/card"
import { getServerSession } from "next-auth"
import { options } from "../api/auth/[...nextauth]/options"
import { redirect } from "next/navigation"
import nom4 from '@/public/home-src/nom4.jpg';
import { logo } from "@/lib/configs/config-file"

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
      <ClientSignInForm />
      <div className="hidden md:block md:flex-grow"></div>
      <br className="block md:hidden" />
      <p className="text-sm">Don&apos;t have an account yet? <Link href="/signup" className="text-prm cursor-pointer underline" prefetch>Sign up</Link></p>
    </>
  )
}