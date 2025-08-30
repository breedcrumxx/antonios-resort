'use client'

import { Navbar, NavbarBrand, NavbarContent } from "@nextui-org/react";
import { Steps } from 'antd';
import Link from "next/link";

import { useCheckout } from "../../provider";
import './style.css';
import { logo } from "@/lib/configs/config-file";

export default function CheckoutHeader() {

  const { stepStatus } = useCheckout()

  return (
    <div className="w-full border-1">
      <Navbar
        shouldHideOnScroll={false}
        className="px-0 justify-start"
        classNames={{
          wrapper: "w-full justify-start px-2 sm:px6",
        }}
      >
        <NavbarBrand
          className="w-max"
        >
          <Link href="/" className="flex gap-2 items-center">
            <img
              className="h-[80px] aspect-square"
              src={logo} alt="" />
          </Link>
        </NavbarBrand>
        <NavbarContent
          className="flex-grow flex sm:hidden"
          justify="center"
        >
          <Steps
            type="inline"
            direction="horizontal"
            items={stepStatus}
          />
        </NavbarContent>
        <NavbarContent
          className="flex-grow max-w-[50vw] hidden sm:flex"
          justify="center"
        >
          <Steps
            items={stepStatus}
          />
        </NavbarContent>
        <NavbarContent justify="end" className=""></NavbarContent>
      </Navbar>
    </div>
  )
}