
import Link from "next/link"
import ImageSlider from "../admin/components/auth-slider"
import { ClientSignUpForm } from "./components/signup-form"
import nom4 from '@/public/home-src/nom4.jpg';

export default function SignUpPage() {

  return (
    <div className="w-screen h-screen sm:flex relative">
      {/* <div className="hidden md:block md:w-2/3 sm:min-h-screen h-full bg-prm">
        <ImageSlider />
      </div> */}
      <div className="absolute m-auto inset-0 w-1/3 h-max flex flex-col items-center justify-center p-4 space-y-2 md:relative md:h-full sm:w-1/2">
        <Link
          href='/'
          className="self-start text-xl elegant hover-text-active"
          prefetch>ANTONIO'S</Link>
        <div className="hidden md:block md:flex-grow"></div>
        <ClientSignUpForm />
        <div className="hidden md:block md:flex-grow"></div>
        <br className="block md:hidden" />
        <p className="text-sm">Already have an account? <Link href="/signin" className="text-prm cursor-pointer underline" prefetch>Sign in</Link></p>
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
  )
}