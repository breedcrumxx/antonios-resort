'use server'

import { mailOption, transporter } from "@/lib/nodemailer"
import { systemLogger } from "@/lib/utils/api-debugger"
import { render } from "@react-email/render"
import { format } from "date-fns"
import Docxtemplater from "docxtemplater"
import { readFileSync } from "fs"
import { headers } from "next/headers"
import path from "path"
import PizZip from "pizzip"
import { verifyConfig } from "@/lib/configs/verify-config"
import { defaultReservationConfig } from "@/lib/configs/config-file"
import { getBaseUrl } from "@/lib/utils/get-baseurl"
import prisma from "@/lib/prisma"
import ApprovedBookingEmail from "@/lib/email-templates/approved-booking-email"
import { createUserLog } from "@/lib/actions/account-actions/create-user-log"
import { NextResponse } from "next/server"

export async function GET(req: Request, context: { params: { id: string } }) {

  try {

    const baseurl = getBaseUrl()

    const attachments = []

    const dataReservation = await prisma.system.findUnique({
      where: {
        name: "reservationconfig"
      }
    })

    const reservationConf = await verifyConfig(dataReservation, "reservationconfig", defaultReservationConfig)

    const termsdocx = path.resolve("legals/terms-and-conditions.docx")
    const termscontent = readFileSync(termsdocx, "binary");
    const termszip = new PizZip(termscontent);

    const termsdoc = new Docxtemplater(termszip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // update the status of the booking to approved
    const data = await prisma.booking.update({
      where: {
        id: context.params.id
      },
      data: {
        status: "Approved"
      },
      select: {
        bookingid: true,
        packagedata: true,
        client: {
          select: {
            firstname: true,
            lastname: true,
            email: true
          }
        }
      }
    })

    if (JSON.parse(data.packagedata).type != "cottage") {
      const waivercontent = readFileSync("legals/waiver.docx", "binary");
      const waiverzip = new PizZip(waivercontent);

      const waiverdoc = new Docxtemplater(waiverzip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      waiverdoc.render({
        client: data.client.firstname + " " + data.client.lastname,
        package: JSON.parse(data.packagedata).packagename,
        date: format(new Date(), "EEEE MMMM dd, yyyy 'at' h:mm a"),
        amount: reservationConf.securitydeposit,
        paidon: "",
        refundedon: "",
        partialrefundon: "",
        signedon: "",
        manager: reservationConf.manager,
        assistantmanager: reservationConf.assistant,
        image: "No image",
        refundamount: "",
      })

      const waiverbuff = waiverdoc.getZip().generate({
        type: "nodebuffer",
        compression: "DEFLATE",
      });

      attachments.push({
        filename: "waiver.docx",
        content: waiverbuff
      })
    }

    const termsbuff = termsdoc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    const emailData = {
      name: data.client.firstname,
      bookingid: data.bookingid
    }

    // send an email to the user
    const emailHTML = render(<ApprovedBookingEmail baseUrl={baseurl} {...emailData} />)

    await transporter.sendMail({
      ...mailOption,
      to: data.client.email,
      subject: "Booking has been approved!",
      html: emailHTML,
      attachments: [...attachments, {
        filename: "terms-and-condition.docx",
        content: termsbuff
      }]
    })

    createUserLog("Approved a booking.")

    return NextResponse.json({ status: 200 })
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Approving a booking.", "POST", "Fatal", JSON.stringify({ context }), "/approve-booking")
    return NextResponse.json({ status: 500 })
  }

}