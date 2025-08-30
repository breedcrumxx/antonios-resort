import { options } from "@/app/api/auth/[...nextauth]/options";
import { EdgeStoreProvider } from "@/lib/edgestore";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import PersonalInformationForm from "./components/personal-information-form";
import ProfileImage from "./components/profile-image";

export default async function SettingsPage() {

  const session = await getServerSession(options)

  if (!session) redirect("/signin?callbackUrl=/admin")

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
