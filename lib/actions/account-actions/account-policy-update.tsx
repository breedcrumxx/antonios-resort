"use server"

import bcrypt from 'bcrypt'

import { defaultPrivacyPolicy, defaultTermsCondition, PolicyType } from '@/lib/configs/config-file'
import { verifyConfig } from '@/lib/configs/verify-config'
import { systemLogger } from '@/lib/utils/api-debugger'
import { headers } from 'next/headers'
import prisma from '../../prisma'
import { createUserLog } from './create-user-log'

export const checkAccountAcceptedPolices = async (email: string, password: string): Promise<{
  status: 401 | 404 | 500;
} | {
  status: 403;
  data: string[];
} | {
  status: 200;
}> => {
  try {
    const account = await prisma.user.findUnique({
      where: {
        email: email
      },
      select: {
        email: true,
        password: true,
        lastacceptedprivacy: true,
        lastacceptedtermscondition: true,
      }
    })

    if (!account) return { status: 404 } // no account matched

    const passwordMatched = await bcrypt.compare(password, account.password)

    if (!passwordMatched) return { status: 401 } // wrong password or email

    // check the policy dates
    const policies = await prisma.system.findMany({
      where: {
        name: {
          in: ["termscondition", "privacypolicy"]
        },
      }
    })

    const dataPrivacy = policies.find((item) => item.name == "privacypolicy")
    const dataTerms = policies.find((item) => item.name == "termscondition")

    const privacypolicy = await verifyConfig<PolicyType>(dataPrivacy, "privacypolicy", defaultPrivacyPolicy)
    const termscondition = await verifyConfig<PolicyType>(dataTerms, "termscondition", defaultTermsCondition)

    let toaccept: string[] = []

    if (new Date(privacypolicy.lastupdated).getTime() > new Date(account.lastacceptedprivacy).getTime()) toaccept.push("privacypolicy") // add the privacy policy as to accept in the login
    if (new Date(termscondition.lastupdated).getTime() > new Date(account.lastacceptedtermscondition).getTime()) toaccept.push("termscondition")

    if (toaccept.length > 0) return { status: 403, data: toaccept } // cancel to login and show the checkboxes

    return { status: 200 } // cleared

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Verifing policies.", "GET", "Fatal", "", "/account-policy-update")
    return { status: 500 }
  }
}

export const updateAccountAcceptedPolicies = async (email: string, accepted: { name: string, accept: boolean }[]) => {
  try {
    let dataupdate: any = {}

    if (accepted.some((x) => x.name == "privacypolicy")) dataupdate = { lastacceptedprivacy: new Date() }
    if (accepted.some((x) => x.name == "termscondition")) dataupdate = { ...dataupdate, lastacceptedtermscondition: new Date() }

    await prisma.user.update({
      where: {
        email: email
      },
      data: dataupdate
    })

    createUserLog("Accepted updated policies.")
    return { status: 200 }

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Updating user accepted policies.", "POST", "Fatal", "", "/account-policy-update")
    return { status: 500 }
  }
}

export const getAcceptedDates = async (userid: string): Promise<{
  status: 404 | 500,
} | {
  status: 200,
  data: {
    lastacceptedprivacy: Date;
    lastacceptedagreement: Date | null;
    lastacceptedtermscondition: Date;
  }
}> => {
  try {
    const data = await prisma.user.findUnique({
      where: {
        id: userid
      },
      select: {
        lastacceptedprivacy: true,
        lastacceptedagreement: true,
        lastacceptedtermscondition: true,
      }
    })

    if (!data) return { status: 404 }

    return { status: 200, data }


  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Getting latest accepted agreement and policy dates.", "GET", "Fatal", "", "/account-policy-update")
    return { status: 500 }
  }
}