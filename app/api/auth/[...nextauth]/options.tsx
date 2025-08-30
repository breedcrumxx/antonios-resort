import prisma from "@/lib/prisma";
import bcrypt from 'bcrypt';
import { sub } from "date-fns";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from 'next-auth/providers/credentials';

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "login",
      name: "credentials",
      credentials: {
        email: { label: "Username", type: "text", placeholder: "Your username" },
        password: { label: "Password", type: "password", placeholder: "Your password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            role: true
          }
        })

        if (!user) {
          throw new Error("404")
        }

        const passwordMatched = await bcrypt.compare(credentials.password, user.password)

        if (!passwordMatched) {
          throw new Error("422")
        }

        return { id: user.id.toString(), name: user.firstname + " " + user.lastname, email: user.email, role: user.role, image: "", verified: user.verified, block: user.block }
      }
    }),
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      const currentuser = user as UserSession

      if (!currentuser.verified) {
        const encodedemail = btoa(currentuser.email)
        throw new Error(`/unverified?data=${encodeURI(encodedemail)}`)
      }

      if (currentuser.block && new Date(currentuser.block).getTime() > new Date().getTime()) {
        throw new Error("/blocked")
      }

      return true
    },
    async jwt({ token, user, trigger }) {
      let image = ""
      let block = null
      let role = user ? (user as UserSession).role : (token.user as UserSession).role

      // console.log('@token: ', token)
      // console.log('@user: ', user)

      if (user) { // initial login
        return { ...token, user }
      }

      try {
        const data = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: {
            image: true,
            block: true,
            role: true,
          }
        })

        if (data) {
          image = data.image
          block = data.block
          role = data.role
        }
      } catch (error) {
        console.error(error)
      }

      return {
        ...token,
        exp: Math.floor(sub(new Date(), { days: 7 }).getTime() / 1000),
        user: { ...token.user as UserSession, image, block, role }
      }
    },
    async session({ session, token }) {
      // console.log("@session")
      // console.log(session)
      // console.log(token)
      if (token.user) { // initial login
        const block = (token.user as UserSession).block
        if (block && new Date(block).getTime() > new Date().getTime()) { // retun null when the account is blocked
          throw Error()
        }

        return { user: token.user, expires: session.expires }
      } else { // token update
        const block = (session.user as UserSession).block
        if (block && new Date(block).getTime() > new Date().getTime()) { // retun null when the account is blocked
          throw Error()
        }
      }

      return session
    }
  },
  pages: {
    signIn: '/signin',
    signOut: '/',
  },
} satisfies NextAuthOptions