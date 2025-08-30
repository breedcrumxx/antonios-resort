'use server'

import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { maintenanceschema } from "@/lib/zod/z-schema"
import { headers } from "next/headers"
import { z } from "zod"
import { createUserLog } from "../account-actions/create-user-log"
import { getServerSession } from "next-auth"
import { options } from "@/app/api/auth/[...nextauth]/options"
import { sub } from "date-fns"

export const createMaintenanceSchedule = async (data: z.infer<typeof maintenanceschema>) => {
  try {

    const session = await getServerSession(options)

    if (!session) {
      return { status: 403 }
    }

    const response = await prisma.maintenancerecords.create({
      data: {
        title: data.title,
        memo: data.memo,
        type: data.type, // Immediate | scheduled,
        coverage: data.coverage, // all | website | admin,
        status: "Pending",
        duration: data.duration,
        issuedate: data.issuedate,
        lastupdated: data.lastupdated,
        start: data.start,
        end: data.end,
        initiatorid: (session.user as UserSession).id,
      }
    })

    createUserLog(`Deployed a ${data.type.toLowerCase()} maintenance.`)

    return { status: 200, data: response.id }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), `Creating ${data.type.toLowerCase()} system maintenance schedule.`, "POST", "Minor", JSON.stringify({ data }), "/system-maintenance")
    return { status: 500 }
  }
}

export const getMaintenances = async (id?: string): Promise<{
  status: 200;
  data: {
    title: string;
    duration: number;
    end: Date;
    start: Date;
  }[];
} | {
  status: 500;
}> => {
  try {

    let query = {
      start: {
        gte: sub(new Date(), { days: 7 })
      },
      status: {
        notIn: ["Aborted", "Completed"]
      },
      id: {}
    }
    if (id) {
      query = {
        ...query,
        id: {
          not: id
        }
      }
    }

    const data = await prisma.maintenancerecords.findMany({
      where: {
        ...query
      },
      select: {
        duration: true,
        start: true,
        end: true,
        title: true,
      }
    })

    return { status: 200, data }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), `Requesting maintenances data.`, "GET", "Moderate", "", "/system-maintenance")
    return { status: 500 }
  }
}

export const getActiveMaintenance = async (): Promise<{
  status: 200;
  data: z.infer<typeof maintenanceschema>;
} | {
  status: 201;
  data: z.infer<typeof maintenanceschema>;
} | {
  status: 204
} | {
  status: 500
}> => {
  try {

    const now = new Date();
    const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

    const upcomingMaintenance = await prisma.maintenancerecords.findFirst({
      where: {
        start: {
          lte: fifteenMinutesFromNow,  // Start time is less than or equal to 15 minutes from now
          // gt: now,                      // Start time is greater than the current time
        },
        status: 'Pending',              // Optionally, filter by status if needed
      },
      orderBy: {
        start: 'asc',                   // Sort by start time in ascending order
      },
    });

    if (!upcomingMaintenance) return { status: 204 }

    if (upcomingMaintenance.start.getTime() <= new Date().getTime() && upcomingMaintenance.end.getTime() > new Date().getTime()) { // maintenance time is within current time range
      const updatedresponse = await prisma.maintenancerecords.update({
        where: {
          id: upcomingMaintenance.id
        },
        data: {
          status: "On-process"
        }
      })

      return { status: 201, data: updatedresponse as z.infer<typeof maintenanceschema> }
    } if (upcomingMaintenance.start.getTime() < new Date().getTime()) { // maintenance had pass
      await prisma.maintenancerecords.update({
        where: {
          id: upcomingMaintenance.id
        },
        data: {
          status: "Completed"
        }
      })

      return { status: 204 }
    }

    return { status: 200, data: upcomingMaintenance as z.infer<typeof maintenanceschema> }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting active maintenance.", "GET", "Moderate", "", "/system-maintenance")
    return { status: 500 }
  }
}

export const updateSystemMaintenance = async (values: z.infer<typeof maintenanceschema>) => {
  try {

    await prisma.maintenancerecords.update({
      where: {
        id: values.id
      },
      data: {
        start: values.start,
        end: values.end,
        duration: values.duration,
        lastupdated: new Date(),
      }
    })

    await createUserLog("Rescheduled a maintenance.")

    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Rescheduling a maintenance.", "POST", "Moderate", JSON.stringify({ values }), "/system-maintenance")
    return { status: 500 }
  }
}

export const abortSystemMaintenance = async (id: string) => {
  try {

    await prisma.maintenancerecords.updateMany({
      where: {
        id: id
      },
      data: {
        status: "Aborted",
        lastupdated: new Date()
      }
    })

    createUserLog("Aborted a maintenance.")

    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Aborting a maintenance.", "POST", "Fatal", JSON.stringify({ id }), "/system-maintenance")
    return { status: 500 }
  }
}

export const getLastMaintenance = async (): Promise<{
  status: 200;
  data: {
    id: string;
    title: string;
    memo: string;
    type: string;
    coverage: string;
    status: string;
    duration: number;
    issuedate: Date;
    lastupdated: Date;
    start: Date;
    end: Date;
    initiatorid: string;
  } | null
} | {
  status: 500
}> => {
  try {
    const data = await prisma.maintenancerecords.findFirst({
      where: {
        status: "Completed"
      },
      orderBy: {
        start: 'desc'
      }
    })
    return { status: 200, data: data }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting maintenance data.", "GET", "Minor", "", "/system-maitenance")
    return { status: 500 }
  }
}