import { options } from "@/app/api/auth/[...nextauth]/options";
// import { UserSessionProvider } from "@/app/providers/user-session";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ChatInbox from "./components/chat-inbox";
import ReloadProvider from "@/app/providers/reloader";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/app/components/ui/resizable";

export default async function Layout({ children }: { children: React.ReactNode }) {

  const session = await getServerSession(options)

  if (!session) {
    redirect('/signin?callbackUrl=/admin/chats')
    return null
  }

  return (
    <ReloadProvider>
      <ResizablePanelGroup
        direction="horizontal"
        className="w-full h-full"
      >
        <ResizablePanel defaultSize={70} maxSize={95} minSize={50}>
          <div className="w-full h-full flex">
            {children}
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={30} maxSize={50} minSize={5}>
          <div className="w-full h-full flex flex-col overflow-hidden bg-white">
            <ChatInbox />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </ReloadProvider>
  )
}