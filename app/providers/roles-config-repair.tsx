import { rolesconfig } from "@/lib/configs/config-file"
import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { ErrorFeedback } from "@/lib/utils/error-report-modal"
import { headers } from "next/headers"


export default async function RolesConfigRepair({ children }: { children: React.ReactNode }) {

  try {

    const roles = await prisma.role.findMany()

    if (roles.length == 0 || !rolesconfig.every((role) => roles.some((item) => item.role == role.role))) {

      // get the misisng role
      const missingroles = rolesconfig.filter((role) => !roles.some((item) => item.role == role.role))

      // insert missing roles
      await prisma.role.createMany({
        data: missingroles.map((item) => {
          const { id, ...rest } = item
          return rest
        })
      })
    }

    const completeroles = await prisma.role.findMany({ select: { id: true, role: true } })
    const clientrole = completeroles.find((item) => item.role == "Client")

    if (!clientrole) throw new Error("Configuration fails!")

    await prisma.user.updateMany({
      where: {
        roleid: {
          notIn: completeroles.map((item) => item.id)
        }
      },
      data: {
        roleid: clientrole.id,
      }
    })

    return (
      <>
        {children}
      </>
    )

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Restoring system config.", "PUT", "Fatal", JSON.stringify({ rolesconfig }), "/roles-config-repair")

    return (
      <div className="min-w-screen min-h-screen flex items-center">
        <ErrorFeedback
          error={JSON.stringify(error, Object.getOwnPropertyNames(error))}
          code="WRAP-ERR-0003"
          subtitle={"An unknown error occured, please try again later. We will try and fix things in no time!"}
          fatal
        />
      </div>
    )
  }

}