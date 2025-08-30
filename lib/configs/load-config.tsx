'use server'

import { headers } from "next/headers"
import { systemLogger } from "../utils/api-debugger"
import prisma from "../prisma"
import { createUserLog } from "../actions/account-actions/create-user-log"

export const loadConfig = async (target: string, config: string, exist: boolean) => {
  try {

    if (exist) { // update the old configuration
      await prisma.system.update({
        where: {
          name: target,
        },
        data: {
          config: config,
        }
      })

      createUserLog(`Updating ${target}.`)
    } else { // create a new configuration
      await prisma.system.create({
        data: {
          name: target,
          config: config,
        }
      })

      createUserLog(`Creating ${target}.`)
    }

    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), `Loading ${target}.`, "POST", "Fatal", JSON.stringify({ target, config }), "/load-defaults")
    return { status: 500 }
  }
}

export const restoreDefault = async (target: string, config: string) => {
  try {

    await prisma.system.update({
      where: {
        name: target,
      },
      data: {
        config: config,
      }
    })

    createUserLog(`Restoring ${target} defaults.`)

    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), `Restoring ${target} defaults.`, "POST", "Fatal", JSON.stringify({ target, config }), "/load-defaults")
    return { status: 500 }
  }
}