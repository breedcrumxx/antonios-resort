import { options } from "@/app/api/auth/[...nextauth]/options";
import { ComponentNotFound } from "@/app/custom-errors";
import prisma from "@/lib/prisma";
import { systemLogger } from "@/lib/utils/api-debugger";
import { ErrorFeedback } from "@/lib/utils/error-report-modal";
import { discussion } from "@/lib/zod/z-schema";
import { Empty } from "antd";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import z from 'zod';
import RenderDiscussionCards from "./components/discussion-cards";

export default async function MyDiscussionpage() {

  const session = await getServerSession(options)

  if (!session) {
    redirect('/signin?callbackUrl=/profile/discussions')
    return null
  }

  try {
    const data = await prisma.user.findUnique({
      where: {
        id: (session.user as UserSession).id
      },
      select: {
        discussion: {
          include: {
            chats: {
              take: 1,
              orderBy: {
                date: 'desc',
              }
            }
          }
        },
      }
    })

    if (!data) throw new Error("Missing data!")

    if (data.discussion.length == 0) {
      return (
        <div className="w-full flex justify-center py-10">
          <Empty
            description={<p className="font-semibold text-md text-gray-400">No discussions found!</p>}
          />
        </div>
      )
    }

    return (
      <div className="w-full max-h-screen block sm:gap-4 sm:grid sm:grid-cols-3">
        <RenderDiscussionCards data={data.discussion as z.infer<typeof discussion>[]} />
      </div>
    )

  } catch (error) {
    if (error instanceof Error) {
      if (error.message == "Missing data!") {
        return <ComponentNotFound />
      }
    }

    await systemLogger(error, Object.fromEntries(headers()), "Requesting my discussion page.", "GET", "Fatal", "", "/discussion")
    return (
      <div className="w-full max-h-screen flex items-center justify-center">
        <ErrorFeedback
          error={JSON.stringify(error, Object.getOwnPropertyNames(error))}
          code="PAGE-ERR-0004"
          subtitle="An error occured while getting your discussions!"
        />
      </div>
    )
  }
}