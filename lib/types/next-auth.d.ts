import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      role: Role;
      image: string;
      verified: boolean;
      block: Date;
    } & DefaultSession["user"];
  }
}
