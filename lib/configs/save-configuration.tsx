'use server'

import prisma from "../prisma"

export const saveConfiguration = async (config: string) => {
  try {
    await prisma.system.update({
      where: {
        name: 'config'
      },
      data: {
        config: config
      }
    })
    return { status: 200 }
  } catch (error) {
    console.error(error)
    return { status: 500 }
  }
}