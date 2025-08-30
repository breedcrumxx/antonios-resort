'use client';

import { defaultprofile, logo } from "@/lib/configs/config-file";
import clsx from 'clsx';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { LogOut, Menu, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import '../../globals.css';

const excludedPaths = [
  '/custom',
  '/package',
  '/profile',
  '/reschedule',
  '/scan',
  '/rate',
  '/unverified',
  '/verify',
  '/coupons',
  '/about',
  '/gallery',
  '/faq'
]

export default function NavBarContent() {

  const pathname = usePathname()
  const { scrollY } = useScroll()
  const { data: session } = useSession()
  const user = session?.user as UserSession | null

  // states
  const [isPure, setIsPure] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (val) => {
    const prev = scrollY.getPrevious() || 0;
    if (val == 0 && prev == 0) return
    if (val > 50) { // this will toggle the nav background to pure white
      setIsPure(true)
    }
    else { // return to blurred when less than 50
      setIsPure(false)
    }
  })

  useEffect(() => {
    const elem = document.querySelector<HTMLBodyElement>('body')

    if (isMenuOpen) {
      (elem as HTMLBodyElement).style.pointerEvents = "none";
      (elem as HTMLBodyElement).style.overflowY = 'hidden';
    } else {
      (elem as HTMLBodyElement).style.overflowY = 'auto';
      (elem as HTMLBodyElement).style.pointerEvents = "auto";
    }

  }, [isMenuOpen])

  return (
    <>
      <div className={clsx('w-full fixed z-[100] text-white', { 'sticky': excludedPaths.some(x => pathname.includes(x)) })}>
        <div
          className={clsx("hidden sm:flex h-[4rem] w-full border-b border-divider 0 px-0 justify-start flex items-center justify-center transition-all", {
            "bg-white": isPure
          })}
        >
          <div className={clsx("w-[1200px] h-full grid grid-cols-3", {
            "text-black": isPure || excludedPaths.some(x => pathname.includes(x)),
            "text-white": !isPure && !excludedPaths.some(x => pathname.includes(x))
          })}>
            <div className='flex items-center'>
              <Link href="/" className={clsx("text-4xl hidden sm:block cursor-pointer elegant", {
                "hover-text-active": pathname == '/'
              })}>ANTONIO&apos;S</Link>
            </div>

            <div className="w-full flex justify-between items-center text-sm">
              <Link
                className="relative group"
                href="/package"
                prefetch>
                <span className={clsx("hover-text-prm", {
                  "hover-text-active": pathname.includes('/package')
                })}>
                  Packages
                </span>
                <div className="absolute w-full h-[2px] scale-x-0 group-hover:scale-x-100 transition-all bg-prm"></div>
              </Link>
              <Link
                className="relative group"
                href="/coupons"
                prefetch>
                <span className={clsx("hover-text-prm", {
                  "hover-text-active": pathname.includes('/coupons')
                })}>
                  Coupons
                </span>
                <div className="absolute w-full h-[2px] scale-x-0 group-hover:scale-x-100 transition-all bg-prm"></div>
              </Link>
              <Link
                className="relative group"
                href="/scan"
                prefetch>
                <span className={clsx("hover-text-prm", {
                  "hover-text-active": pathname.includes('/scan')
                })}>
                  Scan
                </span>
                <div className="absolute w-full h-[2px] scale-x-0 group-hover:scale-x-100 transition-all bg-prm"></div>
              </Link>
              <Link
                className="relative group"
                href="/gallery"
                prefetch>
                <span className={clsx("hover-text-prm", {
                  "hover-text-active": pathname.includes('/gallery')
                })}>
                  Gallery
                </span>
                <div className="absolute w-full h-[2px] scale-x-0 group-hover:scale-x-100 transition-all bg-prm"></div>
              </Link>
              <Link
                className="relative group"
                href="/faq"
                prefetch>
                <span className={clsx("hover-text-prm", {
                  "hover-text-active": pathname.includes('/faq')
                })}>
                  FAQ
                </span>
                <div className="absolute w-full h-[2px] scale-x-0 group-hover:scale-x-100 transition-all bg-prm"></div>
              </Link>
              <Link
                className="relative group"
                href="/about"
                prefetch>
                <span className={clsx("hover-text-prm", {
                  "hover-text-active": pathname.includes('/about')
                })}>
                  About
                </span>
                <div className="absolute w-full h-[2px] scale-x-0 group-hover:scale-x-100 transition-all bg-prm"></div>
              </Link>
            </div>

            <div className={clsx("flex justify-end gap-2 items-center")}>
              {
                session ? (
                  <>
                    <Link
                      href="/profile"
                      className="relative group">
                      <span className="hover-text-prm">
                        {user?.name}
                      </span>
                      <div className="absolute w-full h-[2px] scale-x-0 group-hover:scale-x-100 transition-all bg-prm"></div>
                    </Link>
                    <div className="flex aspect-square items-center gap-2 text-red-500 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-300/30" onClick={() => signOut()}>
                      <LogOut className="w-4 h-4" />
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      className={clsx("py-2 px-3 rounded-lg text-sm font-normal transition-all", {
                        "hover:bg-white/40": !isPure,
                        "bg-gray-300/30 hover:bg-gray-200": excludedPaths.some(x => pathname.includes(x))
                      })}
                      href="/signin"
                      prefetch
                    >Login</Link>
                    <Link
                      href="/signup"
                      className={clsx("bg-prm font-normal rounded-lg py-2 px-3 text-sm transition-all", {
                        "hover:bg-white hover:text-black": !isPure,
                        "hover:bg-gray-300 hover:bg-opacity-30 text-white": excludedPaths.some(x => pathname.includes(x))
                      })}>Sign-up</Link>
                  </>
                )
              }
            </div>
          </div>
        </div>

        <div className="block sm:hidden w-full h-[4rem] bg-white flex border-b px-4 relative">
          <div className='flex-grow flex justify-start items-center'>
            <Menu
              className="h-8 w-8 text-black"
              onClick={() => setIsMenuOpen(true)}
            />
          </div>
          <div className='flex-grow flex justify-center items-center'>
            <Link
              className="text-[1.4rem] cursor-pointer elegant text-prm"
              href="/"
            >ANTONIO&apos;S</Link>
          </div>
          <div className="flex-grow flex justify-end items-center">
            {
              session ? (
                <Link
                  href="/profile"
                  className="h-[70%] aspect-square rounded-full bg-gray-500 relative border overflow-hidden"
                  prefetch
                >
                  <Image
                    fill
                    src={(session.user as UserSession).image || defaultprofile}
                    alt="profile-picture"
                  />
                </Link>
              ) : (
                <Link
                  className="font-normal text-black bg-prm text-white py-2 px-3 rounded-md"
                  href="/signin"
                  prefetch
                >Login</Link>
              )
            }
          </div>

        </div>

        <AnimatePresence>
          {
            isMenuOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed w-full h-dvh overflow-hidden z-[100] bg-black/30 top-0 left-0 pointer-events-auto">

                <motion.div
                  className="w-2/3 bg-white h-[100%] flex flex-col border-r"
                  initial={{ translateX: '-100%' }}
                  exit={{ translateX: '-100%' }}
                  animate={{ translateX: '0%' }}
                  transition={{
                    x: { type: 'spring', bounce: 0 }
                  }}
                >
                  <div className="h-[4rem] w-full border-b flex items-center px-4">
                    <X
                      className='h-8 w-8 text-black'
                      onClick={() => setIsMenuOpen(false)}
                    />
                  </div>
                  <Link
                    href="/"
                    prefetch
                  >
                    <img
                      src={logo}
                      alt="company-logo"
                      className="animate-test h-[100px] w-[100px]" />
                  </Link>
                  <div className='flex flex-col space-y-2 text-black text-xl p-4'>
                    <Link
                      className="relative group"
                      href="/package"
                      prefetch>
                      <span className={clsx("hover-text-prm", {
                        "hover-text-active": pathname.includes('/package')
                      })}>
                        Packages
                      </span>
                      <div className="absolute w-full h-[2px] scale-x-0 group-hover:scale-x-100 transition-all bg-prm"></div>
                    </Link>
                    <Link
                      className="relative group"
                      href="/coupons"
                      prefetch>
                      <span className={clsx("hover-text-prm", {
                        "hover-text-active": pathname.includes('/coupons')
                      })}>
                        Coupons
                      </span>
                      <div className="absolute w-full h-[2px] scale-x-0 group-hover:scale-x-100 transition-all bg-prm"></div>
                    </Link>
                    <Link
                      className="relative group"
                      href="/scan"
                      prefetch>
                      <span className={clsx("hover-text-prm", {
                        "hover-text-active": pathname.includes('/scan')
                      })}>
                        Scan
                      </span>
                      <div className="absolute w-full h-[2px] scale-x-0 group-hover:scale-x-100 transition-all bg-prm"></div>
                    </Link>
                    <Link
                      className="relative group"
                      href="/gallery"
                      prefetch>
                      <span className={clsx("hover-text-prm", {
                        "hover-text-active": pathname.includes('/gallery')
                      })}>
                        Gallery
                      </span>
                      <div className="absolute w-full h-[2px] scale-x-0 group-hover:scale-x-100 transition-all bg-prm"></div>
                    </Link>
                    <Link
                      className="relative group"
                      href="/faq"
                      prefetch>
                      <span className={clsx("hover-text-prm", {
                        "hover-text-active": pathname.includes('/faq')
                      })}>
                        FAQ
                      </span>
                      <div className="absolute w-full h-[2px] scale-x-0 group-hover:scale-x-100 transition-all bg-prm"></div>
                    </Link>
                    <Link
                      className="relative group"
                      href="/about"
                      prefetch>
                      <span className={clsx("hover-text-prm", {
                        "hover-text-active": pathname.includes('/about')
                      })}>
                        About
                      </span>
                      <div className="absolute w-full h-[2px] scale-x-0 group-hover:scale-x-100 transition-all bg-prm"></div>
                    </Link>
                  </div>
                  <div className='flex-grow'></div>
                  <div className='h-[4rem] w-full border-t flex px-4 gap-2'>
                    {
                      session ? (
                        <>
                          <Link
                            href="/profile"
                            className="flex-grow my-auto"
                            prefetch
                          >
                            <p className="text-black capitalize font-semibold text-md">{(session.user as UserSession).name}</p>
                            <p className="text-black">{(session.user as UserSession).email}</p>
                          </Link>
                          <div className="flex-grow"></div>
                          <div className="flex h-[70%] my-auto justify-center aspect-square rounded-full bg-gray-300/30 items-center gap-2 text-red-500 rounded-full" onClick={() => signOut()}>
                            <LogOut className="w-4 h-4" />
                          </div>
                        </>
                      ) : (
                        <Link
                          className="h-max my-auto font-normal text-black bg-prm text-white py-2 px-3 rounded-md"
                          href="/signin"
                          prefetch
                        >
                          Login
                        </Link>
                      )
                    }
                  </div>
                </motion.div>

              </motion.div>
            )
          }
        </AnimatePresence>

      </div>
    </>
  );
}