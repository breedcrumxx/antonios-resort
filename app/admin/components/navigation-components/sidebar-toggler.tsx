
import { defaultprofile, logo } from "@/lib/configs/config-file";
import clsx from "clsx";
import Image from 'next/image';
import Link from "next/link";
import LinkMapper from './link-mapper';
import LogoutBtn from './logout-btn';

export default async function SideBarToggler({ user }: { user: UserSession }) {

  return (
    <div className={clsx("border-r flex flex-col h-full w-3/12 bg-muted/40")}>
      <div className="hidden md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <img src={logo} className="h-12 w-auto" alt="" />
              <span className="elegant text-xl">Antonio&apos;s Resort</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <LinkMapper user={user as UserSession} />
            </nav>
          </div>
        </div>
      </div>
      <div className="flex-grow"></div>
      <div className="border-t w-full h-[50px] flex items-center gap-2 px-5">
        <Link href={user.role.systemcontrol ? "/admin/systemcontrol/profile" : "/admin/settings"} replace>
          <div className="h-[40px] w-[40px] rounded-[50%] bg-gray-500 aspect-square relative border overflow-hidden cursor-pointer">
            <Image
              fill
              src={user.image || defaultprofile}
              alt="profile-picture"
              className=""
            />
          </div>
        </Link>
        <div className="text-sm">
          <p className="font-medium">{user?.name}</p>
          <p className="text-xs">{user?.role.role}</p>
        </div>
        <div className="flex-grow"></div>
        <LogoutBtn />
      </div>
    </div>
  )
}

