import { options } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import Collections from "./components/collections";

export default async function GalleryPage() {

  const session = await getServerSession(options)

  return (
    <div className="min-w-screen">
      <div className="w-full flex justify-center">
        <div className="w-[1000px] block space-y-4 sm:space-y-0 py-10 sm:grid grid-cols-3 auto-rows-[400px] sm:py-10 gap-4">
          <Collections user={(session?.user as UserSession | null)} />
        </div>
      </div>
    </div>
  )
}