
import PersonalInformationForm from "@/app/admin/(admin)/settings/(user profile)/components/personal-information-form";
import ProfileImage from "@/app/admin/(admin)/settings/(user profile)/components/profile-image";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { EdgeStoreProvider } from "@/lib/edgestore";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DefaultPage() {

  const session = await getServerSession(options)

  if (!session || !session.user) {
    redirect('/signin?callbackUrl=/profile')
  }

  return (
    <EdgeStoreProvider>
      <div className="w-full flex flex-col">
        <div className="flex-grow space-y-2 py-4 px-10">
          <ProfileImage user={session.user as UserSession} />
          <PersonalInformationForm user={session.user as UserSession} />
        </div>
      </div>
    </EdgeStoreProvider>
  )

}