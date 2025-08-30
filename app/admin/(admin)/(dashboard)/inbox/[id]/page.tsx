
import ZoomerContextProvider from "../../bookings/booking-components/zoomer-provider"
import RenderChats from "./components/render-chats"

export default async function ChatsPanel({ params }: {
  params: { id: string },
}) {

  return (
    <ZoomerContextProvider>
      <div className="w-3/5 flex-grow overflow-hidden flex">
        <div className="w-full h-full flex flex-col">
          <RenderChats discussionid={params.id} />
        </div>
      </div>
    </ZoomerContextProvider>
  )
}