'use client'

import Link, { LinkProps } from "next/link"
import React from "react"

interface TransitionLinkProps extends LinkProps {
  children: React.ReactNode,
  href: string,
}

export default function transitionLink({
  children,
  href,
  ...props
}: TransitionLinkProps) {


  const handleNavigation = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault()
  }

  return (
    <Link
      href={href}
      {...props}
      onClick={handleNavigation}
    >
      {children}
    </Link>
  )
}