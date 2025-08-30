import { options } from "@/app/api/auth/[...nextauth]/options"
import { logo } from "@/lib/configs/config-file";
import { Spinner } from "@nextui-org/spinner";
import { getServerSession } from "next-auth";
import CollectionViewer from './collection-viewer'
import dynamic from 'next/dynamic';
// const CollectionViewer = dynamic(() => import('./collection-viewer'), {
//   ssr: false,
//   loading: () => (
//     <div className="min-w-screen min-h-screen flex items-center justify-center relative">
//       <Spinner label="Loading gallery..." />
//       <img src={logo} alt="company-logo" className="absolute bottom-0 left-1/2 -translate-x-2/4 h-[150px] w-[150px]" />
//     </div>
//   )
// })

export default async function GalleryViewpage({ params }: { params: { id: string } }) {

  const session = await getServerSession(options)

  return (
    <CollectionViewer
      user={session?.user as UserSession | null}
    />
  )
}